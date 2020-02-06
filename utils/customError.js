class CustomError extends Error {
  constructor({ message, code, stack, tags, details }) {
    super(message);

    if (stack) {
      super.stack = stack;
    }

    this.code = code;
    this.tags = tags;
    this.details = details;
  }

  static handleError(message = 'Unexpected error', error = {}, next) {
    const status = error.status || error.code || 500;
    if (error instanceof CustomError) {
      return next(error);
    }
    const err = new CustomError({ message, code: status, stack: error.stack || undefined });
    return next(err);
  }
}

module.exports = CustomError;
