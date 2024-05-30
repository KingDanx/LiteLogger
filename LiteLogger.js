const fs = require("fs");
const path = require("path");

class LiteLogger {
  constructor(
    directory,
    logName = "Log",
    folderName = "logs",
    preserveCount = 0 //? Logs will not be deleted
  ) {
    this.directory = directory;
    this.folderName = folderName;
    this.logName = logName;
    this.path = `${directory}/${folderName}`;
    this.preserveCount = preserveCount;
    this.cleanLogs();
  }

  /**
   *
   * @param {string} message
   * @param {string} messageType
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
            `Log directory ${this.folderName} successfully created!`
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
   *
   * @param {string} message
   * @param {string} messageType
   * @param {Date} date
   * @param {string} file
   */
  write(message, messageType, date, file) {
    //? Creates file stream, flag: "a" is for append
    const logStream = fs.createWriteStream(path.join(this.path, file), {
      flags: "a",
    });

    if (typeof message != "string" && typeof message != "number") {
      //? What is being written to the file ie: [WARNING] Date - Time - Message
      logStream.write(
        `[${messageType}] ${
          date.getMonth() + 1
        }-${date.getDate()}-${date.getFullYear()} - ${this.determineLeadingZero(
          date.getHours()
        )}:${this.determineLeadingZero(
          date.getMinutes()
        )}:${this.determineLeadingZero(date.getSeconds())} - ${JSON.stringify(
          message
        )}\n`
      );
    } else {
      logStream.write(
        `[${messageType}] ${
          date.getMonth() + 1
        }-${date.getDate()}-${date.getFullYear()} - ${this.determineLeadingZero(
          date.getHours()
        )}:${this.determineLeadingZero(
          date.getMinutes()
        )}:${this.determineLeadingZero(date.getSeconds())} - ${message}\n`
      );
    }

    logStream.end();
  }

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
    const intervalId = setInterval(clean, 60 * 60 * 1_000);

    //? Clear interval on process exit
    process.on("exit", () => clearInterval(intervalId));
    process.on("SIGINT", () => {
      clearInterval(intervalId);
      process.exit();
    });
    process.on("SIGTERM", () => {
      clearInterval(intervalId);
      process.exit();
    });
  }

  /**
   *
   * @param {number} number
   * @returns {string}
   */
  determineLeadingZero(number) {
    if (number < 10) {
      return `0${number}`;
    }
    return `${number}`;
  }

  /**
   * @deprecated - use this.error() instead
   * @param {string} message
   */
  logError(message) {
    this.log(message, "ERROR");
  }

  /**
   *
   * @param {string} message
   */
  error(message) {
    this.log(message, "ERROR");
  }

  /**
   * @deprecated - use this.warning() instead
   * @param {string} message
   */
  logWarning(message) {
    this.log(message, "WARNING");
  }

  /**
   *
   * @param {string} message
   */
  warning(message) {
    this.log(message, "WARNING");
  }
}

module.exports = LiteLogger;
