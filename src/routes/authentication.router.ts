import { Router } from "express";

import * as AuthenticationController from "../controllers/authentication.controller";
import * as auth from "../middleware/auth";

export const authenticationRouter: Router = Router();

authenticationRouter.post(
  "/employees/register",
  AuthenticationController.registerEmployeeHandler
);

authenticationRouter.post(
  "/employees/email-status/:token",
  auth.verifyEmailConfirmationToken,
  AuthenticationController.emailConfirmationHandler
);

authenticationRouter.post(
  "/employees/login",
  AuthenticationController.loginEmployeeHandler
);

authenticationRouter.post(
  "/employees/forgot-password",
  AuthenticationController.loginEmployeeHandler
);
