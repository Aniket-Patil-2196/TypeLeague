import dotenv from 'dotenv';
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/typeleague',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'typeleague_dev_access_secret_94812374981',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'typeleague_dev_refresh_secret_18374918237',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};
