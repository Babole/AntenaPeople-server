import { Router } from "express";

import { employeeTransformations } from "../transformations/employee";
import * as AuthenticationController from "../controllers/authentication.controller";
import * as auth from "../middleware/auth";
import * as transformer from "../middleware/transformer";

export const authenticationRouter: Router = Router();

authenticationRouter.post(
  "/employees/register",
  transformer.incomingResourceBodyDataAttributesTransformer(
    employeeTransformations
  ),
  AuthenticationController.registerEmployeeHandler
);

authenticationRouter.post(
  "/employees/email-status/:token",
  auth.verifyEmailConfirmationToken,
  AuthenticationController.emailConfirmationHandler
);
