import Anthropic from '@anthropic-ai/sdk';
import { pool } from '../db/index.js';
import { config } from '../config.js';
import { searchPublicChunks } from './ragService.js';
import { mapStudentMachineStatus } from './ingestion.js';

let anthropicClient = null;

function getAnthropicClient() {
  if (!anthropicClient && config.anthropic.apiKey && config.anthropic.apiKey !== 'test_key_or_replace_with_real') {
    anthropicClient = new Anthropic({
      apiKey: config.anthropic.apiKey
    });
  }
  return anthropicClient;
}

// Scoped tools definition for Anthropic API
export const TOOLS = [
  {
    name: 'get_my_bookings',
    description: "Retrieve the student's last 10 laundry machine bookings with status, slot time, and machine number.",
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_transaction_status',
    description: "Get the payment and refund status for a specific booking or payment transaction by its ID.",
    input_schema: {
      type: 'object',
      properties: {
        transaction_id: {
          type: 'integer',
          description: 'The booking or payment ID to look up'
        }
      },
      required: ['transaction_id']
    }
  },
  {
    name: 'get_machine_status',
    description: 'Get the current user-facing status of a specific washing machine or dryer.',
    input_schema: {
      type: 'object',
      properties: {
        machine_id: {
          type: 'integer',
          description: 'The machine ID to query'
        }
      },
      required: ['machine_id']
    }
  }
];

// Server-side tool execution scoped strictly to authenticated student
export async function executeTool(toolName, toolInput, studentId) {
  if (toolName === 'get_my_bookings') {
    // Return last 10 bookings - strictly excluding personal data
    const res = await pool.query(`
      SELECT id, machine_id, slot_start, slot_end, status, amount_paise, created_at
      FROM bookings
      WHERE student_id = $1
      ORDER BY created_at DESC
      LIMIT 10
    `, [studentId]);

    return res.rows.map(b => ({
      booking_id: b.id,
      machine_id: b.machine_id,
      slot_start: b.slot_start,
      slot_end: b.slot_end,
      status: b.status,
      amount_inr: (b.amount_paise / 100).toFixed(2),
      created_at: b.created_at
    }));
  }

  if (toolName === 'get_transaction_status') {
    const txId = parseInt(toolInput.transaction_id, 10);
    if (!txId) {
      return { error: 'Invalid transaction ID provided' };
    }

    // Check ownership on the server: transaction must belong to authenticated student
    const res = await pool.query(`
      SELECT b.id as booking_id, b.status as booking_status, b.amount_paise,
             p.status as payment_status, p.razorpay_payment_id,
             r.reason_code, r.status as refund_status, r.razorpay_refund_id
      FROM bookings b
      LEFT JOIN payments p ON b.id = p.booking_id
      LEFT JOIN refunds r ON b.id = r.booking_id
      WHERE (b.id = $1 OR p.id = $1) AND b.student_id = $2
    `, [txId, studentId]);

    if (res.rows.length === 0) {
      return { error: 'Transaction not found or access unauthorized' };
    }

    const row = res.rows[0];
    const explanation = row.reason_code ? (config.reasonCodes[row.reason_code] || 'Automatic system resolution.') : null;

    return {
      transaction_id: txId,
      booking_id: row.booking_id,
      booking_status: row.booking_status,
      payment_status: row.payment_status || 'not_recorded',
      amount_inr: (row.amount_paise / 100).toFixed(2),
      refund_status: row.refund_status || 'none',
      reason_code: row.reason_code || null,
      resolution_explanation: explanation
    };
  }

  if (toolName === 'get_machine_status') {
    const mId = parseInt(toolInput.machine_id, 10);
    const res = await pool.query(`
      SELECT m.id, m.label, m.type, m.out_of_service, s.state, s.last_seen
      FROM machines m
      LEFT JOIN machine_state s ON m.id = s.machine_id
      WHERE m.id = $1
    `, [mId]);

    if (res.rows.length === 0) {
      return { error: 'Machine not found' };
    }

    const m = res.rows[0];
    const displayStatus = mapStudentMachineStatus(m);

    // Strictly user-facing fields only; omit amps, IPs, internals
    return {
      machine_id: m.id,
      label: m.label,
      type: m.type,
      status: displayStatus
    };
  }

  return { error: `Unknown tool: ${toolName}` };
}

// System prompt enforcing all constraints from Section 9
export function buildSystemPrompt(retrievedChunks) {
  const docContext = retrievedChunks
    .map(c => `[Document: "${c.title}"]\nSection: ${c.heading}\n${c.content}`)
    .join('\n\n---\n\n');

  return `You are the College Laundry AI Assistant. You help campus students check machine statuses, review their personal bookings and refunds, and understand laundry policies.

POLICY KNOWLEDGE BASE (PUBLIC ONLY):
${docContext}

APPROVED REASON CODE RESOLUTIONS:
- MACHINE_NOT_STARTED: A full refund is issued automatically. Expect it within the bank's normal timeframe.
- STUDENT_CANCELLED: Your booking was cancelled before the slot began. A full refund was issued immediately.
- PAYMENT_WITHOUT_BOOKING: A payment was captured without a valid reservation. A full refund was issued automatically.
- MACHINE_OUT_OF_SERVICE: The machine was marked out of service for maintenance. A full refund was issued automatically.
- SLOT_TAKEN: The slot was already claimed or hold expired. A full refund was issued automatically.

STRICT INSTRUCTIONS:
1. Answer ONLY using information from the retrieved documents above, your tool results, or the approved reason code mappings.
2. If an answer cannot be found in the provided sources, explicitly state that you do not know and advise the student to contact the laundry staff at the front desk or via the staff portal.
3. NEVER approve, promise, issue, or calculate refunds yourself. Explain existing policy and statuses only.
4. Always cite document titles (e.g. 'According to [Booking and Cancellation Policy]...') when explaining rules or policies.
5. NEVER reveal staff-only documentation or operational internals.
6. Keep answers short, polite, and plain. Explain technical terms simply.
7. Do not ask for or output any personal identifying information (no student names, emails, or phone numbers).`;
}

