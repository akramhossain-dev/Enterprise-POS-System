import { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';

// Map of userId -> Set of socket instances
const activeConnections = new Map<string, Set<Socket>>();

const JWT_SECRET = process.env.JWT_SECRET ?? 'fallback-secret-key-12345';

export function initSocketServer(fastify: FastifyInstance) {
  fastify.ready((err) => {
    if (err) {
      return;
    }

    const io = (
      fastify as unknown as {
        io: { on: (event: string, callback: (socket: Socket) => void) => void };
      }
    ).io;
    io.on('connection', (socket: Socket) => {
      // 1. Authenticate user from handshake query or authorization header
      const token =
        (socket.handshake.query.token as string) ||
        socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        socket.disconnect(true);
        return;
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        const userId = decoded.id;

        if (!activeConnections.has(userId)) {
          activeConnections.set(userId, new Set());
        }
        const connectionSet = activeConnections.get(userId);
        if (connectionSet) {
          connectionSet.add(socket);
        }

        socket.on('disconnect', () => {
          const userSockets = activeConnections.get(userId);
          if (userSockets) {
            userSockets.delete(socket);
            if (userSockets.size === 0) {
              activeConnections.delete(userId);
            }
          }
        });
      } catch {
        socket.disconnect(true);
      }
    });
  });
}

export function sendRealTimeNotification(userId: string, event: string, payload: unknown) {
  const userSockets = activeConnections.get(userId);
  if (userSockets) {
    for (const socket of userSockets) {
      socket.emit(event, payload);
    }
  }
}
