import * as OpenApiValidator from "express-openapi-validator";
import { HttpError } from "express-openapi-validator/dist/framework/types";
import { Request, Response } from "express";
import path from "path";
import logger from "../utils/logger";

import {
  generateErrorResponse,
  generateValidationErrorResponse,
} from "../errors/helper";
const apiSpec = path.join(
  __dirname,
  "../specification/antenapeople_admin.yaml"
);

export const validatorMiddleware = OpenApiValidator.middleware({
  apiSpec,
});

export const errorHandler = (err: any, req: Request, res: Response) => {
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
