/**
 * Production Logger
 * Sensitive data masking and level-based logging
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

interface LogEntry {
  level: LogLevel;
  timestamp: string;
  context: string;
  message: string;
  data?: unknown;
}

// Hassas alanlar - bu alanlar loglanmayacak
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'access_token',
  'refresh_token',
  'api_key',
  'secret',
  'credit_card',
  'ssn',
  'email', // Kısmi maskeleme yapılacak
  'phone', // Kısmi maskeleme yapılacak
];

export class Logger {
  private static globalLevel: LogLevel = __DEV__ ? LogLevel.DEBUG : LogLevel.ERROR;
  private context: string;

  constructor(context: string = 'App') {
    this.context = context;
  }

  static setGlobalLevel(level: LogLevel): void {
    Logger.globalLevel = level;
  }

  debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, error?: Error | unknown): void {
    const errorData = error instanceof Error
      ? { name: error.name, message: error.message, stack: __DEV__ ? error.stack : undefined }
      : error;
    this.log(LogLevel.ERROR, message, errorData);
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    if (level < Logger.globalLevel) return;

    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      context: this.context,
      message,
      data: data ? this.maskSensitiveData(data) : undefined,
    };

    const levelName = LogLevel[level];
    const prefix = `[${entry.timestamp}] [${levelName}] [${this.context}]`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(prefix, message, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, entry.data || '');
        break;
      case LogLevel.ERROR:
        console.error(prefix, message, entry.data || '');
        break;
    }

    // Production'da hata raporlama servisine gönder
    // if (!__DEV__ && level >= LogLevel.ERROR) {
    //   this.reportToService(entry);
    // }
  }

  private maskSensitiveData(data: unknown): unknown {
    if (data === null || data === undefined) return data;
    if (typeof data !== 'object') return data;

    if (Array.isArray(data)) {
      return data.map(item => this.maskSensitiveData(item));
    }

    const masked: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();

      if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
        if (lowerKey.includes('email') && typeof value === 'string') {
          // Email kısmi maskeleme: j***@example.com
          masked[key] = this.maskEmail(value);
        } else if (lowerKey.includes('phone') && typeof value === 'string') {
          // Telefon kısmi maskeleme: ***XXXX
          masked[key] = this.maskPhone(value);
        } else {
          masked[key] = '[REDACTED]';
        }
      } else if (typeof value === 'object') {
        masked[key] = this.maskSensitiveData(value);
      } else {
        masked[key] = value;
      }
    }

    return masked;
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return '***@***';
    return `${local[0]}***@${domain}`;
  }

  private maskPhone(phone: string): string {
    if (phone.length < 4) return '***';
    return `***${phone.slice(-4)}`;
  }
}

// Global logger instance
export const logger = new Logger('App');

export default Logger;
