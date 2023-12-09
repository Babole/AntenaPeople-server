import { NextFunction, Request, Response } from "express";

import * as apiModels from "../models/AntenaPeople";
import * as leaveRequestsMappings from "../mappings/leaveRequests.map";
import * as leaveRequestsService from "../services/leaveRequests.service";
import { Token } from "../models/AuthToken";

export async function approvalLeaveRequestsHandler(
  req: Request<
    Record<string, never>,
    apiModels.ApprovalLeaveRequests,
    null,
    {
      "filter[status]"?: apiModels.LeaveRequestStatusEnum[];
      "page[number]"?: number;
      "page[size]"?: number;
    }
  >,
  res: Response<apiModels.ApprovalLeaveRequests, { decodedToken: Token }>,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { employeeId } = res.locals.decodedToken;

    const statusFilter = req.query["filter[status]"];
    const pageNumber = req.query["page[number]"];
    const pageSize = req.query["page[size]"];

    const [
      approvalLeaveRequestsPaginated,
      includedEmployees,
      approvalLeaveRequestsCount,
    ] = await leaveRequestsService.listApproval(
      employeeId,
      statusFilter,
      pageNumber,
      pageSize
    );

    const ApiResBody =
      leaveRequestsMappings.mapListApprovalDBResultToApiModelsApprovalLeaveRequests(
        approvalLeaveRequestsPaginated,
        includedEmployees,
        approvalLeaveRequestsCount,
        pageNumber,
        pageSize
      );

    return res
      .status(200)
      .set("Content-Type", "application/vnd.api+json")
      .json(ApiResBody);
  } catch (err: any) {
    return next(err);
  }
}

export async function personalLeaveRequestsHandler(
  req: Request<
    Record<string, never>,
    apiModels.PersonalLeaveRequests,
    null,
    {
      "filter[status]"?: apiModels.LeaveRequestStatusEnum[];
      "page[number]"?: number;
      "page[size]"?: number;
    }
  >,
  res: Response<apiModels.PersonalLeaveRequests, { decodedToken: Token }>,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { employeeId } = res.locals.decodedToken;

    const statusFilter = req.query["filter[status]"];
    const pageNumber = req.query["page[number]"];
    const pageSize = req.query["page[size]"];

    const [
      personalLeaveRequestsPaginated,
      includedEmployees,
      personalLeaveRequestsCount,
    ] = await leaveRequestsService.listPersonal(
      employeeId,
      statusFilter,
      pageNumber,
      pageSize
    );

    const ApiResBody =
      leaveRequestsMappings.mapListPersonalDBResultToApiModelsPersonalLeaveRequests(
        personalLeaveRequestsPaginated,
        includedEmployees,
        personalLeaveRequestsCount,
        pageNumber,
        pageSize
      );

    return res
      .status(200)
      .set("Content-Type", "application/vnd.api+json")
      .json(ApiResBody);
  } catch (err: any) {
    return next(err);
  }
}

export async function createLeaveRequestHandler(
  req: Request<
    Record<string, never>,
    apiModels.CreatedLeaveRequest,
    apiModels.CreateLeaveRequest
  >,
  res: Response<apiModels.CreatedLeaveRequest, { decodedToken: Token }>,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { employeeId } = res.locals.decodedToken;

    const createLeaveRequestDBIn =
      leaveRequestsMappings.mapApiModelsCreateLeaveRequestToDBModelsPrismaLeaveRequestCreateInput(
        employeeId,
        req.body
      );

    const createdLeaveRequestDBOut =
      await leaveRequestsService.createLeaveRequest(createLeaveRequestDBIn);

    const ApiResBody =
      leaveRequestsMappings.mapCreatedLeaveRequestDBOutToApiModelsCreatedLeaveRequest(
        createdLeaveRequestDBOut
      );

    return res
      .status(201)
      .set("Content-Type", "application/vnd.api+json")
      .json(ApiResBody);
  } catch (err: any) {
    return next(err);
  }
}

export async function updateLeaveRequestHandler(
  req: Request<
    {
      leaveRequestId: string;
    },
    null,
    apiModels.UpdateLeaveRequest
  >,
  res: Response<null, { decodedToken: Token }>,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { leaveRequestId } = req.params;
    const { employeeId } = res.locals.decodedToken;

    const updateLeaveRequestDBIn =
      leaveRequestsMappings.mapApiModelsUpdateLeaveRequestToDBModelsPrismaLeaveRequestUpdateInput(
        req.body
      );

    await leaveRequestsService.updateLeaveRequest(
      updateLeaveRequestDBIn,
      leaveRequestId,
      employeeId
    );

    return res.status(204).send();
  } catch (err: any) {
    return next(err);
  }
}
