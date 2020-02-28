const ErrorHandler = (err, _req, res, _next) => {
  const status = err.status || err.code || 500;
  const error = {
    message: err.message,
    code: status,
    stack: err.stack,
  }
  res.status(status);
  res.json({ error });
}

module.exports = ErrorHandler;
