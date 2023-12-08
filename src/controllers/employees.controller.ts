import { NextFunction, Request, Response } from "express";

import * as apiModels from "../models/AntenaPeople";
import * as employeesMappings from "../mappings/employees.map";
import * as employeesService from "../services/employees.service";
import { Token } from "../models/AuthToken";

export async function personalSummaryHandler(
  req: Request<Record<string, never>, apiModels.EmployeePersonalSummary, null>,
  res: Response<apiModels.EmployeePersonalSummary, { decodedToken: Token }>,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { employeeId } = res.locals.decodedToken;

    const personalSummaryDBOut = await employeesService.personalSummary(
      employeeId
    );

    const ApiRes =
      employeesMappings.mapDBModelsPersonalSummaryPrismaEmployeeGetPayloadToApiModelsEmployeePersonalSummary(
        personalSummaryDBOut
      );

    return res
      .status(200)
      .set("Content-Type", "application/vnd.api+json")
      .json(ApiRes);
  } catch (err: any) {
    return next(err);
  }
}

export async function listSubordinatesHandler(
  req: Request<
    Record<string, never>,
    apiModels.SubordinatesSummary,
    null,
    {
      "filter[currentEmployee]"?: boolean;
    }
  >,
  res: Response<apiModels.SubordinatesSummary, { decodedToken: Token }>,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { employeeId } = res.locals.decodedToken;
    const employmentStatus = req.query["filter[currentEmployee]"];

    const subordinatesListDBOut = await employeesService.listSubordinates(
      employeeId,
      employmentStatus
    );

    const subordinatesListApiRes =
      employeesMappings.mapDBModelsListSubordinatesPrismaEmployeeGetPayloadToApiModelsSubordinatesSummary(
        subordinatesListDBOut
      );

    return res
      .status(200)
      .set("Content-Type", "application/vnd.api+json")
      .json(subordinatesListApiRes);
  } catch (err: any) {
    return next(err);
  }
}
