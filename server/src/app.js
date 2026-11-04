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

// Trust reverse proxy (Render, AWS ELB, Heroku) for secure cookies & client IP
app.set('trust proxy', 1);

// Security HTTP headers
app.use(helmet());

// Dynamic CORS configuration allowing Render/Vercel production and local origins
const rawClientUrls = (env.CLIENT_URL || '')
  .split(',')
  .map((u) => u.trim().replace(/\/+$/, ''))
  .filter(Boolean);

export const isOriginAllowed = (origin) => {
  if (!origin) return true; // Server-to-server, curl, Postman
  const cleanOrigin = origin.replace(/\/+$/, '');
  if (rawClientUrls.includes(cleanOrigin)) return true;
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(cleanOrigin)) return true;
  if (/^https:\/\/[a-z0-9_-]+(\.vercel\.app)$/i.test(cleanOrigin)) return true;
  return false;
};

export const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body and cookie parsing (supports base64 image uploads up to 10mb)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Reliable health check endpoints (both /health and /api/v1/health return 200 OK)
const healthHandler = (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    timezone: 'Asia/Kolkata',
    version: '1.0.0',
    service: 'TypeLeague Core API',
  });
};

app.get('/health', healthHandler);
app.get('/api/v1/health', healthHandler);

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
