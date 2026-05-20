import LiteLogger from "./LiteLogger.js";

const logger = new LiteLogger(import.meta.dirname);

logger.log({ test: "test" }, "ERROR");
logger.log("test");
logger.error(logger);
logger.end();
