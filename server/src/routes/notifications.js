import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getStudentNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../services/notificationService.js';

const router = express.Router();

// Get recent notifications for authenticated student
router.get('/', authenticate, async (req, res, next) => {
  try {
    const notifications = await getStudentNotifications(req.user.id);
    const unreadCount = notifications.filter(n => !n.read_at).length;
    res.json({ notifications, unreadCount });
  } catch (err) {
    next(err);
  }
});

// Mark single notification as read
router.put('/:id/read', authenticate, async (req, res, next) => {
  const notificationId = parseInt(req.params.id, 10);
  try {
    const updated = await markNotificationAsRead(req.user.id, notificationId);
    res.json({ notification: updated });
  } catch (err) {
    next(err);
  }
});

// Mark all notifications as read
router.put('/read-all', authenticate, async (req, res, next) => {
  try {
    await markAllNotificationsAsRead(req.user.id);
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
});

export default router;
