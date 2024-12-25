import winston from 'winston';
import path from 'path';

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define log colors
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};

// Tell winston about our colors
winston.addColors(colors);

// Create a custom format with timestamp and colorization
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
);

// Define log transports
const transports = [
    // Console transport
    new winston.transports.Console(),
    
    // Error log file
    new winston.transports.File({
        filename: path.join(__dirname, '../logs/error.log'),
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5
    }),
    
    // Combined log file
    new winston.transports.File({
        filename: path.join(__dirname, '../logs/combined.log'),
        maxsize: 5242880, // 5MB
        maxFiles: 5
    })
];

// Create the logger
const logger = winston.createLogger({
    level: 'debug',
    levels,
    format,
    transports
});

// Custom logging methods
logger.logRequest = (req, level = 'info') => {
    logger[level](`${req.method} ${req.url} - IP: ${req.ip}`);
};

logger.logError = (error, context = {}) => {
    logger.error(JSON.stringify({
        message: error.message,
        stack: error.stack,
        ...context
    }));
};

export default logger;

export default {};
