import { pool } from '../db/index.js';

export async function logAudit({ actorId = null, action, entity, entityId = null, details = {} }, dbClient = null) {
  const queryRunner = dbClient || pool;
  try {
    await queryRunner.query(`
      INSERT INTO audit_log (actor_id, action, entity, entity_id, details)
      VALUES ($1, $2, $3, $4, $5)
    `, [actorId, action, entity, entityId, JSON.stringify(details)]);
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
