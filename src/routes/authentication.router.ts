import { Router } from "express";

import * as AuthenticationController from "../controllers/authentication.controller";
import * as auth from "../middleware/auth";
import { TokenTypeEnum } from "../models/AuthToken";

export const authenticationRouter: Router = Router();

authenticationRouter.post(
  "/employees/register",
  AuthenticationController.registerEmployeeHandler
);

authenticationRouter.post(
  "/employees/email-status",
  auth.verifyToken(TokenTypeEnum.EMAIL_VALIDATION),
  AuthenticationController.emailConfirmationHandler
);

authenticationRouter.post(
  "/employees/login",
  AuthenticationController.loginEmployeeHandler
);

authenticationRouter.post(
  "/employees/forgot-password",
  AuthenticationController.forgotPasswordHandler
);

authenticationRouter.post(
  "/employees/reset-password",
  auth.verifyToken(TokenTypeEnum.PASSWORD_RESET),
  AuthenticationController.resetPasswordHandler
);
