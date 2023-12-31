import { NextFunction, Request, Response } from "express";

import * as apiModels from "../models/AntenaPeople";
import * as authenticationMappings from "../mappings/authentication.map";
import * as authenticationService from "../services/authentication.service";
import { Token } from "../models/AuthToken";

export async function registerEmployeeHandler(
  req: Request<
    Record<string, never>,
    apiModels.CreatedEmployee,
    apiModels.CreateEmployeeLoginInfo
  >,
  res: Response<apiModels.CreatedEmployee>,
  next: NextFunction
): Promise<Response | void> {
  try {
    const employeeLoginCredentialsDBInput =
      authenticationMappings.mapApiModelsCreateEmployeeLoginInfoToDBModelsRegisterPrismaEmployeeUpdateInput(
        req.body
      );

    const employeeCNP = req.body.data.attributes.cnp;

    const DBOut = await authenticationService.registerEmployee(
      employeeLoginCredentialsDBInput,
      employeeCNP
    );

    await authenticationService.registeredEmployeeMailer(
      DBOut.email!,
      DBOut.id
    );

    const ApiRes =
      authenticationMappings.mapDBModelsRegisterPrismaEmployeeGetPayloadToApiModelsCreatedEmployee(
        DBOut
      );

    return res
      .status(201)
      .set("Content-Type", "application/vnd.api+json")
      .json(ApiRes);
  } catch (err: any) {
    return next(err);
  }
}

export async function emailConfirmationHandler(
  req: Request<Record<string, never>, apiModels.LoggedinEmployee, null>,
  res: Response<apiModels.LoggedinEmployee, { decodedToken: Token }>,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { employeeId } = res.locals.decodedToken;

    const DBOut = await authenticationService.emailConfirmation(employeeId);

    const ApiRes =
      authenticationMappings.mapDBModelsIDPrismaEmployeeGetPayloadToApiModelsLoggedinEmployee(
        DBOut
      );

    return res
      .status(201)
      .set("Content-Type", "application/vnd.api+json")
      .json(ApiRes);
  } catch (err: any) {
    return next(err);
  }
}

export async function loginEmployeeHandler(
  req: Request<
    Record<string, never>,
    apiModels.LoggedinEmployee,
    apiModels.LoginEmployee
  >,
  res: Response<apiModels.LoggedinEmployee>,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { email, password } = req.body.data.attributes;

    const DBOut = await authenticationService.loginEmployee(email, password);

    const ApiRes =
      authenticationMappings.mapDBModelsIDPrismaEmployeeGetPayloadToApiModelsLoggedinEmployee(
        DBOut
      );

    return res
      .status(201)
      .set("Content-Type", "application/vnd.api+json")
      .json(ApiRes);
  } catch (err: any) {
    return next(err);
  }
}

export async function forgotPasswordHandler(
  req: Request<Record<string, never>, null, apiModels.ForgotPasswordEmployee>,
  res: Response<null>,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { email } = req.body.data.attributes;

    const employeInfoDBOut = await authenticationService.forgotPassword(email);

    // Send email only if email verified and is a currently employed
    if (
      employeInfoDBOut &&
      employeInfoDBOut.currentEmployee &&
      employeInfoDBOut.emailVerified
    ) {
      await authenticationService.forgotPasswordMailer(
        email,
        employeInfoDBOut.id
      );
    }

    return res.status(204).send();
  } catch (err: any) {
    return next(err);
  }
}

export async function resetPasswordHandler(
  req: Request<Record<string, never>, null, apiModels.ResetPasswordEmployee>,
  res: Response<null, { decodedToken: Token }>,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { employeeId } = res.locals.decodedToken;

    const newPasswordDBInput =
      authenticationMappings.mapApiResetPasswordEmployeeToDBModelsResetPasswordPrismaEmployeeUpdateInput(
        req.body
      );

    await authenticationService.resetPassword(newPasswordDBInput, employeeId);

    return res.status(204).send();
  } catch (err: any) {
    return next(err);
  }
}
