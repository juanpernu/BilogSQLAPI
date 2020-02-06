const { logger } = require('@services/LoggerService');

module.exports = (err, _req, res, _next) => {
  const { code: status = 500, message = 'Unexpected error'} = err;
  logger.error(`${message} ◆ Status ◆ ${status} ◆ Stack ◆ ${err.stack} ◆`);
  res.status(status).json({ message, status });
};
