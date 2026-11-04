import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  db: {
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/laundry_db',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'laundry_db',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev_jwt_secret_key_minimum_32_characters_long_12345',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  mqtt: {
    brokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
    useEmbeddedBroker: process.env.USE_EMBEDDED_BROKER === 'true',
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_sampleKeyId1234',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 'sampleSecretKey5678',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'sampleWebhookSecret9999',
  },

  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5',
  },

  rag: {
    embeddingDim: parseInt(process.env.EMBEDDING_DIM || '1024', 10),
    embeddingProvider: process.env.EMBEDDING_PROVIDER || 'local',
  },

  // Section 9: Reason codes and approved resolution steps mapping
  reasonCodes: {
    MACHINE_NOT_STARTED: "A full refund is issued automatically. Expect it within the bank's normal timeframe.",
    STUDENT_CANCELLED: "Your booking was cancelled before the slot began. A full refund was issued immediately.",
    PAYMENT_WITHOUT_BOOKING: "A payment was captured without a valid reservation. A full refund was issued automatically.",
    MACHINE_OUT_OF_SERVICE: "The machine was marked out of service for maintenance. A full refund was issued automatically.",
    SLOT_TAKEN: "The slot was already claimed or hold expired. A full refund was issued automatically.",
    SYSTEM_RECONCILIATION: "System automated reconciliation issued a full refund."
  }
};
