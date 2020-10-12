export interface Logger {
  error(message: string): void;
  warn(message: string): void;
  info(message: string): void;
  verbose(message: string): void;
}

export type LogLevel = 1 | 2 | 3 | 4 | 5;
