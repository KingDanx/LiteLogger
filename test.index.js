const LoggerLight = require("./LoggerLight");
const logger = new LoggerLight("Test Dir", "Test Logs");

logger.log({ test: "test" }, "ERROR");
logger.log("test");
