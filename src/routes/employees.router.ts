import { Router } from "express";

import * as employeesController from "../controllers/employees.controller";
import * as auth from "../middleware/auth";
import { TokenTypeEnum } from "../models/AuthToken";

const employeesRouter: Router = Router();

employeesRouter.get(
  "/employees/@me",
  auth.verifyToken(TokenTypeEnum.ACCESS_USER),
  employeesController.personalSummaryHandler
);

employeesRouter.get(
  "/employees/@me/subordinates",
  auth.verifyToken(TokenTypeEnum.ACCESS_USER),
  employeesController.listSubordinatesHandler
);

export default employeesRouter;
