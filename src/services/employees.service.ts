import { db } from "../utils/db.server";

import * as dbModels from "../models/db/employees.model";
import * as transformations from "../utils/transformations";
import { PrismaError, NotFoundError } from "../errors/CustomErrors";

// DB Interactions

/**
 * Employee's Personal Summary Function
 * - retrieves employee's information
 * - includes supervisor
 * @param employeeId Employee's unique id (from token)
 * @returns The DB Query Result Object (decrypted)
 */
export const personalSummary = async (
  employeeId: string
): Promise<dbModels.personalSummaryPrismaEmployeeGetPayload> => {
  try {
    const employeeSummary = await db.employee.findUniqueOrThrow({
      where: {
        id: employeeId,
      },
      select: dbModels.personalSummaryPrismaEmployeeSelect,
    });

    // Transform outgoing data
    const transformedEmployeeSummary: dbModels.personalSummaryPrismaEmployeeGetPayload =
      {
        ...employeeSummary,
        name: transformations.decrypt(employeeSummary.name),
        surname: transformations.decrypt(employeeSummary.surname),
        supervisor: employeeSummary.supervisor
          ? {
              ...employeeSummary.supervisor,
              name: transformations.decrypt(employeeSummary.supervisor.name),
              surname: transformations.decrypt(
                employeeSummary.supervisor.surname
              ),
            }
          : null,
      };

    return transformedEmployeeSummary;
  } catch (err: any) {
    if (err.code === "P2025") throw new NotFoundError(err.message);

    throw new PrismaError(err.message);
  }
};

/**
 * List Employee's Subordinates Function
 * - retrieves list of subordinates
 * - includes leave requests initiated
 *   - leave request must have --- (ending date) >= (a month from today)
 *   - leave request must have at least one signature with --- owner = 'INITIATOR'
 * @param employeeId Employee's unique id (from token)
 * @param employmentStatusFilter Employee's employment status filter
 * @returns The DB Query Result Object (decrypted)
 */
export const listSubordinates = async (
  employeeId: string,
  employmentStatusFilter?: boolean
): Promise<dbModels.listSubordinatesPrismaEmployeeGetPayload[]> => {
  try {
    const subordinatesList = await db.employee.findMany({
      where: {
        idSupervisor: employeeId,
        currentEmployee: employmentStatusFilter,
      },
      select: dbModels.listSubordinatesPrismaEmployeeSelect,
    });

    // Transform outgoing data
    const transformedSubordinatesList: dbModels.listSubordinatesPrismaEmployeeGetPayload[] =
      subordinatesList.map((subordinate) => ({
        ...subordinate,
        name: transformations.decrypt(subordinate.name),
        surname: transformations.decrypt(subordinate.surname),
        role: transformations.decrypt(subordinate.role),
      }));

    return transformedSubordinatesList;
  } catch (err: any) {
    if (err.code === "P2025") throw new NotFoundError(err.message);

    throw new PrismaError(err.message);
  }
};
