import fs from "fs";
import path from "path";
import util from "util";

/**
 * A lightweight file-based logging utility that supports log rotation,
 * historical preservation, and separate "latest" log tracking.
 */
class LiteLogger {
  /**
   * Creates an instance of LiteLogger.
   * @param {string} directory - The root directory path where logs should be stored.
   * @param {string} [logName="Log"] - The base prefix name for the log files.
   * @param {string} [folderName="logs"] - The name of the folder created inside the root directory.
   * @param {number} [preserveCount=0] - The max age of log files in days before deletion. Set to 0 to disable automated deletion.
   */
  constructor(
    directory,
    logName = "Log",
    folderName = "logs",
    preserveCount = 0, //? Logs will not be deleted
  ) {
    /**
     * @type {string}
     * @public
     */
    this.directory = directory;

    /**
     * @type {string}
     * @public
     */
    this.folderName = folderName;

    /**
     * @type {string}
     * @public
     */
    this.logName = logName;

    /**
     * @type {string}
     * @public
     */
    this.path = `${directory}/${folderName}`;

    /**
     * @type {number}
     * @public
     */
    this.preserveCount = preserveCount;

    /**
     * @type {NodeJS.Timeout | undefined}
     * @private
     */
    this.cleanInterval;

    this.cleanLogs();
  }

  /**
   * Logs a message to both a daily log file and a running "latest" log file.
   * @param {*} message - The payload or text message to log. Can be a string, number, array, or object.
   * @param {string} [messageType="INFO"] - The classification category of the log entry (e.g., INFO, WARN, ERROR).
   * @returns {void}
   */
  log(message, messageType = "INFO") {
    const date = new Date();
    const fileName = `${this.logName} - ${date.getFullYear()}_${
      date.getMonth() + 1
    }_${date.getDate()}.log`;

    const latest = `${this.logName} - latest.log`;

    //? If directory does not exist create it.
    if (!fs.existsSync(path.join(this.path))) {
      fs.mkdir(path.join(this.path), (e) => {
        if (e) console.error(e);
        else
          console.info(
            `Log directory ${this.folderName} successfully created!`,
          );
      });
    }

    //? If file does not exist, create it.
    if (!fs.existsSync(path.join(this.path, fileName))) {
      fs.writeFileSync(path.join(this.path, fileName), "");
    }

    //? If file does not exist, create it.
    if (!fs.existsSync(path.join(this.path, latest))) {
      fs.writeFileSync(path.join(this.path, latest), "");
    }

    this.write(message, messageType, date, fileName);
    this.write(message, messageType, date, latest);
  }

  /**
   * Writes data directly to the specified target log file stream using console.log style formatting.
   * @param {*} message - The message data to be written. Objects and primitives are formatted exactly like a console log.
   * @param {string} messageType - The log entry category level.
   * @param {Date} date - The specific timestamp execution context.
   * @param {string} file - The file name or path relative to the log directory.
   * @returns {void}
   * @private
   */
  write(message, messageType, date, file) {
    //? Creates file stream, flag: "a" is for append
    const logStream = fs.createWriteStream(path.join(this.path, file), {
      flags: "a",
    });

    //? Formats the payload exactly like console.log outputs strings, multi-line objects, etc.
    const formattedMessage = util.format(message);

    const timestamp = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()} - ${this.determineLeadingZero(
      date.getHours(),
    )}:${this.determineLeadingZero(
      date.getMinutes(),
    )}:${this.determineLeadingZero(date.getSeconds())}`;

    logStream.write(`[${messageType}] ${timestamp} - ${formattedMessage}\n`);
    logStream.end();
  }

  /**
   * Initiates an interval loop that cleans up the log files directory.
   * Monitors file size overages for the active latest log file, and prunes expired logs.
   * @returns {void}
   * @private
   */
  cleanLogs() {
    const clean = () => {
      fs.readdir(this.path, (err, files) => {
        if (err) {
          this.error(err.toString());
          return;
        }

        if (files.length === 0) {
          this.error("No files were found");
          return;
        }

        files.forEach((file) => {
          const filePath = path.join(this.path, file);

          fs.stat(filePath, (err, stats) => {
            if (err) {
              this.error(`Error getting stats for file ${file}`);
              return;
            }

            //? if the latest file grows over 50mb delete it and recreate it.
            if (file.includes("latest") && stats.size > 52428800) {
              fs.rm(filePath, (err) => {
                if (err) {
                  return this.error(`Error deleting file ${filePath}`);
                }
                fs.writeFileSync(path.join(this.path, filePath), "");
              });
            }

            const secondsInDay = 60_000 * 60 * 24;
            const fileAgeInDays = (Date.now() - stats.mtimeMs) / secondsInDay;

            //? if the file age in days is larger than our preserve count
            if (this.preserveCount && fileAgeInDays > this.preserveCount) {
              fs.rm(filePath, (err) => {
                if (err) {
                  return this.error(`Error deleting file ${filePath}`);
                }
              });
            }
          });
        });
      });
    };

    //? Run immediately, then every hour
    clean();
    this.cleanInterval = setInterval(clean, 60 * 60 * 1_000);

    //? Clear interval on process exit
    process.on("exit", () => clearInterval(this.cleanInterval));
    process.on("SIGINT", () => {
      clearInterval(this.cleanInterval);
      process.exit();
    });
    process.on("SIGTERM", () => {
      clearInterval(this.cleanInterval);
      process.exit();
    });
  }

  /**
   * Utility to standardize single digits with a leading zero for clock/date normalization.
   * @param {number} number - The input integer value.
   * @returns {string} The formatted string, guaranteed to be at least two digits.
   */
  determineLeadingZero(number) {
    if (number < 10) {
      return `0${number}`;
    }
    return `${number}`;
  }

  /**
   * Logs a message under the "ERROR" classification category level.
   * @deprecated Use the `error()` method instead.
   * @param {*} message - The payload or text error data to log.
   * @returns {void}
   */
  logError(message) {
    this.log(message, "ERROR");
  }

  /**
   * Logs a message under the "ERROR" classification category level.
   * @param {*} message - The payload or text error data to log.
   * @returns {void}
   */
  error(message) {
    this.log(message, "ERROR");
  }

  /**
   * Logs a message under the "WARNING" classification category level.
   * @deprecated Use the `warning()` method instead.
   * @param {*} message - The payload or text warning data to log.
   * @returns {void}
   */
  logWarning(message) {
    this.log(message, "WARNING");
  }

  /**
   * Logs a message under the "WARNING" classification category level.
   * @param {*} message - The payload or text warning data to log.
   * @returns {void}
   */
  warning(message) {
    this.log(message, "WARNING");
  }

  /**
   * Ends the log cleaning interval so the logger does not hold the process
   */
  end() {
    clearInterval(this.cleanInterval);
  }
}

export default LiteLogger;
module.exports = LiteLogger;
