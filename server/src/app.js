import express from 'express';
import cors from 'cors';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { successResponse } from './utils/responseHandler.js';
import authRoutes from './routes/authRoutes.js';
import spaceRoutes from './routes/spaceRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, '') : null,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin.replace(/\/$/, '')) ||
        /\.vercel\.app$/.test(origin) ||
        /\.onrender\.com$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
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
