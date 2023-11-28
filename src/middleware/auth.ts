import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import {
  MissingTokenError,
  InvalidTokenError,
  ExpiredTokenError,
  ForbiddenError,
} from "../errors/CustomErrors";
import envConfig from "../utils/envConfig";
import { Token, TokenTypeEnum } from "../models/AuthToken";

export function verifyEmailConfirmationToken(
  req: Request<
    {
      token: string;
    },
    unknown,
    unknown
  >,
  res: Response<unknown, { decodedToken: Token }>,
  next: NextFunction
): void {
  try {
    const { token } = req.params;

    if (!token) {
      throw new MissingTokenError("Missing email confirmation token");
    }

    const decoded = jwt.verify(token, envConfig.JWT_SECRET) as Token;

    if (decoded && decoded.employeeId && decoded.type) {
      if (decoded.type !== TokenTypeEnum.EMAIL_VALIDATION)
        throw new ForbiddenError("No email validation permissions");

      res.locals.decodedToken = decoded;
      return next();
    }

    throw Error("Unexpected authorization error");
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      err = new ExpiredTokenError(err.message);
    } else if (err instanceof jwt.JsonWebTokenError) {
      err = new InvalidTokenError(err.message);
    }
    return next(err);
  }
}
