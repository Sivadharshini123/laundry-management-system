import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import { config } from './config.js';
import { initSocketIO } from './socket/socketHandler.js';
import { startIngestionService } from './services/ingestion.js';
import { cleanupExpiredHolds } from './services/bookingService.js';

const server = http.createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: config.clientUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});
initSocketIO(io);

// Start IoT Ingestion Service (MQTT subscriber + 30s watchdog)
startIngestionService().catch(err => {
  console.warn('Ingestion service startup warning:', err.message);
});

// Periodic 1-minute hold cleanup job (Section 3 Rule 2)
setInterval(async () => {
  try {
    const expiredCount = await cleanupExpiredHolds();
    if (expiredCount > 0) {
      console.log(`Cleaned up ${expiredCount} expired booking hold(s).`);
    }
  } catch (err) {
    console.error('Error in periodic hold cleanup job:', err);
  }
}, 60 * 1000);

server.listen(config.port, () => {
  console.log(`Campus Laundry Server running on http://localhost:${config.port} (env: ${config.nodeEnv})`);
});

export { server, io };
