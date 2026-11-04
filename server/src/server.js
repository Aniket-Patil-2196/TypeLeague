import http from 'http';
import { Server } from 'socket.io';
import app, { corsOptions } from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { User } from './models/user.model.js';
import { seedSharedContent } from './utils/seed.js';
import { initAchievements } from './services/gamification.service.js';
import { configureSockets } from './sockets/socket.handler.js';
import { repairExistingGroupMemberships } from './utils/repairGroups.js';

const server = http.createServer(app);

// Socket.IO configuration with unified CORS
export const io = new Server(server, {
  cors: corsOptions,
});

configureSockets(io);

const startServer = async () => {
  try {
    await connectDB();

    // Check or create system admin for shared content
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = await User.findOne();
    }
    if (admin) {
      await seedSharedContent(admin._id);
    }
    await initAchievements();
    await repairExistingGroupMemberships();

    server.listen(env.PORT, () => {
      console.log(`[Server] TypeLeague Backend running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      console.log(`[Server] Health check: http://localhost:${env.PORT}/api/v1/health`);
    });
  } catch (error) {
    console.error(`[Server] Startup failure:`, error);
    process.exit(1);
  }
};

startServer();
