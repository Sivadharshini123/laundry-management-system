import { pool } from '../db/index.js';
import { emitToStudent } from '../socket/socketHandler.js';

export async function createNotification(studentId, type, message, dbClient = null) {
  const runner = dbClient || pool;
  try {
    const res = await runner.query(`
      INSERT INTO notifications (student_id, type, message)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [studentId, type, message]);

    const notification = res.rows[0];
    emitToStudent(studentId, 'notification:new', notification);
    return notification;
  } catch (err) {
    console.error('Error creating notification:', err);
    throw err;
  }
}

export async function getStudentNotifications(studentId, limit = 20) {
  const res = await pool.query(`
    SELECT * FROM notifications
    WHERE student_id = $1
    ORDER BY created_at DESC
    LIMIT $2
  `, [studentId, limit]);
  return res.rows;
}

export async function markNotificationAsRead(studentId, notificationId) {
  const res = await pool.query(`
    UPDATE notifications
    SET read_at = NOW()
    WHERE id = $1 AND student_id = $2
    RETURNING *
  `, [notificationId, studentId]);
  return res.rows[0];
}

export async function markAllNotificationsAsRead(studentId) {
  await pool.query(`
    UPDATE notifications
    SET read_at = NOW()
    WHERE student_id = $1 AND read_at IS NULL
  `, [studentId]);
}
