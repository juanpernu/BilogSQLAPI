class CustomError extends Error {
  constructor({ message, code }) {
    super(message);
    this.code = code;
  }

  static handleError(message = 'Unexpected error', error = {}) {
    const status = error.status || error.code || 500;
    if (error instanceof CustomError) {
      return error;
    }
    const err = new CustomError({ message, code: status });
    return err;
  }
}

module.exports = CustomError;
