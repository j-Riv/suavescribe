import {
  createLogger,
  format,
  transports,
  config,
  Logger,
  LeveledLogMethod,
} from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const customLevels: config.AbstractConfigSetLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  access: 6,
};

interface CustomLevels extends Logger {
  access: LeveledLogMethod;
}

const logger: CustomLevels = <CustomLevels>createLogger({
  levels: customLevels,
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'suavescribe' },
  transports: [
    new DailyRotateFile({
      level: 'error',
      filename: './logs/suavescribe-error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
    new DailyRotateFile({
      filename: './logs/suavescribe-combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
    new DailyRotateFile({
      level: 'access',
      filename: './logs/suavescribe-access-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});

//
// If we're not in production then **ALSO** log to the `console`
// with the colorized simple format.
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize({ all: true }), format.simple()),
    })
  );
}

export const stream = {
  write: (message: any) => {
    logger.access(message);
  },
};

export default logger;
