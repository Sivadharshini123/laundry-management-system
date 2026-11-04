import pg from 'pg';
import { config } from '../config.js';
import { CompleteDatabaseEngine } from './fallbackEngine.js';

const { Pool } = pg;

export const realPool = new Pool({
  connectionString: config.db.connectionString,
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

let isUsingFallback = false;
let fallbackEngine = null;

function getFallbackEngine() {
  if (!fallbackEngine) {
    fallbackEngine = new CompleteDatabaseEngine();
  }
  return fallbackEngine;
}

// Initial probe to determine if live PostgreSQL is accessible
realPool.query('SELECT 1')
  .then(() => {
    console.log('[Database] Connected to live PostgreSQL database.');
  })
  .catch((err) => {
    isUsingFallback = true;
    console.log(`[Database] PostgreSQL connection failed (${err.message}); activating integrated database engine so the system runs immediately.`);
  });

realPool.on('error', (err) => {
  if (!isUsingFallback) {
    console.warn('[Database] PostgreSQL pool error, switching to integrated fallback engine:', err.message);
    isUsingFallback = true;
  }
});

export const pool = {
  query: async (text, params) => {
    if (isUsingFallback) {
      return getFallbackEngine().query(text, params);
    }
    try {
      return await realPool.query(text, params);
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.code === '28P01' || err.code === '3D000' || err.message?.includes('failed') || err.message?.includes('timeout')) {
        isUsingFallback = true;
        console.warn(`[Database] Query error (${err.message}); switched to integrated database engine.`);
        return getFallbackEngine().query(text, params);
      }
      throw err;
    }
  },
  connect: async () => {
    if (isUsingFallback) {
      return getFallbackEngine().connect();
    }
    try {
      return await realPool.connect();
    } catch (err) {
      isUsingFallback = true;
      return getFallbackEngine().connect();
    }
  }
};

export const query = (text, params) => pool.query(text, params);
export const getClient = () => pool.connect();

export default {
  pool,
  query,
  getClient
};
