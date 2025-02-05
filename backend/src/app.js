import express from 'express';
import cors from 'cors';
import logger from './helpers/logger';
import { requestLogger } from './helpers/requestLogger';
import errorHandler from './helpers/errors/errorHandler';
import routes from './routes';
import mongoose from 'mongoose';


const app = express();

// Core Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(requestLogger);
app.use(errorHandler);

// Routes
app.use('/api', routes);
// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Basic route
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});