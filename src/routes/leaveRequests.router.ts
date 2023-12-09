import { Router } from "express";

import * as leaveRequestsController from "../controllers/leaveRequests.controller";
import * as auth from "../middleware/auth";
import { TokenTypeEnum } from "../models/AuthToken";

const leaveRequestsRouter: Router = Router();

leaveRequestsRouter.get(
  "/employees/@me/leave-approvals",
  auth.verifyToken(TokenTypeEnum.ACCESS_USER),
  leaveRequestsController.approvalLeaveRequestsHandler
);

leaveRequestsRouter.get(
  "/employees/@me/leave-requests",
  auth.verifyToken(TokenTypeEnum.ACCESS_USER),
  leaveRequestsController.personalLeaveRequestsHandler
);

leaveRequestsRouter.post(
  "/employees/@me/leave-requests",
  auth.verifyToken(TokenTypeEnum.ACCESS_USER),
  leaveRequestsController.createLeaveRequestHandler
);

leaveRequestsRouter.patch(
  "/leave-requests/:leaveRequestId",
  auth.verifyToken(TokenTypeEnum.ACCESS_USER),
  leaveRequestsController.updateLeaveRequestHandler
);

export default leaveRequestsRouter;
