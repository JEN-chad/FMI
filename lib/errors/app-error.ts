export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly errorCode: string,
    message: string,
    public readonly details: unknown = null
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found", details?: unknown) {
    super(404, "NOT_FOUND", message, details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Validation failed", details?: unknown) {
    super(400, "VALIDATION_ERROR", message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized", details?: unknown) {
    super(401, "UNAUTHORIZED", message, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden", details?: unknown) {
    super(403, "FORBIDDEN", message, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource conflict", details?: unknown) {
    super(409, "CONFLICT", message, details);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = "Database operation failed", details?: unknown) {
    super(500, "DATABASE_ERROR", message, details);
  }
}
