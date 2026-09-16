class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource', id = '') {
    super(`${resource} not found${id ? `: ${id}` : ''}`, 404);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = undefined) {
    super(message, 400);
    this.details = details;
  }
}

module.exports = { AppError, NotFoundError, ValidationError };
