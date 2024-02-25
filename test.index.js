const LiteLogger = require("./LiteLogger");
const logger = new LiteLogger(__dirname);

logger.log({ test: "test" }, "ERROR");
logger.log("test");
