import { NextFunction, Request, Response } from "express";

import * as apiModels from "../models/AntenaPeople";
import * as authenticationMappings from "../mappings/authentication.map";
import * as AuthenticationService from "../services/authentication.service";

export async function registerEmployeeHandler(
  req: Request<
    Record<string, never>,
    apiModels.CreatedEmployee | apiModels.Errors,
    apiModels.CreateEmployeeLoginInfo
  >,
  res: Response<apiModels.CreatedEmployee>,
  next: NextFunction
): Promise<Response | void> {
  try {
    const employeeDBInput =
      authenticationMappings.mapApiModelsCreateEmployeeLoginInfoToDBModelsPrismaEmployeeUpdateInput(
        req.body
      );

    const employeeCNP = req.body.data.attributes.cnp;

    const employeeDBOut = await AuthenticationService.registerEmployee(
      employeeDBInput,
      employeeCNP
    );

    await AuthenticationService.registeredEmployeeMailer(
      employeeDBOut.email!,
      employeeDBOut.id
    );

    const employeeApiRes =
      authenticationMappings.mapDBModelsPrismaEmployeeGetPayloadRegisteredToApiModelsCreatedEmployee(
        employeeDBOut
      );

    return res
      .status(200)
      .set("Content-Type", "application/vnd.api+json")
      .json(employeeApiRes);
  } catch (err: any) {
    return next(err);
  }
}
