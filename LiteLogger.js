const fs = require("fs");
const path = require("path");

class LiteLogger {
  constructor(directory, folderName, logName = "Log") {
    this.directory = directory;
    this.folderName = folderName;
    this.logName = logName;
    this.path = `${directory}/${folderName}`;
  }

  log(message, messageType = "INFO") {
    const date = new Date();
    const fileName = `${this.logName} - ${
      date.getMonth() + 1
    }_${date.getDate()}_${date.getFullYear()}.log`;

    //If directory does not exist create it.
    if (!fs.existsSync(path.join(this.path))) {
      fs.mkdir(path.join(this.path), (e) => {
        if (e) console.error(e);
        else
          console.info(
            `Log directory ${this.folderName} successfully created!`
          );
      });
    }

    // If file does not exist, create it.
    if (!fs.existsSync(path.join(this.path, fileName))) {
      fs.writeFileSync(path.join(this.path, fileName), "");
    }

    //Creates file stream, flag: "a" is for append
    const logStream = fs.createWriteStream(path.join(this.path, fileName), {
      flags: "a",
    });

    if (typeof message != "string" && typeof message != "number") {
      //What is being written to the file ie: [WARNING] Date - Time - Message - stringify objects so they can be human readable.
      logStream.write(
        `[${messageType}] ${
          date.getMonth() + 1
        }-${date.getDate()}-${date.getFullYear()} - ${
          date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()
        }:${
          date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
        }:${
          date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds()
        } - ${JSON.stringify(message)}\n`
      );
    } else {
      //What is being written to the file ie: [WARNING] Date - Time - Message
      logStream.write(
        `[${messageType}] ${
          date.getMonth() + 1
        }-${date.getDate()}-${date.getFullYear()} - ${
          date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()
        }:${
          date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
        }:${
          date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds()
        } - ${message}\n`
      );
    }

    logStream.end();
  }
}

module.exports = LiteLogger;