// Main chat handler
export async function handleChatMessage({ studentId, message }) {
  if (!message || message.trim().length === 0) {
    throw new Error('Message cannot be empty');
  }

  // Retrieve top 4 public RAG chunks
  const publicChunks = await searchPublicChunks(message, 4);
  const docsUsed = publicChunks.map(c => c.docSlug);
  const toolsUsed = [];

  const anthropic = getAnthropicClient();
  const systemPrompt = buildSystemPrompt(publicChunks);

  let botReply = '';

  if (anthropic) {
    try {
      let messages = [{ role: 'user', content: message }];

      // Initial invocation with tools
      let response = await anthropic.messages.create({
        model: config.anthropic.model,
        max_tokens: 600,
        system: systemPrompt,
        messages,
        tools: TOOLS
      });

      // Handle tool call turns if requested
      while (response.stop_reason === 'tool_use') {
        const toolUseBlocks = response.content.filter(b => b.type === 'tool_use');
        const toolResponses = [];

        for (const toolUse of toolUseBlocks) {
          toolsUsed.push(toolUse.name);
          const toolResult = await executeTool(toolUse.name, toolUse.input, studentId);
          toolResponses.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: JSON.stringify(toolResult)
          });
        }

        messages.push({ role: 'assistant', content: response.content });
        messages.push({ role: 'user', content: toolResponses });

        response = await anthropic.messages.create({
          model: config.anthropic.model,
          max_tokens: 600,
          system: systemPrompt,
          messages,
          tools: TOOLS
        });
      }

      const textBlock = response.content.find(b => b.type === 'text');
      botReply = textBlock ? textBlock.text : 'I have processed your request.';
    } catch (err) {
      console.error('Anthropic API call failed, falling back to rule-based response:', err.message);
      botReply = generateFallbackBotReply(message, publicChunks);
    }
  } else {
    // Local / Offline fallback response engine (used when no API key is present)
    botReply = await generateFallbackWithTools(message, studentId, publicChunks, toolsUsed);
  }

  // Log chat turn to chat_messages (strictly without personal details)
  await pool.query(`
    INSERT INTO chat_messages (student_id, user_text, bot_text, tools_used, docs_used)
    VALUES ($1, $2, $3, $4, $5)
  `, [studentId, message, botReply, JSON.stringify(toolsUsed), JSON.stringify(docsUsed)]);

  return {
    reply: botReply,
    toolsUsed,
    docsUsed
  };
}

// Fallback helper for offline testing or without API key
async function generateFallbackWithTools(message, studentId, publicChunks, toolsUsed) {
  const lower = message.toLowerCase();

  if (lower.includes('my booking') || lower.includes('recent booking') || lower.includes('what did i book')) {
    toolsUsed.push('get_my_bookings');
    const bookings = await executeTool('get_my_bookings', {}, studentId);
    if (bookings.length === 0) {
      return "You do not have any recent bookings in the system.";
    }
    const list = bookings.slice(0, 3).map(b => 
      `• Booking #${b.booking_id} on Machine #${b.machine_id}: Status is ${b.status} (₹${b.amount_inr}).`
    ).join('\n');
    return `Here are your most recent bookings:\n${list}\n\nAccording to [Booking and Cancellation Policy], you can cancel any upcoming booking before it starts for a full refund.`;
  }

  if (lower.includes('status of transaction') || lower.includes('refund status') || lower.includes('transaction')) {
    const match = lower.match(/\b\d+\b/);
    if (match) {
      const txId = parseInt(match[0], 10);
      toolsUsed.push('get_transaction_status');
      const tx = await executeTool('get_transaction_status', { transaction_id: txId }, studentId);
      if (tx.error) {
        return `I could not find a transaction matching ID #${txId} for your account.`;
      }
      return `Transaction #${txId}: Booking is ${tx.booking_status}, Payment is ${tx.payment_status}, Refund status is ${tx.refund_status}. ${tx.resolution_explanation || ''}`;
    }
  }

  if (lower.includes('refund') || lower.includes('cancellation')) {
    return "According to [Refund Policy] and [Booking and Cancellation Policy], all cancellations before the slot start receive a 100% full refund automatically through Razorpay with zero deduction fees. If a machine fails to start within the 5-minute grace period, a full refund is also issued automatically.";
  }

  if (publicChunks.length > 0) {
    return `According to [${publicChunks[0].title}]: ${publicChunks[0].content.slice(0, 250)}... If you need further assistance, please contact the campus laundry staff.`;
  }

  return "I am sorry, but I do not have sufficient information in the campus policies to answer that. Please contact the campus laundry staff at the front desk.";
}

function generateFallbackBotReply(message, chunks) {
  if (chunks.length > 0) {
    return `According to [${chunks[0].title}]: ${chunks[0].content.slice(0, 250)}... Please check with the staff desk for further assistance.`;
  }
  return "I could not find that information in the policies. Please contact the laundry staff.";
}
