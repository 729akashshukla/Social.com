import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { logger } from './helpers/logger.js';

dotenv.config();


process.on('uncaughtException', err => {
  logger.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
  logger.error(`🔥 ${err.name}: ${err.message}`);
  logger.error(`🛠️ Stack Trace: \n${err.stack}`);
  
  setTimeout(() => process.exit(1), 1000); 
});

const startServer = async () => {
  try {
    await connectDB();
    logger.info('✅ Database connection successful');

    const server = http.createServer(app);
    const PORT = process.env.PORT || 5001;

    server.listen(PORT, () => {
      logger.info(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      if (process.env.NODE_ENV === 'development') {
        logger.info(`📜 API Docs available at http://localhost:${PORT}/SocialsApiDocs`);
      }
    });

   
    process.on('unhandledRejection', err => {
      logger.error('💥 UNHANDLED REJECTION! Shutting down...');
      logger.error(`🔥 ${err.name}: ${err.message}`);
      logger.error(`🛠️ Stack Trace: \n${err.stack}`);

      server.close(() => {
        setTimeout(() => process.exit(1), 1000);
      });
    });

    // ✅ SIGTERM (Heroku, AWS, Docker etc. ke liye proper shutdown)
    process.on('SIGTERM', () => {
      logger.warn('👋 SIGTERM RECEIVED. Shutting down gracefully...');
      server.close(() => {
        logger.warn('💥 Process terminated!');
      });
    });

  } catch (error) {
    logger.error('❌ Database Connection Failed!');
    logger.error(`🔥 ${error.name}: ${error.message}`);
    logger.error(`🛠️ Stack Trace: \n${error.stack}`);
    process.exit(1);
  }
};


startServer();
