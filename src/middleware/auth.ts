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

export const verifyToken = (permissions: TokenTypeEnum) => {
  return (
    req: Request,
    res: Response<unknown, { decodedToken: Token }>,
    next: NextFunction
  ): void => {
    try {
      const header = req.headers.authorization;

      if (!header) {
        throw new MissingTokenError("Missing authorization token");
      }

      const token = header.split(" ")[1];

      if (!token) {
        throw new MissingTokenError("Missing authorization token");
      }

      const decoded = jwt.verify(token, envConfig.JWT_SECRET) as Token;

      if (decoded && decoded.employeeId && decoded.type) {
        if (decoded.type !== permissions)
          throw new ForbiddenError(
            `Missing permissions for ${permissions}`,
            "Missing permissions."
          );

        res.locals.decodedToken = decoded;
        return next();
      }

      throw Error("Unexpected authorization error");
    } catch (err: any) {
      if (err instanceof jwt.TokenExpiredError) {
        err = new ExpiredTokenError(err.message);
      } else if (err instanceof jwt.JsonWebTokenError) {
        err = new InvalidTokenError(err.message);
      }
      return next(err);
    }
  };
};
