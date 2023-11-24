import { Router } from "express";

import { incomingResourceBodyDataAttributesTransformer } from "../middleware/transformer";
import { employeeTransformations } from "../transformations/employee";
import * as AuthenticationController from "../controllers/authentication.controller";

export const authenticationRouter: Router = Router();

authenticationRouter.post(
  "/employees/register",
  incomingResourceBodyDataAttributesTransformer(employeeTransformations),
  AuthenticationController.registerEmployeeHandler
);
