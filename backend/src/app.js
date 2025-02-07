import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import session from 'express-session';
import './config/passport.js';
import sessionConfig from './config/session.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import statusRoutes from './routes/statusRoutes.js';
import streakRoutes from './routes/streakRoutes.js';
import { errorHandler } from './helpers/errors/errorHandler.js';
import { logger } from './helpers/logger.js';  // Importing logger
import apiDocsRoute from "./apiDocs.js";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";


const app = express();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "API documentation for my app",
    },
  },
  apis: ["./src/routes/*.js"], // Define your API routes here
};

// Generate Swagger Specification
const swaggerSpec = swaggerJsdoc(options);

// Serve the OpenAPI JSON file dynamically
app.get("/openapi.json", (req, res) => {
  res.json(swaggerSpec);
});


app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false
}));

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,  // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again in 15 minutes',
  standardHeaders: true,
  legacyHeaders: false 
});

app.use('/api', limiter);
app.use(mongoSanitize());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
app.use(apiDocsRoute);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Middleware for logging every request
app.use((req, res, next) => {
  logger.info(`Request Method: ${req.method}, Request URL: ${req.url}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/streaks', streakRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    uptime: process.uptime() 
  });
});

// 404 handler
app.all('*', (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.status = 'fail';
  err.statusCode = 404;
  logger.error(`404 Error: ${err.message} - ${req.originalUrl}`); // Logging 404 errors
  next(err);
});

// Error handler middleware
app.use(errorHandler);

export default app;
