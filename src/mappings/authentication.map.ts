import * as dbModels from "../models/db/employees.model";
import * as apiModels from "../models/AntenaPeople";

/**
 * Utility Function that Maps the Employee Register request object to the db query input
 * @param employeeLoginInfoReqBody The Employee Registration Request Body
 * @returns The Mapped DTO
 */
export function mapApiModelsCreateEmployeeLoginInfoToDBModelsPrismaEmployeeUpdateInput(
  employeeLoginInfoReqBody: apiModels.CreateEmployeeLoginInfo
): dbModels.PrismaEmployeeUpdateInput {
  const { attributes } = employeeLoginInfoReqBody.data;
  const dbInput: dbModels.PrismaEmployeeUpdateInput = {
    email: attributes?.email,
    password: attributes?.password,
  };

  return dbInput;
}

/**
 * Utility Function that Maps the Created Employee db query result to the Response Object
 * @param createEmployeeQueryResult The Query Result Object
 * @returns The Mapped DTO
 */
export function mapDBModelsPrismaEmployeeGetPayloadRegisteredToApiModelsCreatedEmployee(
  createEmployeeQueryResult: dbModels.PrismaEmployeeGetPayloadRegistered
): apiModels.CreatedEmployee {
  return {
    data: {
      id: createEmployeeQueryResult.id,
      type: apiModels.EmployeesTypeEnum.Employees,
    },
  };
}
