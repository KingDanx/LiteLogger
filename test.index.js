const LoggerLight = require("./LoggerLight");
const logger = new LoggerLight("Test Dir", "Test Logs");

logger.log({ test: "test" });
logger.log("test");
