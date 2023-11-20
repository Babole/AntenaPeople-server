import { BaseError, ErrorSource } from "./BaseError";

/**
 * Unauthorized Error Thrown when User Credentials are Incorrect
 */
export class UnauthorizedError extends BaseError {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  readonly code = "UNAUTHORIZED_ERROR";
  readonly title = "Unauthorized Error";
  readonly status = 401;
}

/**
 * Forbidden Error Thrown when User is NOT in Server/Appropriate Role
 */
export class ForbiddenError extends BaseError {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  readonly code = "FORBIDDEN_ERROR";
  readonly title = "Forbidden Error";
  readonly status = 403;
}

/**
 * Not Found Error Thrown when a Resource is NOT Found
 */
export class NotFoundError extends BaseError {
  readonly source?: ErrorSource;
  constructor(message: string, source?: ErrorSource) {
    super(message);
    this.name = this.constructor.name;

    this.source = source;
  }

  readonly code = "NOT_FOUND_ERROR";
  readonly title = "Not Found Error";
  readonly status = 404;
}

/**
 * Prisma Error Thrown when an Unexpected Prisma Error Occurs
 */
export class PrismaError extends BaseError {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  readonly detail = "Underlying Database Issues";
}

/**
 * Error thrown when a Entry Already Exists (Registration Endpoint)
 */
export class EntryAlreadyExistsError extends BaseError {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  readonly code = "CONFLICT";
  readonly title = "Conflict";
  readonly status = 409;
  readonly detail = "Entry Already Exists";
}

/**
 * Error thrown when a Bearer Token has NOT Been Provided
 */
export class MissingTokenError extends BaseError {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  readonly code = "UNAUTHORIZED";
  readonly title = "Unauthorized";
  readonly status = 401;
  readonly detail = "Authorization Token was NOT Provided";
}

/**
 * Error thrown when an Invalid Token has Been Provided
 */
export class InvalidTokenError extends BaseError {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  readonly code = "UNAUTHORIZED";
  readonly title = "Unauthorized";
  readonly status = 401;
  readonly detail = "Invalid Authorization Token was Provided";
}

/**
 * Error thrown when an Expired Token has Been Provided
 */
export class ExpiredTokenError extends BaseError {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  readonly code = "UNAUTHORIZED";
  readonly title = "Unauthorized";
  readonly status = 401;
  readonly detail = "The Authorization token Provided has Expired";
}

/**
 * Error thrown when there is a Validation Issue (Excludes Schema Validation)
 */
export class ValidationError extends BaseError {
  readonly detail: string;
  constructor(message: string, detail: string) {
    super(message);
    this.name = this.constructor.name;

    this.detail = detail;
  }
  readonly code = "VALIDATION_ERROR";
  readonly title = "Validation Error";
  readonly status = 400;
}
