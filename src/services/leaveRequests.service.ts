import { db } from "../utils/db.server";
import { LeaveRequestStatus } from "@prisma/client";
import { LeaveType } from "@prisma/client";

import {
  BadRequestError,
  NotFoundError,
  PrismaError,
} from "../errors/CustomErrors";
import * as dbModels from "../models/db/leaveRequests.model";
import * as employeesdbModels from "../models/db/employees.model";
import * as transformations from "../utils/transformations";
import { BaseError } from "../errors/BaseError";

/**
 * List Approval Leave Requests Function
 * - retrieves list of leave requests under employee's approval (employeeId = substitute | supervisor | HR)
 *   - leave requests will be ordered by modifiedAt ascending
 *   - leave requests must have initiator be currently employed
 *   - relationships to all employees responsible for the request (initiator, substitute, supervisor, HR)
 * - retrieves summary about initiators AND substitutes
 * - retrieves count of approval leave requests
 * @param employeeId Employee's unique id (from token)
 * @param leaveRequestStatusFilter Status of Leave Request
 * @param pageNumber Page Number (zero-based) for Pagination
 * @param pageSize Page Size for Pagination
 * @returns [Paginated Approval Leave Requests, Included Employees, Approval Leave Requests Count]
 */
export const listApproval = async (
  employeeId: string,
  leaveRequestStatusFilter?: LeaveRequestStatus[],
  pageNumber?: number,
  pageSize?: number
): Promise<
  [
    dbModels.listApprovalPrismaLeaveRequestGetPayload[],
    dbModels.includedEmployee[],
    number
  ]
> => {
  try {
    let skipRecords: number | undefined;
    // pageNumber can be zero but pageSize cannot(would result in inf total pages)
    if (pageNumber !== undefined && pageSize) {
      skipRecords = pageNumber * pageSize;
    }

    const [approvalLeaveRequestsCount, approvalLeaveRequestsPage] =
      await Promise.all([
        db.leaveRequest.count({
          where: dbModels.listApprovalPrismaLeaveRequestWhereInput(
            employeeId,
            leaveRequestStatusFilter
          ),
        }),
        db.leaveRequest.findMany({
          skip: skipRecords,
          take: pageSize,
          orderBy: {
            modifiedAt: "asc",
          },
          where: dbModels.listApprovalPrismaLeaveRequestWhereInput(
            employeeId,
            leaveRequestStatusFilter
          ),
          select: dbModels.listApprovalPrismaLeaveRequestSelect,
        }),
      ]);

    // Transform and filter outgoing data
    const uniqueEmployees = new Set();
    const transformedIncludedEmployees: dbModels.includedEmployee[] = [];
    approvalLeaveRequestsPage.forEach((request) => {
      const { initiator, substitute } = request;

      if (!uniqueEmployees.has(initiator.id)) {
        transformedIncludedEmployees.push({
          id: initiator.id,
          name: transformations.decrypt(initiator.name),
          surname: transformations.decrypt(initiator.surname),
          role: transformations.decrypt(initiator.role),
        });
        uniqueEmployees.add(initiator.id);
      }

      if (!uniqueEmployees.has(substitute.id)) {
        transformedIncludedEmployees.push({
          id: substitute.id,
          name: transformations.decrypt(substitute.name),
          surname: transformations.decrypt(substitute.surname),
          role: transformations.decrypt(substitute.role),
        });
        uniqueEmployees.add(substitute.id);
      }
    });

    return [
      approvalLeaveRequestsPage,
      transformedIncludedEmployees,
      approvalLeaveRequestsCount,
    ];
  } catch (err: any) {
    if (err.code === "P2025") throw new NotFoundError(err.message);

    throw new PrismaError(err.message);
  }
};

/**
 * List Personal Leave Requests Function
 * - retrieves list of leave requests where the employeeId = initiator
 *   - leave requests will be ordered by modifiedAt ascending
 *   - relationships to substitute
 * - retrieves summary substitute
 * - retrieves count of personal leave requests
 * @param employeeId Employee's unique id (from token)
 * @param leaveRequestStatusFilter Status of Leave Request
 * @param pageNumber Page Number (zero-based) for Pagination
 * @param pageSize Page Size for Pagination
 * @returns [Paginated Personal Leave Requests, Included Employees, Personal Leave Requests Count]
 */
export const listPersonal = async (
  employeeId: string,
  leaveRequestStatusFilter?: LeaveRequestStatus[],
  pageNumber?: number,
  pageSize?: number
): Promise<
  [
    dbModels.listPersonalPrismaLeaveRequestGetPayload[],
    dbModels.includedEmployee[],
    number
  ]
