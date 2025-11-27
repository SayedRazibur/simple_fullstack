/* eslint-disable no-constant-binary-expression */
/* eslint-disable no-undef */
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import hpp from 'hpp';
import helmet from 'helmet';
import { xss } from 'express-xss-sanitizer';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import os from 'os';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { globalLimiter } from './src/middlewares/limiter.middleware.js';
import {
  globalErrorHandler,
  notFoundMiddleware,
} from './src/middlewares/error.middleware.js';
import { mountRoutes } from './src/routes/index.js';
import config from './src/config/index.js';

dotenv.config({ quiet: true });

const app = express();
const httpServer = createServer(app);

const isProduction = config.NODE_ENV === 'production';
const PORT = config.PORT || 5000;

const allowedOrigins = config.CORS_ALLOWED_ORIGINS;

const socketAllowedOrigins = config.SOCKET_ALLOWED_ORIGINS
  ? config.SOCKET_ALLOWED_ORIGINS
  : allowedOrigins;

app.use(
  helmet({
    contentSecurityPolicy: isProduction ? undefined : false,
    crossOriginEmbedderPolicy: isProduction ? undefined : false,
    hsts: isProduction
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
    frameguard: { action: 'sameorigin' },
    hidePoweredBy: true,
    xssFilter: true,
    noSniff: true,
  })
);
app.use(hpp());
app.use(xss());

app.use(
  cors({
    origin: [
      'https://speechceucom.vercel.app',
      'https://lms-super-admin-dashboard.netlify.app',
      'http://localhost:5173',
    ],
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    optionsSuccessStatus: 204,
  })
);

export const io = new Server(httpServer, {
  cors: {
    origin: socketAllowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
});

app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());
app.use(globalLimiter);

if (isProduction) app.set('trust proxy', 1);

app.get('/health', (req, res) => {
  const healthData = {
    code: 200,
    success: true,
    status: 'UP',
    service: 'Speechceu Server',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    hostname: os.hostname(),
    environment: config.NODE_ENV || 'development',
    platform: os.platform(),
    nodeVersion: process.version,
  };

  res.status(200).json(healthData);
});

app.get('/', (req, res) => {
  res.status(200).json({
    code: 200,
    success: true,
    message: 'Welcome to  API Server 🚀',
    documentation: `${req.protocol}://${req.get('host')}/api/docs` || '',
    version: config.API_VERSION || '1.0.0',
  });
});

mountRoutes(app);

app.use(notFoundMiddleware);
app.use(globalErrorHandler);

export { httpServer, PORT };
export default app;
