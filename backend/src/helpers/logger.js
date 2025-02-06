import winston from 'winston';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue'
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error'
  }),
  new winston.transports.File({
    filename: 'logs/all.log'
  })
];

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  format,
  transports
});

// src/helpers/asyncHandler.js
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Example usage of async handler with more complex error capture
export const asyncHandlerWithRetry = (fn, retries = 3) => {
  return async (req, res, next) => {
    let lastError;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await fn(req, res, next);
      } catch (error) {
        lastError = error;
        if (error instanceof ApiError) {
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    next(lastError);
  };
};