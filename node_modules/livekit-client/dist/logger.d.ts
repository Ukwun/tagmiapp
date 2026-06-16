import log from 'loglevel';
export declare type LogLevelDesc = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent';
export declare enum LogLevel {
    trace = "trace",
    debug = "debug",
    info = "info",
    warn = "warn",
    error = "error",
    silent = "silent"
}
declare const livekitLogger: log.Logger;
export default livekitLogger;
export declare function setLogLevel(level: LogLevel | LogLevelDesc): void;
