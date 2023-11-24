import { HttpError } from "express-openapi-validator/dist/framework/types";
import { Request, Response, NextFunction } from "express";

import logger from "../utils/logger";

import {
  generateErrorResponse,
  generateValidationErrorResponse,
} from "../errors/helper";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(err);
  let errorResponse;
  if (err instanceof HttpError) {
    errorResponse = generateValidationErrorResponse(err);
  } else {
    errorResponse = generateErrorResponse(err);
  }
  res
    .status(errorResponse.status)
    .set(errorResponse.headers)
    .json(errorResponse.body);
};
