import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Créer un transport pour les logs de fichier
const fileTransport = new DailyRotateFile({
  filename: path.join(process.cwd(), 'logs', 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
});

// Créer un transport pour la console
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...metadata }) => {
      let msg = `${timestamp} [${level}]: ${message} `;
      const metaStr = Object.keys(metadata).length 
        ? JSON.stringify(metadata) 
        : '';
      return msg + metaStr;
    })
  )
});

// Configuration du logger
const logger = winston.createLogger({
  level: process.env.LOGGING_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'chicha-store-backend' },
  transports: [
    fileTransport,
    consoleTransport
  ],
  exceptionHandlers: [
    fileTransport,
    consoleTransport
  ],
  rejectionHandlers: [
    fileTransport,
    consoleTransport
  ]
});

// Middleware de logging pour Express
function expressLogger(req, res, next) {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  });

  next();
}

export { logger, expressLogger };
