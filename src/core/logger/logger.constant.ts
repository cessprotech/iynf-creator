export const ERROR_LOG_FILE = 'logs/app-error.log';

export const LOGGER_NAME = {
  SYSTEM: 'system',

  EVENTS: 'events',
};

export const LOG_CONSTANTS = {
  silent: false,
  max_files: '7d',
  max_size: '10m',
};

//log levels
export const LEVELS = {
  INFO: 'info',

  WARN: 'warn',

  ERROR: 'error',

  EVENT: 'events',

  EXCEPTIONS: 'exceptions',

  REJECTIONS: 'rejections',
};

//default log context
export const DEFAULT_CONTEXT = 'Main';

//logger provider utility function
export const LOG_SERVICE = (context: string) => `LogService${context}`;
