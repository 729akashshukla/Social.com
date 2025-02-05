import cors from 'cors';
import logger from './helpers/logger.js';
import { requestLogger } from './helpers/requestLogger.js';

const corsOptions = {
  origin: import.meta.env.VITE_CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(requestLogger);
app.use(cors(corsOptions));
app.use(cors({
    origin: process.env.VITE_CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }));