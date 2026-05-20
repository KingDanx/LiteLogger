/**
 * A lightweight file-based logging utility that supports log rotation,
 * historical preservation, and separate "latest" log tracking.
 */
export default class LiteLogger {
    /**
     * Creates an instance of LiteLogger.
     * @param {string} directory - The root directory path where logs should be stored.
     * @param {string} [logName="Log"] - The base prefix name for the log files.
     * @param {string} [folderName="logs"] - The name of the folder created inside the root directory.
     * @param {number} [preserveCount=0] - The max age of log files in days before deletion. Set to 0 to disable automated deletion.
     */
    constructor(directory: string, logName?: string, folderName?: string, preserveCount?: number);
    /**
     * @type {string}
     * @public
     */
    public directory: string;
    /**
     * @type {string}
     * @public
     */
    public folderName: string;
    /**
     * @type {string}
     * @public
     */
    public logName: string;
    /**
     * @type {string}
     * @public
     */
    public path: string;
    /**
     * @type {number}
     * @public
     */
    public preserveCount: number;
    /**
     * @type {NodeJS.Timeout | undefined}
     * @private
     */
    private cleanInterval;
    /**
     * Logs a message to both a daily log file and a running "latest" log file.
     * @param {*} message - The payload or text message to log. Can be a string, number, array, or object.
     * @param {string} [messageType="INFO"] - The classification category of the log entry (e.g., INFO, WARN, ERROR).
     * @returns {void}
     */
    log(message: any, messageType?: string): void;
    /**
     * Writes data directly to the specified target log file stream using console.log style formatting.
     * @param {*} message - The message data to be written. Objects and primitives are formatted exactly like a console log.
     * @param {string} messageType - The log entry category level.
     * @param {Date} date - The specific timestamp execution context.
     * @param {string} file - The file name or path relative to the log directory.
     * @returns {void}
     * @private
     */
    private write;
    /**
     * Initiates an interval loop that cleans up the log files directory.
     * Monitors file size overages for the active latest log file, and prunes expired logs.
     * @returns {void}
     * @private
     */
    private cleanLogs;
    /**
     * Utility to standardize single digits with a leading zero for clock/date normalization.
     * @param {number} number - The input integer value.
     * @returns {string} The formatted string, guaranteed to be at least two digits.
     */
    determineLeadingZero(number: number): string;
    /**
     * Logs a message under the "ERROR" classification category level.
     * @deprecated Use the `error()` method instead.
     * @param {*} message - The payload or text error data to log.
     * @returns {void}
     */
    logError(message: any): void;
    /**
     * Logs a message under the "ERROR" classification category level.
     * @param {*} message - The payload or text error data to log.
     * @returns {void}
     */
    error(message: any): void;
    /**
     * Logs a message under the "WARNING" classification category level.
     * @deprecated Use the `warning()` method instead.
     * @param {*} message - The payload or text warning data to log.
     * @returns {void}
     */
    logWarning(message: any): void;
    /**
     * Logs a message under the "WARNING" classification category level.
     * @param {*} message - The payload or text warning data to log.
     * @returns {void}
     */
    warning(message: any): void;
    /**
     * Ends the log cleaning interval so the logger does not hold the process
     */
    end(): void;
}
