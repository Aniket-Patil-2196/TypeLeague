import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import groupRoutes from './routes/group.routes.js';
import invitationRoutes from './routes/invitation.routes.js';
import contentRoutes from './routes/content.routes.js';
import challengeRoutes from './routes/challenge.routes.js';
import gamificationRoutes from './routes/gamification.routes.js';
import notificationRoutes from './routes/notification.routes.js';

const app = express();

// Security HTTP headers
app.use(helmet());

// Cross-origin resource sharing
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// Body and cookie parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    timezone: 'Asia/Kolkata',
    version: '1.0.0',
  });
});

// System status strip data endpoint
app.get('/api/v1/system/status', (req, res) => {
  res.status(200).json({
    status: 'operational',
    serverTime: new Date().toISOString(),
    timezone: 'Asia/Kolkata',
    version: '1.0.0',
    service: 'TypeLeague Core API',
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/groups', groupRoutes);
app.use('/api/v1/invitations', invitationRoutes);
app.use('/api/v1/content', contentRoutes);
app.use('/api/v1/challenges', challengeRoutes);
app.use('/api/v1/gamification', gamificationRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// 404 handler for unknown routes
app.use('*', (req, res, next) => {
  const error = new Error(`Cannot find ${req.originalUrl} on this server`);
  error.statusCode = 404;
  next(error);
});

// Centralized error handler
app.use(errorHandler);

export default app;
