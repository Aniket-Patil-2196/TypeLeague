import mongoose from 'mongoose';
import { env } from './env.js';

let mongodInstance = null;

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[DB] Connected to MongoDB at ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
      console.warn(`[DB] Local MongoDB connection failed: ${err.message}. Starting MongoMemoryServer for development...`);
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create();
        const uri = mongodInstance.getUri();
        const conn = await mongoose.connect(uri);
        console.log(`[DB] MongoMemoryServer started successfully at ${uri}`);
        return conn;
      } catch (memErr) {
        console.error(`[DB] Failed to start MongoMemoryServer: ${memErr.message}`);
        throw memErr;
      }
    }
    console.error(`[DB] MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};