> => {
  try {
    let skipRecords: number | undefined;
    // pageNumber can be zero but pageSize cannot(would result in inf total pages)
    if (pageNumber !== undefined && pageSize) {
      skipRecords = pageNumber * pageSize;
    }

    const [personalLeaveRequestsCount, personalLeaveRequestsPage] =
      await Promise.all([
        db.leaveRequest.count({
          where: dbModels.listPersonalPrismaLeaveRequestWhereInput(
            employeeId,
            leaveRequestStatusFilter
          ),
        }),
        db.leaveRequest.findMany({
          skip: skipRecords,
          take: pageSize,
          orderBy: {
            modifiedAt: "asc",
          },
          where: dbModels.listPersonalPrismaLeaveRequestWhereInput(
            employeeId,
            leaveRequestStatusFilter
          ),
          select: dbModels.listPersonalPrismaLeaveRequestSelect,
        }),
      ]);

    // Transform and filter outgoing data
    const uniqueEmployees = new Set();
    const transformedIncludedEmployees: dbModels.includedEmployee[] = [];
    personalLeaveRequestsPage.forEach((request) => {
      const { substitute } = request;

      if (!uniqueEmployees.has(substitute.id)) {
        transformedIncludedEmployees.push({
          id: substitute.id,
          name: transformations.decrypt(substitute.name),
          surname: transformations.decrypt(substitute.surname),
          role: transformations.decrypt(substitute.role),
        });
        uniqueEmployees.add(substitute.id);
      }
    });

    return [
      personalLeaveRequestsPage,
      transformedIncludedEmployees,
      personalLeaveRequestsCount,
    ];
  } catch (err: any) {
    if (err.code === "P2025") throw new NotFoundError(err.message);

    throw new PrismaError(err.message);
  }
};

/**
 * Create New Leave Requests Function
 * - checks if substitute exists AND has verifiedEmail = true AND currentEmployee = true
 * - checks if employee's Supervisor exists AND has verifiedEmail = true AND currentEmployee = true
 * - checks if employee's HR exists AND has verifiedEmail = true AND currentEmployee = true
 * - checks if employee's days_left are enough for the work days taken
 * @param leaveRequestDBInput The Leave-Request data to add
 * @returns Object containing newly created Leave-Request id and updated Initiator vacationDaysLeft
 */
export const createLeaveRequest = async (
  leaveRequestDBInput: dbModels.PrismaLeaveRequestCreateInput
): Promise<
  [
    dbModels.IDPrismaLeaveRequestGetPayload,
    employeesdbModels.updateDaysLeftPrismaEmployeeGetPayload | undefined
  ]
> => {
  try {
    // Check substitute, supervisor and HR not found case
    const [substitute, initiator] = await Promise.all([
      db.employee.findUnique({
        where: { email: leaveRequestDBInput.substitute.connect!.email },
      }),
      db.employee.findUnique({
        where: { id: leaveRequestDBInput.initiator.connect!.id },
        include: {
          supervisor: true,
          HR: true,
        },
      }),
    ]);

    if (
      !substitute ||
      !substitute.currentEmployee ||
      !substitute.emailVerified
    ) {
      throw new NotFoundError(
        `Substitute not found when creating leave-request.`,
        undefined,
        "Substitute not found"
      );
    }

    if (
      !initiator?.supervisor ||
      !initiator.supervisor.currentEmployee ||
      !initiator.supervisor.emailVerified
    ) {
      throw new NotFoundError(
        `Supervisor not found when creating leave-request.`,
        undefined,
        "Supervisor not found"
      );
    }

    if (
      !initiator?.HR ||
      !initiator.HR.currentEmployee ||
      !initiator.HR.emailVerified
    ) {
      throw new NotFoundError(
        `HR not found when creating leave-request.`,
        undefined,
        "HR not found"
      );
    }

    // Update employee's vacationDaysLeft accordingly
    const newVacationDaysLeft = vacationDaysLeftCalculator(
      leaveRequestDBInput.leaveType,
      initiator.vacationDaysLeft,
      leaveRequestDBInput.workDays
    );

    // Update employee's vacationDaysLeft and create leave request
    const [leaveRequest, updatedEmployee] = await db.$transaction(
      async (tx) => {
        const createLeaveRequest = tx.leaveRequest.create({
          data: leaveRequestDBInput,
          select: dbModels.IDPrismaLeaveRequestSelect,
        });

        const updateEmployee =
          newVacationDaysLeft === undefined
            ? undefined
            : tx.employee.update({
                where: {
                  id: initiator!.id,
                },
                data: {
                  vacationDaysLeft: newVacationDaysLeft,
                },
                select: employeesdbModels.updateDaysLeftPrismaEmployeeSelect,
              });

        const result = await Promise.all([createLeaveRequest, updateEmployee]);
        return result;
      }
    );

    return [leaveRequest, updatedEmployee];
  } catch (err: any) {
    if (err instanceof BaseError) throw err;

    throw new PrismaError(err.message);
  }
};

// helper functions

export const vacationDaysLeftCalculator = (
  leaveType: LeaveType,
  vacationDaysLeft: number,
  workDaysAbsent: number
): number | undefined => {
  let newVacationDaysLeft = 0;
  if (leaveType === LeaveType.VACATION || leaveType === LeaveType.OTHER) {
    newVacationDaysLeft = vacationDaysLeft - workDaysAbsent;
  } else {
    return undefined;
  }

  if (newVacationDaysLeft < 0)
    throw new BadRequestError(
      "Not enough vacation days left",
      "Not enough vacation days left for amount of work days absent",
      { pointer: "/data/attributes/workDays" }
    );

  return newVacationDaysLeft;
};
