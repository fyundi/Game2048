// src/utils/Logger.ts

enum LogLevel {
    DEBUG, // 调试信息
    INFO,  // 常规信息
    WARN,  // 警告信息
    ERROR  // 错误信息
}

class Logger {
    private static level: LogLevel = LogLevel.INFO;
    private static enableLogging: boolean = true;

    public static setLevel(newLevel: LogLevel): void {
        Logger.level = newLevel;
    }

    public static enable(): void {
        Logger.enableLogging = true;
    }

    public static disable(): void {
        Logger.enableLogging = false;
    }

    private static getTimestamp(): string {
        return new Date().toISOString();
    }

    private static shouldLog(level: LogLevel): boolean {
        return Logger.enableLogging && level >= Logger.level;
    }

    public static debug(...args: any[]): void {
        if (Logger.shouldLog(LogLevel.DEBUG)) {
            console.debug(Logger.getTimestamp(), '[DEBUG]', ...args);
        }
    }

    public static info(...args: any[]): void {
        if (Logger.shouldLog(LogLevel.INFO)) {
            console.info(Logger.getTimestamp(), '[INFO]', ...args);
        }
    }

    public static warn(...args: any[]): void {
        if (Logger.shouldLog(LogLevel.WARN)) {
            console.warn(Logger.getTimestamp(), '[WARN]', ...args);
        }
    }

    public static error(...args: any[]): void {
        if (Logger.shouldLog(LogLevel.ERROR)) {
            console.error(Logger.getTimestamp(), '[ERROR]', ...args);
        }
    }
}

export { Logger, LogLevel };
