import jwt from "jsonwebtoken";
import { DateTime } from "luxon";

import * as dbModels from "../models/db/employees.model";
import * as apiModels from "../models/AntenaPeople";
import { Token, TokenTypeEnum } from "../models/AuthToken";
import envConfig from "../utils/envConfig";

/**
 * Utility Function that Maps the Employee Register request object to the db query input
 * @param employeeLoginInfoReqBody The Employee Registration Request Body
 * @returns The Mapped DTO
 */
export function mapApiModelsCreateEmployeeLoginInfoToDBModelsPrismaEmployeeUpdateInput(
  employeeLoginInfoReqBody: apiModels.CreateEmployeeLoginInfo
): dbModels.registerPrismaEmployeeUpdateInput {
  const { attributes } = employeeLoginInfoReqBody.data;
  return {
    email: attributes?.email,
    password: attributes?.password,
  };
}

/**
 * Utility Function that Maps the Created Employee db query result to the verification token
 * @param createEmployeeQueryResult The Query Result Object
 * @returns The Mapped DTO
 */
export function mapDBModelsPrismaEmployeeGetPayloadRegisteredToApiModelsCreatedEmployee(
  createEmployeeQueryResult: dbModels.registerPrismaEmployeeGetPayload
): apiModels.CreatedEmployee {
  return {
    data: {
      id: createEmployeeQueryResult.id,
      type: apiModels.EmployeesTypeEnum.Employees,
    },
  };
}

/**
 * Utility Function that Maps the Employee ID db query result to the Logged in Response Object
 * @param employeeIDQueryResult The Query Result Object
 * @returns The Mapped DTO
 */
export function mapDBModelsPrismaEmployeeGetPayloadIdToApiModelsLoggedinEmployee(
  employeeIDQueryResult: dbModels.IDPrismaEmployeeGetPayload
): apiModels.LoggedinEmployee {
  const payload: Token = {
    employeeId: employeeIDQueryResult.id,
    type: TokenTypeEnum.ACCESS,
  };
  const token = jwt.sign(payload, envConfig.JWT_SECRET, {
    expiresIn: 3600,
  });

  return {
    data: {
      type: apiModels.TokensTypeEnum.Tokens,
      attributes: {
        accessToken: token,
        expiresIn: 3600,
      },
    },
    meta: {
      timestamp: DateTime.utc().toISO()!,
    },
  };
}
