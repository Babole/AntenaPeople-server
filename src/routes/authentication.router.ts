import { Router } from "express";

import * as authenticationController from "../controllers/authentication.controller";
import * as auth from "../middleware/auth";
import { TokenTypeEnum } from "../models/AuthToken";

const authenticationRouter: Router = Router();

authenticationRouter.post(
  "/employees/register",
  authenticationController.registerEmployeeHandler
);

authenticationRouter.post(
  "/employees/email-status",
  auth.verifyToken(TokenTypeEnum.EMAIL_VALIDATION),
  authenticationController.emailConfirmationHandler
);

authenticationRouter.post(
  "/employees/login",
  authenticationController.loginEmployeeHandler
);

authenticationRouter.post(
  "/employees/forgot-password",
  authenticationController.forgotPasswordHandler
);

authenticationRouter.post(
  "/employees/reset-password",
  auth.verifyToken(TokenTypeEnum.PASSWORD_RESET),
  authenticationController.resetPasswordHandler
);

export default authenticationRouter;
