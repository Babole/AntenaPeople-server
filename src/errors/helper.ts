import { DateTime } from "luxon";

import * as apiModels from "../models/AntenaPeople";
import { BaseError } from "./BaseError";
import { HttpError } from "express-openapi-validator/dist/framework/types";

type errorResponse = {
  headers: {
    "Content-Type": string;
  };
  status: number;
  body: apiModels.Errors;
};
function getCurrentTimestamp(): string {
  return DateTime.utc().toFormat("dd.MM.yyyy HH:mm:ss Z");
}
const correlationId: string = (
  Math.floor(Math.random() * 90000000) + 10000000
).toString();

/**
 * Utility Function that Generates an Error Response from Custom Errors
 * @param error The Error
 * @returns The Error Response Object
 */
export function generateErrorResponse(error: Error): errorResponse {
  let errorResponse: apiModels.Errors = {
    errors: [
      {
        code: "INTERNAL_SERVER_ERROR",
        title: "Internal Server Error",
      },
    ],
    meta: {
      status: "500",
      timestamp: getCurrentTimestamp(),
      correlationId: correlationId,
    },
  };
  let status: number = 500;

  if (error instanceof BaseError) {
    errorResponse = {
      errors: [
        {
          code: error.code,
          title: error.title,
        },
      ],
      meta: {
        status: error.status.toString(),
        timestamp: getCurrentTimestamp(),
        correlationId: correlationId,
      },
    };
    if (error.detail) errorResponse.errors[0]["detail"] = error.detail;
    if (error.source) errorResponse.errors[0]["source"] = error.source;

    status = error.status;
  }

  return {
    headers: {
      "Content-Type": "application/vnd.api+json",
    },
    status,
    body: errorResponse,
  };
}

/**
 * Utility Function that Generates an Error Response from Validation Errors
 * @param validationErrors The Validation Errors
 * @returns The Error Response Object
 */
export function generateValidationErrorResponse(
  validationErrors: HttpError
): errorResponse {
  const errorResponse: apiModels.Errors = {
    errors: validationErrors.errors.map((error) => ({
      code: validationErrors.name.toUpperCase().replace(/ /g, "_"),
      title: validationErrors.name,
      detail: error.message,
      source: {
        pointer: error.path,
      },
    })),
    meta: {
      status: validationErrors.status.toString(),
      timestamp: getCurrentTimestamp(),
      correlationId: correlationId,
    },
  };

  return {
    headers: {
      "Content-Type": "application/json",
    },
    status: validationErrors.status,
    body: errorResponse,
  };
}
