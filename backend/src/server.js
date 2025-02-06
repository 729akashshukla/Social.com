import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import {logger} from './helpers/logger.js';


dotenv.config();


process.on('uncaughtException', err => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message, err.stack);
  process.exit(1);
});


const startServer = async () => {
  try {
    await connectDB();
    logger.info('Database connection successful');
    const server = http.createServer(app);
    const PORT = process.env.PORT || 5000;

  
    server.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      if (process.env.NODE_ENV === 'development') {
        logger.info(`API documentation available at http://localhost:${PORT}/api-docs`);
      }
    });

   
    process.on('unhandledRejection', err => {
      logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
      logger.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

  
    process.on('SIGTERM', () => {
      logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
      server.close(() => {
        logger.info('💥 Process terminated!');
      });
    });

  } catch (error) {
    logger.error('Database connection error:', error);
    process.exit(1);
  }
};


startServer();