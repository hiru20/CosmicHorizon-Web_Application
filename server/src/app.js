import express from 'express';
import cors from 'cors';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { successResponse } from './utils/responseHandler.js';
import authRoutes from './routes/authRoutes.js';
import spaceRoutes from './routes/spaceRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/api/health', (req, res) => {
  return successResponse(res, {
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'CosmicHorizon API'
  }, 'CosmicHorizon API is operating normally');
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/space', spaceRoutes);
app.use('/api/user', userRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
