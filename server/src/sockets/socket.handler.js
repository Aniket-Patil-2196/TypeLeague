import { verifyAccessToken } from '../utils/jwt.utils.js';
import { Membership } from '../models/membership.model.js';
import { Group } from '../models/group.model.js';

export const configureSockets = (io) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (token) {
        const decoded = verifyAccessToken(token);
        socket.userId = decoded.id;
      }
      next();
    } catch (err) {
      // Allow unauthenticated connection for global lobby/health, but flag userId as null
      socket.userId = null;
      next();
    }
  });

  io.on('connection', (socket) => {
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Join Group room with membership check for private groups
    socket.on('group:join', async ({ groupId }) => {
      try {
        const group = await Group.findById(groupId);
        if (!group) return;

        if (group.visibility === 'private') {
          if (!socket.userId) return;
          const isMember = await Membership.findOne({ group: groupId, user: socket.userId, status: 'active' });
          if (!isMember) return;
        }

        socket.join(`group:${groupId}`);
      } catch (err) {
        // Safe ignore
      }
    });

    socket.on('group:leave', ({ groupId }) => {
      socket.leave(`group:${groupId}`);
    });
  });
};
