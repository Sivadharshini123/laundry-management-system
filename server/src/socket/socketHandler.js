import jwt from 'jsonwebtoken';
import { config } from '../config.js';

let ioInstance = null;

export function initSocketIO(io) {
  ioInstance = io;

  // Socket authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwt.secret);
        socket.user = decoded;
      } catch (err) {
        // Allow unauthenticated guest connections for public slot views, but without user identity
        socket.user = null;
      }
    }
    return next();
  });

  io.on('connection', (socket) => {
    if (socket.user) {
      socket.join(`student:${socket.user.id}`);
      if (socket.user.role === 'staff') {
        socket.join('staff');
      }
    }

    // Join specific laundry room for live machine and slot telemetry
    socket.on('join:laundry', (laundryId) => {
      socket.join(`laundry:${laundryId}`);
    });

    socket.on('leave:laundry', (laundryId) => {
      socket.leave(`laundry:${laundryId}`);
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return io;
}

export function getIO() {
  return ioInstance;
}

export function emitToStudent(studentId, event, data) {
  if (ioInstance) {
    ioInstance.to(`student:${studentId}`).emit(event, data);
  }
}

export function emitToLaundry(laundryId, event, data) {
  if (ioInstance) {
    ioInstance.to(`laundry:${laundryId}`).emit(event, data);
  }
}

export function emitToStaff(event, data) {
  if (ioInstance) {
    ioInstance.to('staff').emit(event, data);
  }
}

export function emitToAll(event, data) {
  if (ioInstance) {
    ioInstance.emit(event, data);
  }
}
