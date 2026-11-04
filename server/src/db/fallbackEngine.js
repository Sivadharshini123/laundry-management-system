import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { generateLocalEmbedding } from '../../scripts/index-docs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class CompleteDatabaseEngine {
  constructor() {
    this.students = [];
    this.laundries = [];
    this.machines = [];
    this.machine_state = {};
    this.bookings = [];
    this.payments = [];
    this.refunds = [];
    this.machine_events = [];
    this.waiting_list = [];
    this.notifications = [];
    this.audit_log = [];
    this.chat_messages = [];
    this.knowledge_chunks = [];

    this.bookingSeq = 100;
    this.paymentSeq = 100;
    this.refundSeq = 100;
    this.notificationSeq = 100;
    this.studentSeq = 10;
    this.auditSeq = 100;

    this.init();
  }

  init() {
    const defaultHash = bcrypt.hashSync('Password123!', 10);

    this.students = [
      { id: 1, name: 'Campus Facilities Staff', college_email: 'staff@college.edu', password_hash: defaultHash, role: 'staff', created_at: new Date() },
      { id: 2, name: 'Aarav Sharma', college_email: 'student1@college.edu', password_hash: defaultHash, role: 'student', created_at: new Date() },
      { id: 3, name: 'Diya Patel', college_email: 'student2@college.edu', password_hash: defaultHash, role: 'student', created_at: new Date() },
      { id: 4, name: 'Rohan Verma', college_email: 'student3@college.edu', password_hash: defaultHash, role: 'student', created_at: new Date() }
    ];

    this.laundries = [
      { id: 1, name: 'Laundry A (North Residence)', address: 'North Campus Residence Hall, Ground Floor, Room 102', opening_hours: '06:00 - 23:00', active: true },
      { id: 2, name: 'Laundry B (South Commons)', address: 'South Campus Student Commons, Basement Level B-14', opening_hours: '06:00 - 23:00', active: true }
    ];

    // Seed 14 machines (7 per laundry)
    for (let i = 1; i <= 14; i++) {
      const laundryId = i <= 7 ? 1 : 2;
      const num = i <= 7 ? i : i - 7;
      const type = num <= 4 ? 'washer' : 'dryer';
      const typeNum = num <= 4 ? num : num - 4;
      const label = `Laundry ${laundryId === 1 ? 'A' : 'B'} – ${type === 'washer' ? 'Washer' : 'Dryer'} ${typeNum}`;

      this.machines.push({
        id: i,
        laundry_id: laundryId,
        label,
        type,
        price_paise: type === 'washer' ? 6000 : 4000,
        slot_minutes: 45,
        active: true,
        out_of_service: false,
        run_threshold_amps: 0.50
      });

      this.machine_state[i] = {
        machine_id: i,
        state: 'idle',
        last_seen: new Date(),
        updated_at: new Date()
      };
    }

    // Load documentation chunks into knowledge_chunks
    try {
      const docsDir = path.join(__dirname, '../../../docs');
      if (fs.existsSync(docsDir)) {
        const scan = (dir) => {
          let res = [];
          for (const f of fs.readdirSync(dir)) {
            const p = path.join(dir, f);
            if (fs.statSync(p).isDirectory()) res = res.concat(scan(p));
            else if (f.endsWith('.md') && f !== 'README.md') res.push(p);
          }
          return res;
        };

        for (const filePath of scan(docsDir)) {
          const raw = fs.readFileSync(filePath, 'utf8');
          const { data: frontmatter, content } = matter(raw);
          const relPath = path.relative(docsDir, filePath).replace(/\\/g, '/');
          const docSlug = relPath.replace(/\.md$/, '');
          const title = frontmatter.title || docSlug;
          const audience = frontmatter.audience || 'public';
          const version = parseInt(frontmatter.version || '1', 10);

          const sections = content.split(/(?=^#{1,3}\s+)/m);
          for (const sec of sections) {
            const trimmed = sec.trim();
            if (!trimmed) continue;
            const headingMatch = trimmed.match(/^#{1,3}\s+(.+)$/m);
            const heading = headingMatch ? headingMatch[1].trim() : title;
            const emb = generateLocalEmbedding(trimmed, 1024);

            this.knowledge_chunks.push({
              id: this.knowledge_chunks.length + 1,
              doc_slug: docSlug,
              title,
              section_heading: heading,
              audience,
              version,
              content: trimmed,
              embedding: emb,
              created_at: new Date()
            });
          }
        }
      }
    } catch (e) {
      console.warn('Fallback engine docs loading notice:', e.message);
    }
  }

  async query(text, params = []) {
    const trimmed = text.trim();

    // 1. Transaction commands
    if (['BEGIN', 'COMMIT', 'ROLLBACK'].includes(trimmed)) {
      return { rows: [] };
    }

    // 2. Auth: SELECT ... FROM students WHERE college_email = $1
    if (trimmed.includes('FROM students') && trimmed.includes('college_email = $1')) {
      const email = params[0];
      const s = this.students.find(x => x.college_email.toLowerCase() === email.toLowerCase());
      return { rows: s ? [s] : [] };
    }

    // 3. Auth: SELECT ... FROM students WHERE id = $1
    if (trimmed.includes('FROM students') && trimmed.includes('WHERE id = $1')) {
      const id = params[0];
      const s = this.students.find(x => x.id === id);
      return { rows: s ? [s] : [] };
    }

    // 4. Auth: INSERT INTO students
    if (trimmed.startsWith('INSERT INTO students')) {
      const [name, email, passwordHash, role] = params;
      const newStudent = {
        id: ++this.studentSeq,
        name,
        college_email: email,
        password_hash: passwordHash,
        role: role || 'student',
        created_at: new Date()
      };
      this.students.push(newStudent);
      return { rows: [newStudent] };
    }

    // 5. Laundries list
    if (trimmed.includes('FROM laundries l')) {
      const rows = this.laundries.map(l => ({
        ...l,
        total_machines: this.machines.filter(m => m.laundry_id === l.id && m.active).length,
        total_washers: this.machines.filter(m => m.laundry_id === l.id && m.active && m.type === 'washer').length,
        total_dryers: this.machines.filter(m => m.laundry_id === l.id && m.active && m.type === 'dryer').length
      }));
      if (trimmed.includes('WHERE id = $1')) {
        const found = rows.find(x => x.id === params[0]);
        return { rows: found ? [found] : [] };
      }
      return { rows };
    }

    // 6. Machines list (with machine_state joined)
    if (trimmed.includes('FROM machines m') && !trimmed.includes('WHERE m.id = $1')) {
      let filtered = [...this.machines];
      if (params.length > 0 && typeof params[0] === 'number') {
        filtered = filtered.filter(m => m.laundry_id === params[0]);
      }
      const rows = filtered.map(m => {
        const s = this.machine_state[m.id] || { state: 'idle', last_seen: new Date() };
        return {
          ...m,
          state: s.state,
          last_seen: s.last_seen
        };
      });
      return { rows };
    }

    // 7. Single machine lookup
    if (trimmed.includes('FROM machines m') && trimmed.includes('WHERE m.id = $1')) {
      const mId = params[0];
      const m = this.machines.find(x => x.id === mId);
      if (!m) return { rows: [] };
      const s = this.machine_state[mId] || { state: 'idle', last_seen: new Date() };
      const l = this.laundries.find(x => x.id === m.laundry_id) || {};
      return {
        rows: [{
          ...m,
          current_state: s.state,
          state: s.state,
          last_seen: s.last_seen,
          opening_hours: l.opening_hours || '06:00 - 23:00'
        }]
      };
    }

    // 8. Bookings query for slot checking: WHERE machine_id = $1 AND slot_end >= $2 AND slot_start <= $3
    if (trimmed.includes('FROM bookings') && trimmed.includes('machine_id = $1') && trimmed.includes('slot_end >=')) {
      const mId = params[0];
      const rows = this.bookings.filter(b =>
        b.machine_id === mId &&
        ['pending_payment', 'paid', 'running'].includes(b.status)
      );
      return { rows };
    }

    // 9. Reserve slot: INSERT INTO bookings with EXCLUDE check
    if (trimmed.startsWith('INSERT INTO bookings')) {
      const [studentId, machineId, slotStart, slotEnd, holdExpiresAt, amountPaise, status] = params;
      const sStart = new Date(slotStart).getTime();
      const sEnd = new Date(slotEnd).getTime();

      const overlap = this.bookings.find(b => {
        if (b.machine_id !== machineId) return false;
        if (!['pending_payment', 'paid', 'running'].includes(b.status)) return false;
        const bStart = new Date(b.slot_start).getTime();
        const bEnd = new Date(b.slot_end).getTime();
        return sStart < bEnd && sEnd > bStart;
      });

      if (overlap) {
        const err = new Error('conflicting key value violates exclusion constraint "exclude_overlapping_slots"');
        err.code = '23P01';
        throw err;
      }

      const booking = {
        id: ++this.bookingSeq,
        student_id: studentId,
        machine_id: machineId,
        slot_start: new Date(slotStart),
        slot_end: new Date(slotEnd),
        hold_expires_at: new Date(holdExpiresAt),
        amount_paise: amountPaise,
        status: status || 'pending_payment',
        razorpay_order_id: null,
        razorpay_payment_id: null,
        razorpay_refund_id: null,
        created_at: new Date(),
        updated_at: new Date()
      };
      this.bookings.push(booking);
      return { rows: [booking] };
    }

    // 10. UPDATE bookings SET razorpay_order_id = $1
    if (trimmed.startsWith('UPDATE bookings') && trimmed.includes('SET razorpay_order_id = $1')) {
      const [orderId, bookingId] = params;
      const b = this.bookings.find(x => x.id === bookingId);
      if (b) {
        b.razorpay_order_id = orderId;
        b.updated_at = new Date();
        return { rows: [b] };
      }
      return { rows: [] };
    }

    // 11. Hold cleanup queries
    if (trimmed.includes("b.status = 'pending_payment' AND b.hold_expires_at <= NOW()")) {
      const now = Date.now();
      const expired = this.bookings.filter(b => 
        b.status === 'pending_payment' && new Date(b.hold_expires_at).getTime() <= now
      ).map(b => ({
        id: b.id,
        student_id: b.student_id,
        machine_id: b.machine_id,
        slot_start: b.slot_start,
        laundry_id: b.machine_id <= 7 ? 1 : 2
      }));
      return { rows: expired };
    }

    if (trimmed.startsWith('UPDATE bookings') && trimmed.includes("SET status = 'expired'")) {
      const [id] = params;
      const b = this.bookings.find(x => x.id === id && x.status === 'pending_payment');
      if (b) {
        b.status = 'expired';
        b.updated_at = new Date();
      }
      return { rows: b ? [b] : [] };
    }

    // 12. Bookings by razorpay_order_id
    if (trimmed.includes('WHERE b.razorpay_order_id = $1') || trimmed.includes('WHERE razorpay_order_id = $1')) {
      const [orderId] = params;
      const b = this.bookings.find(x => x.razorpay_order_id === orderId);
      if (b) {
        return { rows: [{ ...b, laundry_id: b.machine_id <= 7 ? 1 : 2 }] };
      }
      return { rows: [] };
    }

    // 13. Idempotent payment capture
    if (trimmed.startsWith('UPDATE bookings') && trimmed.includes("status = 'pending_payment'") && trimmed.includes("SET status = 'paid'")) {
      const [paymentId, bookingId] = params;
      const b = this.bookings.find(x => x.id === bookingId && x.status === 'pending_payment');
      if (b) {
        b.status = 'paid';
        b.razorpay_payment_id = paymentId;
        b.updated_at = new Date();
        return { rows: [b] };
      }
      return { rows: [] };
    }

    // 14. Student bookings list: WHERE b.student_id = $1
    if (trimmed.includes('FROM bookings b') && trimmed.includes('WHERE b.student_id = $1')) {
      const sId = params[0];
      const list = this.bookings.filter(b => b.student_id === sId).map(b => {
        const m = this.machines.find(x => x.id === b.machine_id) || {};
        const l = this.laundries.find(x => x.id === m.laundry_id) || {};
        const p = this.payments.find(x => x.booking_id === b.id) || {};
        const r = this.refunds.find(x => x.booking_id === b.id) || {};

        return {
          id: b.id,
          student_id: b.student_id,
          machine_id: b.machine_id,
          slot_start: b.slot_start,
          slot_end: b.slot_end,
          hold_expires_at: b.hold_expires_at,
          amount_paise: b.amount_paise,
          status: b.status,
          razorpay_order_id: b.razorpay_order_id,
          razorpay_payment_id: b.razorpay_payment_id,
          razorpay_refund_id: b.razorpay_refund_id,
          created_at: b.created_at,
          updated_at: b.updated_at,
          machine_label: m.label || `Machine #${b.machine_id}`,
          machine_type: m.type || 'washer',
          laundry_id: l.id || 1,
          laundry_name: l.name || 'Laundry Facility',
          payment_id: p.id || null,
          payment_status: p.status || null,
          refund_id: r.id || null,
          refund_amount_paise: r.amount_paise || null,
          reason_code: r.reason_code || null,
          refund_status: r.status || null,
          refunded_at: r.created_at || null
        };
      });
      return { rows: list };
    }

    // 15. Cancellation query: WHERE b.id = $1 AND b.student_id = $2
    if (trimmed.includes('FROM bookings b') && trimmed.includes('WHERE b.id = $1 AND b.student_id = $2')) {
      const [bId, sId] = params;
      const b = this.bookings.find(x => x.id === bId && x.student_id === sId);
      if (b) {
        const p = this.payments.find(x => x.booking_id === b.id);
        return {
          rows: [{
            ...b,
            laundry_id: b.machine_id <= 7 ? 1 : 2,
            payment_id: p?.id || null,
            razorpay_payment_id: b.razorpay_payment_id || p?.razorpay_payment_id || null
          }]
        };
      }
      return { rows: [] };
    }

    // 16. Single booking lookup: WHERE id = $1
    if (trimmed.includes('FROM bookings WHERE id = $1')) {
      const b = this.bookings.find(x => x.id === params[0]);
      return { rows: b ? [b] : [] };
    }

    // 17. Telemetry & Grace period queries
    if (trimmed.includes("status = 'paid'") && trimmed.includes("slot_start + INTERVAL '5 minutes' < NOW()")) {
      const now = Date.now();
      const failed = this.bookings.filter(b =>
        b.status === 'paid' && (new Date(b.slot_start).getTime() + 5 * 60 * 1000 < now)
      );
      return { rows: failed.map(b => ({ id: b.id })) };
    }

    // 18. Machine state update / insert
    if (trimmed.startsWith('INSERT INTO machine_state')) {
      const [mId, state] = params;
      const existing = this.machine_state[mId] || { machine_id: mId };
      existing.state = state;
      existing.last_seen = new Date();
      existing.updated_at = new Date();
      this.machine_state[mId] = existing;
      return { rows: [existing] };
    }

    if (trimmed.startsWith('UPDATE machine_state')) {
      const [mId] = params;
      const existing = this.machine_state[mId];
      if (existing) {
        if (trimmed.includes("state = 'idle'")) existing.state = 'idle';
        existing.updated_at = new Date();
      }
      return { rows: existing ? [existing] : [] };
    }

    // 19. Payments and Refunds inserts
    if (trimmed.startsWith('INSERT INTO payments')) {
      const p = {
        id: ++this.paymentSeq,
        booking_id: params[0],
        razorpay_order_id: params[1],
        razorpay_payment_id: params[2],
        amount_paise: params[3],
        status: params[4],
        raw_webhook_id: params[5],
        created_at: new Date()
      };
      this.payments.push(p);
      return { rows: [p] };
    }

    if (trimmed.startsWith('INSERT INTO refunds')) {
      const r = {
        id: ++this.refundSeq,
        booking_id: params[0],
        payment_id: params[1],
        amount_paise: params[2],
        reason_code: params[3],
        razorpay_refund_id: params[4],
        status: params[5] || 'processed',
        created_at: new Date()
      };
      this.refunds.push(r);
      return { rows: [r] };
    }

    // 20. Booking status transitions
    if (trimmed.startsWith('UPDATE bookings') && trimmed.includes("SET status = 'cancelled'")) {
      const [refundId, bookingId] = params;
      const b = this.bookings.find(x => x.id === bookingId);
      if (b) {
        b.status = 'cancelled';
        b.razorpay_refund_id = refundId;
        b.updated_at = new Date();
        return { rows: [b] };
      }
      return { rows: [] };
    }

    if (trimmed.startsWith('UPDATE bookings') && trimmed.includes("SET status = 'failed'")) {
      const [refundId, bookingId] = params;
      const b = this.bookings.find(x => x.id === bookingId);
      if (b) {
        b.status = 'failed';
        b.razorpay_refund_id = refundId;
        b.updated_at = new Date();
        return { rows: [b] };
      }
      return { rows: [] };
    }

    if (trimmed.startsWith('UPDATE bookings') && trimmed.includes("SET status = 'running'")) {
      const [bookingId] = params;
      const b = this.bookings.find(x => x.id === bookingId);
      if (b) {
        b.status = 'running';
        b.updated_at = new Date();
      }
      return { rows: b ? [b] : [] };
    }

    if (trimmed.startsWith('UPDATE bookings') && trimmed.includes("SET status = 'completed'")) {
      const [bookingId] = params;
      const b = this.bookings.find(x => x.id === bookingId);
      if (b) {
        b.status = 'completed';
        b.updated_at = new Date();
      }
      return { rows: b ? [b] : [] };
    }

    // 21. Notifications
    if (trimmed.startsWith('INSERT INTO notifications')) {
      const n = {
        id: ++this.notificationSeq,
        student_id: params[0],
        type: params[1],
        message: params[2],
        read_at: null,
        created_at: new Date()
      };
      this.notifications.push(n);
      return { rows: [n] };
    }

    if (trimmed.includes('FROM notifications') && trimmed.includes('WHERE student_id = $1')) {
      const rows = this.notifications.filter(n => n.student_id === params[0])
        .sort((a, b) => b.created_at - a.created_at);
      return { rows };
    }

    if (trimmed.startsWith('UPDATE notifications') && trimmed.includes('WHERE id = $1')) {
      const [nId, sId] = params;
      const n = this.notifications.find(x => x.id === nId && x.student_id === sId);
      if (n) n.read_at = new Date();
      return { rows: n ? [n] : [] };
    }

    if (trimmed.startsWith('UPDATE notifications') && trimmed.includes('read_at IS NULL')) {
      const sId = params[0];
      this.notifications.filter(x => x.student_id === sId).forEach(n => { n.read_at = new Date(); });
      return { rows: [] };
    }

    // 22. Audit log
    if (trimmed.startsWith('INSERT INTO audit_log')) {
      const log = {
        id: ++this.auditSeq,
        actor_id: params[0],
        action: params[1],
        entity: params[2],
        entity_id: params[3],
        details: typeof params[4] === 'string' ? JSON.parse(params[4]) : params[4],
        created_at: new Date()
      };
      this.audit_log.push(log);
      return { rows: [log] };
    }

    if (trimmed.includes('FROM audit_log a')) {
      const rows = this.audit_log.slice(-50).reverse().map(l => {
        const u = this.students.find(s => s.id === l.actor_id);
        return {
          ...l,
          actor_name: u?.name || 'System',
          actor_email: u?.college_email || 'system'
        };
      });
      return { rows };
    }

    // 23. Staff dashboard & machine grid
    if (trimmed.includes('FROM machines m') && trimmed.includes('JOIN laundries l') && trimmed.includes('active_booking_id')) {
      const rows = this.machines.map(m => {
        const s = this.machine_state[m.id] || { state: 'idle', last_seen: new Date() };
        const l = this.laundries.find(x => x.id === m.laundry_id) || {};
        const activeB = this.bookings.find(b => b.machine_id === m.id && ['running', 'paid'].includes(b.status));

        return {
          ...m,
          laundry_name: l.name,
          state: s.state,
          last_seen: s.last_seen,
          active_booking_id: activeB ? activeB.id : null,
          active_booking_status: activeB ? activeB.status : null
        };
      });
      return { rows };
    }

    // 24. Staff update machine
    if (trimmed.startsWith('UPDATE machines')) {
      const mId = params[params.length - 1];
      const m = this.machines.find(x => x.id === mId);
      if (m) {
        if (trimmed.includes('price_paise = $')) m.price_paise = params[0];
        if (trimmed.includes('out_of_service = $')) m.out_of_service = params[params.length - 2];
      }
      return { rows: m ? [m] : [] };
    }

    // 25. Chat messages
    if (trimmed.startsWith('INSERT INTO chat_messages')) {
      this.chat_messages.push({
        id: this.chat_messages.length + 1,
        student_id: params[0],
        user_text: params[1],
        bot_text: params[2],
        tools_used: params[3],
        docs_used: params[4],
        created_at: new Date()
      });
      return { rows: [] };
    }

    // 26. Knowledge chunks for RAG search
    if (trimmed.includes('FROM knowledge_chunks') && trimmed.includes("audience = 'public'")) {
      return { rows: this.knowledge_chunks.filter(c => c.audience === 'public') };
    }

    // 27. Machine events
    if (trimmed.startsWith('INSERT INTO machine_events')) {
      this.machine_events.push({
        machine_id: params[0],
        state: params[1],
        amps: params[2],
        recorded_at: new Date()
      });
      return { rows: [] };
    }

    if (trimmed.includes('FROM machine_events') && trimmed.includes("state = 'running'")) {
      const mId = params[0];
      const last = this.machine_events.filter(e => e.machine_id === mId && e.state === 'running').pop();
      return { rows: last ? [last] : [] };
    }

    if (trimmed.includes('FROM waiting_list')) {
      return { rows: [] };
    }

    return { rows: [] };
  }

  async connect() {
    return {
      query: (text, params) => this.query(text, params),
      release: () => {}
    };
  }
}
