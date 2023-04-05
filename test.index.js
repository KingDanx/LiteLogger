const LiteLogger = require("./LiteLogger");
const logger = new LiteLogger(__dirname, "Test Dir", "Test Logs");

logger.log({ test: "test" }, "ERROR");
logger.log("test");
