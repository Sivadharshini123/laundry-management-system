import express from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { chatLimiter } from '../middleware/rateLimiter.js';
import { handleChatMessage } from '../services/chatService.js';

const router = express.Router();

// Input validation: message limited to 500 characters (Section 12)
const chatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(500, 'Message cannot exceed 500 characters')
});

router.post('/', authenticate, chatLimiter, validateBody(chatSchema), async (req, res, next) => {
  const { message } = req.body;
  try {
    const result = await handleChatMessage({
      studentId: req.user.id,
      message
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
