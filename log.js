const log4js = require("log4js");
log4js.configure({
  appenders: {
    normal: {
      type: "dateFile",
      filename: "logs/log",
      pattern: ".yyyy-MM-dd",
      alwaysIncludePattern: true,
      level: 'debug',
      maxLevel: 'warn'
    },
    error: {
      type: "dateFile",
      filename: "logs/error",
      pattern: ".yyyy-MM-dd",
      alwaysIncludePattern: true
    },
    summary: {
      type: "dateFile",
      filename: "logs/summary",
      pattern: ".yyyy-MM-dd",
      alwaysIncludePattern: true
    },
    consoleout: { type: "console" }
  },
  categories: {
    default: { appenders: ["normal", "consoleout"], level: "debug" },
    error: { appenders: ["error", "consoleout"], level: "warn" },
    summary: { appenders: ["summary"], level: "debug" }
  }
});

module.exports = {
  debug: function (log) {
    const logger = log4js.getLogger();
    logger.debug(log)
  },
  info: function (log) {
    const logger = log4js.getLogger();
    logger.info(log)
  },
  warn: function (log) {
    const logger = log4js.getLogger('error');
    logger.warn(log)
  },
  error: function (log) {
    const logger = log4js.getLogger('error');
    logger.error(log)
  },
  summary: function (log) {
    const logger = log4js.getLogger('summary');
    logger.info(log)
  }
}
