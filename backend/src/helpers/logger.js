import winston from 'winston';
import fs from 'fs';
import path from 'path';


const logDirectory = path.join(new URL('.', import.meta.url).pathname, 'logs');


if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

const colors = {
  error: 'magenta',
  warn: 'yellow',
  info: 'green',
  http: 'red',
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
  new winston.transports.Console({
    level: 'debug',  // To print all levels (error, warn, info, debug)
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
      )
    ),
    // Ensure console output always shows all levels (no filtering based on level)
    silent: false // Remove this line if you want the console to behave as expected for all environments
  }),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error' // Logs error level messages to a file
  }),
  new winston.transports.File({
    filename: 'logs/all.log' // Logs all levels to a file
  })
];

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  format,
  transports
});
