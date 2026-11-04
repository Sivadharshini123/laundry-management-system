import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';

// Route imports
import authRoutes from './routes/auth.js';
import laundryRoutes from './routes/laundries.js';
import machineRoutes from './routes/machines.js';
import bookingRoutes from './routes/bookings.js';
import paymentRoutes from './routes/payments.js';
import webhookRoutes from './routes/webhooks.js';
import notificationRoutes from './routes/notifications.js';
import chatRoutes from './routes/chat.js';
import staffRoutes from './routes/staff.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.join(__dirname, '../../client/dist');

const app = express();

// Security middleware (Section 12)
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts and Razorpay checkout script
}));
app.use(cors({
  origin: '*',
  credentials: true
}));

// Mount Webhooks with raw body parser BEFORE json parser (Section 6)
app.use('/api/webhooks', webhookRoutes);

// Body parsers for standard endpoints
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Healthcheck endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/laundries', laundryRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/staff', staffRoutes);

// Serve built React client assets
app.use(express.static(clientDist));

// SPA Client Fallback: any non-API route returns index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return next();
  }
  res.sendFile(path.join(clientDist, 'index.html'));
});

// 404 handler for API routes
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({
    error: message,
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
});

export default app;
