import { Logger, LogLevel } from './types';

export const defaultLogger: Logger = {
  error(message) {
    throw new Error(message);
  },
  warn(message) {
    console.warn(message);
  },
  info(message) {
    console.info(message);
  },
  verbose(message) {
    console.log(message);
  },
};

export const wrapLogger = (logger: Logger, level: LogLevel): Logger => {
  return {
    error(message) {
      level >= 1 && logger.error(message);
    },
    warn(message) {
      level >= 2 && logger.warn(message);
    },
    info(message) {
      level >= 3 && logger.info(message);
    },
    verbose(message) {
      level >= 4 && logger.verbose(message);
    },
  };
}
