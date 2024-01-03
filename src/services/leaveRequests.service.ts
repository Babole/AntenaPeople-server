import { db } from "../utils/db.server";
import path from "path";
import * as fs from "fs";
import {
  LeaveType,
  LeaveRequestStatus,
  PrismaClient,
  SignatureOwner,
} from "@prisma/client";

import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  PrismaError,
} from "../errors/CustomErrors";
import * as dbModels from "../models/db/leaveRequests.model";
import * as employeesdbModels from "../models/db/employees.model";
import * as signatureFilesdbModels from "../models/db/signatureFiles.model";
import * as transformations from "../utils/transformations";
import { BaseError } from "../errors/BaseError";
import envConfig from "../utils/envConfig";

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
    if (substitute.id === initiator?.id) {
      throw new BadRequestError(
        "Self referencing for substitute not allowed when creating leave-request.",
        "Employee creating leave-request cannot be set as substitute.",
        { pointer: "/data/relationships/substitute/data/lid" }
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
    const newVacationDaysLeft = createLeaveRequestVacationDaysLeftCalculator(
      initiator.vacationDaysLeft,
      leaveRequestDBInput.leaveType,
      leaveRequestDBInput.workDays
    );

    // Update employee's vacationDaysLeft and create leave request
    const [leaveRequest, updatedEmployee] = await db.$transaction(
      async (tx) => {
        return await Promise.all([
          // Update the leave request
          tx.leaveRequest.create({
            data: leaveRequestDBInput,
            select: dbModels.IDPrismaLeaveRequestSelect,
          }),
          // Update the employee's vacationDaysLeft
          updateEmployeeVacationDays(initiator!.id, newVacationDaysLeft, tx),
        ]);
      }
    );

    return [leaveRequest, updatedEmployee];
  } catch (err: any) {
    if (err instanceof BaseError) throw err;

    throw new PrismaError(err.message);
  }
};

/**
 * Update Leave Request Function
 * - checks if leave-request exists
 * - checks if token employee id corresponds to initiator / substitute / supervisor / hr
 *   - initiator can ONLY update startDate, endDate, workDays, leaveType, leaveTypeDetails
 *     - initiator can ONLY update if status === AWAITING_SUBSTITUTE
 *     - checks if employee's days_left are enough for the work days taken
 *   - substitute / supervisor / hr can ONLY update status, rejectReason
 * @param signatureFile The Signature-File to save
 * @param leaveRequestId The id of the Leave-Request to attatch the signature to
 * @param employeeId The token employee id
 * @returns Array of updated leave request and initiator employee OR void
 */
export const updateLeaveRequest = async (
  leaveRequestDBInput: dbModels.PrismaLeaveRequestUpdateInput,
  leaveRequestId: string,
  employeeId: string
): Promise<
  | [
      dbModels.IDPrismaLeaveRequestGetPayload,
      employeesdbModels.updateDaysLeftPrismaEmployeeGetPayload | undefined
    ]
  | void
> => {
  try {
    // Find leave-request
    const initialLeaveRequest = await db.leaveRequest.findUnique({
      where: { id: leaveRequestId },
      include: {
        initiator: true,
      },
    });

    // Check if leave-request exists or is valid
    if (
      !initialLeaveRequest ||
      initialLeaveRequest.status === LeaveRequestStatus.AWAITING_INITIATOR
    ) {
      throw new NotFoundError(
        `Leave-request not found when updating leave-request ${leaveRequestId}.`,
        { pointer: "/leaveRequestId" }
      );
    }

    // Find the role of the user making the update request (ie. initiator, substitute, supervisor or hr)
    checkLeaveRequestUpdatePermissions(employeeId, initialLeaveRequest);

    if (initialLeaveRequest.initiator.id === employeeId) {
      const [updatedLeaveRequest, updatedEmployee] =
        await updateLeaveRequestByInitiator(
          leaveRequestDBInput,
          leaveRequestId,
          initialLeaveRequest
        );
      if (updatedEmployee) {
        return [updatedLeaveRequest, updatedEmployee];
      }
      return;
    }

    await updateLeaveRequestBySubstituteSupervisorHR(
      leaveRequestDBInput,
      leaveRequestId,
      initialLeaveRequest,
      employeeId
    );
  } catch (err: any) {
    if (err instanceof BaseError) throw err;

    throw new PrismaError(err.message);
  }
};

export const uploadSignatureFile = async (
  signatureFile: Buffer,
  leaveRequestId: string,
  employeeId: string
): Promise<
  [
    signatureFilesdbModels.IDPrismaLeaveRequestSignatureFilesGetPayload,
    dbModels.uploadSignatureFilePrismaLeaveRequestGetPayload
  ]
> => {
  try {
    // Find leave-request
    const initialLeaveRequest = await db.leaveRequest.findUnique({
      where: { id: leaveRequestId },
      include: {
        initiator: true,
      },
    });

    // Check if leave-request exists
    if (!initialLeaveRequest) {
      throw new NotFoundError(
        `Leave-request not found when uploading signature-file: leave-request ID - ${leaveRequestId}.`,
        { pointer: "/leaveRequestId" }
      );
    }

    // Get the next leave-request status
    const [signatureFileOwner, nextLeaveRequestStatus] =
      getDBInputForSignatureFileUpload(employeeId, initialLeaveRequest);

    const [signatureFileDBOut, leaveRequestDBOut] = await db.$transaction(
      async (tx) => {
        // Create signature-file
        const createSignatureFile = tx.leaveRequestSignatureFiles.create({
          data: {
            owner: signatureFileOwner,
            leaveRequest: {
              connect: {
                id: leaveRequestId,
              },
            },
          },
          select:
            signatureFilesdbModels.IDPrismaLeaveRequestSignatureFilesSelect,
        });

        // Update leave-request with new status
        const updateLeaveRequest = tx.leaveRequest.update({
          where: { id: leaveRequestId },
          data: {
            status: nextLeaveRequestStatus,
          },
          select: dbModels.uploadSignatureFilePrismaLeaveRequestSelect,
        });

        const [createdSignatureFile, updatedLeaveRequest] = await Promise.all([
          createSignatureFile,
          updateLeaveRequest,
        ]);

        // Save file to local storage
        const outputFilePath = path.join(
          envConfig.SIGNATURE_DIRECTORY,
          `${createdSignatureFile.id}.png`
        );
        fs.writeFileSync(outputFilePath, signatureFile, "binary");

        return [createdSignatureFile, updatedLeaveRequest];
      }
    );

    return [signatureFileDBOut, leaveRequestDBOut];
  } catch (err: any) {
    if (err instanceof BaseError) throw err;

    throw new PrismaError(err.message);
  }
};

/*
--------------------------
 --- Helper Functions ---
--------------------------
*/

// Leave types that affect vacationDaysLeft logic
const vacationDaysDeductionApplies = (type?: LeaveType): boolean =>
  type === LeaveType.VACATION || type === LeaveType.OTHER;
const vacationDaysDeductionDoesNOTApply = (type?: LeaveType): boolean =>
  type === LeaveType.EVENT_FAM ||
  type === LeaveType.CHILD ||
  type === LeaveType.NO_PAY;

/**
 * Calculate updated vacation days left based on leave type and work days absent.
 * Used when creating a leave-request
 *
 * @param vacationDaysLeft - The current number of vacation days left for the employee.
 * @param leaveType - The type of leave being requested.
 * @param workDaysAbsent - The number of work days the employee will be absent.
 * @returns The updated number of vacation days left or undefined if no deduction applies.
 * @throws { BadRequestError } -Thrown if the deduction results in a negative value.
 */
const createLeaveRequestVacationDaysLeftCalculator = (
  vacationDaysLeft: number,
  leaveType: LeaveType,
  workDaysAbsent: number
): number | undefined => {
  let newVacationDaysLeft = vacationDaysLeft;

  if (vacationDaysDeductionApplies(leaveType)) {
    newVacationDaysLeft -= workDaysAbsent;
  } else {
    // If no deduction applies, return undefined.
    return undefined;
  }

  if (newVacationDaysLeft < 0)
    throw new BadRequestError(
      "Not enough vacation days left",
      "Not enough vacation days left for amount of work days absent"
    );

  return newVacationDaysLeft;
};

/**
 * Calculate updated vacation days left based on various scenarios of leave type and work days.
 * Used when updating a leave-request
 *
 * @param vacationDaysLeft - The current number of vacation days left for the employee.
 * @param initialLeaveType - The initial type of leave before the update.
 * @param initialWorkDays - The initial number of work days absent before the update.
 * @param leaveType - (Optional) The updated type of leave, if changed.
 * @param workDaysAbsent - (Optional) The updated number of work days absent, if changed.
 * @returns The updated number of vacation days left or undefined in no deduction or change applies.
 * @throws { BadRequestError } - Thrown if the deduction results in a negative value.
 */
const updateLeaveRequestVacationDaysLeftCalculator = (
  vacationDaysLeft: number,
  initialLeaveType: LeaveType,
  initialWorkDays: number,
  leaveType?: LeaveType,
  workDaysAbsent?: number
): number | undefined => {
  let newVacationDaysLeft = vacationDaysLeft;

  if (
    // Deduction applies to both
    (vacationDaysDeductionApplies(leaveType) || !leaveType) && // If leaveType is not provided (will remain same as initial ie. will apply)
    vacationDaysDeductionApplies(initialLeaveType) &&
    workDaysAbsent // If workDaysAbsent is not provided there is no need to recalculate
  ) {
    const difference = workDaysAbsent - initialWorkDays;
    newVacationDaysLeft -= difference;
  } else if (
    // Deduction applies to initialLeaveTtype AND NOT leaveType
    vacationDaysDeductionDoesNOTApply(leaveType) &&
    vacationDaysDeductionApplies(initialLeaveType)
  ) {
    newVacationDaysLeft += initialWorkDays;
  } else if (
    // Deduction applies to leaveType AND NOT initialLeaveType
    vacationDaysDeductionApplies(leaveType) &&
    vacationDaysDeductionDoesNOTApply(initialLeaveType)
  ) {
    if (workDaysAbsent) {
      newVacationDaysLeft -= workDaysAbsent;
    } else {
      newVacationDaysLeft -= initialWorkDays;
    }
  } else {
    // If no deduction or change applies, return undefined.
    return undefined;
  }

  if (newVacationDaysLeft < 0)
    throw new BadRequestError(
      "Not enough vacation days left",
      "Not enough vacation days left for amount of work days absent"
    );

  return newVacationDaysLeft;
};

/**
 * Check permissions for user to update leave-request based on the employee ID and leave request data.
 *
 * @param employeeId - The ID of the employee making the update request.
 * @param leaveRequest - The leave request data containing initiator, substitute, supervisor, and HR information.
 * @throws { ForbiddenError } - Thrown if the employeeId does not match any of the leave-request data.
 */
const checkLeaveRequestUpdatePermissions = (
  employeeId: string,
  leaveRequest: dbModels.fullWithInitiatorPrismaLeaveRequestGetPayload
): void => {
  // For status AWAITING_SUBSTITUTE all responsible roles can update
  if (leaveRequest.status === LeaveRequestStatus.AWAITING_SUBSTITUTE) {
    if (
      !(
        leaveRequest.initiator.id === employeeId ||
        leaveRequest.substituteId === employeeId ||
        leaveRequest.initiator.idSupervisor === employeeId ||
        leaveRequest.initiator.idHr === employeeId
      )
    ) {
      throw new ForbiddenError(
        `Missing permissions for ${employeeId} to update ${leaveRequest.id}`,
        "Missing permissions to update leave-request."
      );
    }
    return;
  }

  // For status AWAITING_SUPERVISOR only supervisor or hr can update
  if (leaveRequest.status === LeaveRequestStatus.AWAITING_SUPERVISOR) {
    if (
      !(
        leaveRequest.initiator.idSupervisor === employeeId ||
        leaveRequest.initiator.idHr === employeeId
      )
    ) {
      throw new ForbiddenError(
        "Leave-request with status AWAITING_SUPERVISOR can only be updated by supervisor or hr.",
        "Missing permissions to update leave-request."
      );
    }
    return;
  }

  // For status AWAITING_HR only hr can update
  if (leaveRequest.status === LeaveRequestStatus.AWAITING_HR) {
    if (leaveRequest.initiator.idHr !== employeeId) {
      throw new ForbiddenError(
        "Leave-request with status AWAITING_HR can only be updated by supervisor or hr.",
        "Missing permissions to update leave-request."
      );
    }
    return;
  }

  // If the request status is either APPROVED OR DENIED it cannot be updated
  throw new ForbiddenError(
    "Leave-request with status APPROVED OR DENIED cannot be updated anymore.",
    "Missing permissions to update leave-request."
  );
};

/**
 * Update a leave request by the initiator.
 *
 * @param leaveRequestDBInput - The Leave-Request data to update.
 * @param leaveRequestId - The ID of the Leave-Request to update.
 * @param initialLeaveRequest - The initial leave request data containing initiator information.
 * @returns A tuple containing the updated leave request and the updated employee (if applicable).
 * @throws { ForbiddenError } - Thrown if the leave-request status IS NOT AWAITING_SUBSTITUTE.
 */
const updateLeaveRequestByInitiator = async (
  leaveRequestDBInput: dbModels.PrismaLeaveRequestUpdateInput,
  leaveRequestId: string,
  initialLeaveRequest: dbModels.fullWithInitiatorPrismaLeaveRequestGetPayload
): Promise<
  [
    dbModels.IDPrismaLeaveRequestGetPayload,
    employeesdbModels.updateDaysLeftPrismaEmployeeGetPayload | undefined
  ]
> => {
  // Define the allowed fields that the initiator can update.
  const allowedFields = [
    "startDate",
    "endDate",
    "workDays",
    "leaveType",
    "leaveTypeDetails",
  ];

  // Validate the updated fields against the allowed fields.
  validateUpdatedFields(leaveRequestDBInput, allowedFields);

  let newVacationDaysLeft: number | undefined;
  // Calculate new vacation days left if leaveType or workDays are provided.
  if (leaveRequestDBInput.leaveType || leaveRequestDBInput.workDays) {
    newVacationDaysLeft = updateLeaveRequestVacationDaysLeftCalculator(
      initialLeaveRequest.initiator.vacationDaysLeft,
      initialLeaveRequest.leaveType,
      initialLeaveRequest.workDays,
      leaveRequestDBInput.leaveType as LeaveType,
      leaveRequestDBInput.workDays as number
    );
  }

  const [updatedLeaveRequest, updatedEmployee] = await db.$transaction(
    async (tx) => {
      return await Promise.all([
        // Update the leave request
        tx.leaveRequest.update({
          where: { id: leaveRequestId },
          data: leaveRequestDBInput,
          select: dbModels.IDPrismaLeaveRequestSelect,
        }),
        // Update the employee's vacationDaysLeft
        updateEmployeeVacationDays(
          initialLeaveRequest.initiator.id,
          newVacationDaysLeft,
          tx
        ),
      ]);
    }
  );

  return [updatedLeaveRequest, updatedEmployee];
};

/**
 * Update a leave request by the substitute, supervisor, or HR.
 *
 * @param leaveRequestDBInput - The Leave-Request data to update.
 * @param leaveRequestId - The ID of the Leave-Request to update.
 * @param initialLeaveRequest - The initial leave request data.
 * @param employeeId - The ID of employee making the update
 * @throws ForbiddenError if the user's role is not allowed to perform the update.
 * @throws {BadRequestError} - Thrown if the provided input is invalid.
 */
const updateLeaveRequestBySubstituteSupervisorHR = async (
  leaveRequestDBInput: dbModels.PrismaLeaveRequestUpdateInput,
  leaveRequestId: string,
  initialLeaveRequest: dbModels.fullWithInitiatorPrismaLeaveRequestGetPayload,
  employeeId: string
): Promise<void> => {
  // Define the allowed fields that can be updated by substitute, supervisor, or HR.
  const allowedFields = ["status", "rejectReason"];

  // Validate the updated fields against the allowed fields.
  validateUpdatedFields(leaveRequestDBInput, allowedFields);

  // Check the status values that can be set (the rest must be set together with signatures)
  if (leaveRequestDBInput.status === LeaveRequestStatus.APPROVED) {
    // Only HR can set status to APPROVED AND only if it's in status AWAITING_HR
    if (
      employeeId !== initialLeaveRequest.initiator.idHr &&
      initialLeaveRequest.status !== LeaveRequestStatus.AWAITING_HR
    ) {
      throw new ForbiddenError(
        "Leave-request can only be approved by HR when status AWAITING_HR.",
        "Missing permission to set status to APPROVED."
      );
    }
  } else if (
    leaveRequestDBInput.status &&
    leaveRequestDBInput.status !== LeaveRequestStatus.DENIED
  ) {
    // This endpoint can only be used to set status to APPROVED or DENIED everything else Requires a signature
    throw new BadRequestError(
      "Can only update status to DENIED on this endpoint.",
      "Status can only be set to APPROVED or DENIED",
      { pointer: "/data/attributes/status" }
    );
  }

  // Reject reason and status DENIED Must be provided together
  if (
    (leaveRequestDBInput.status === LeaveRequestStatus.DENIED &&
      !leaveRequestDBInput.rejectReason) ||
    (leaveRequestDBInput.status !== LeaveRequestStatus.DENIED &&
      leaveRequestDBInput.rejectReason)
  ) {
    throw new BadRequestError(
      "Status DENIED and rejectReason must be provided together",
      "Status DENIED and rejectReason must be provided together"
    );
  }

  await db.leaveRequest.update({
    where: { id: leaveRequestId },
    data: leaveRequestDBInput,
  });
};

/**
 * Validates the updated fields in a Leave-Request update input against a list of allowed fields.
 *
 * @param leaveRequestDBInput - The Leave-Request update input.
 * @param allowedFields - An array of allowed fields for updates.
 * @throws {ForbiddenError} - Thrown if there are invalid fields in the update input.
 */
const validateUpdatedFields = (
  leaveRequestDBInput: dbModels.PrismaLeaveRequestUpdateInput,
  allowedFields: string[]
): void => {
  // Filter out properties with undefined values from the update input.
  const updatedFields = Object.entries(leaveRequestDBInput)
    .filter(([, value]) => value !== undefined)
    .map(([field]) => field);

  const invalidFields = updatedFields.filter(
    (field) => !allowedFields.includes(field)
  );

  if (invalidFields.length > 0) {
    throw new ForbiddenError(
      `Missing permissions to update ${invalidFields.join(", ")}`,
      `Missing permissions to update ${invalidFields.join(", ")}`
    );
  }
};

/**
 * Updates an employee's vacation days left if the new value is defined.
 *
 * @param employeeId - The ID of the employee to update.
 * @param newVacationDaysLeft - The new vacation days left value.
 * @param transactionInstance - The Prisma transaction instance.
 * @returns The updated employee's information or undefined if no update is needed.
 */
const updateEmployeeVacationDays = async (
  employeeId: string,
  newVacationDaysLeft: number | undefined,
  transactionInstance: Omit<
    PrismaClient,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >
): Promise<
  | {
      id: string;
      vacationDaysLeft: number;
    }
  | undefined
> => {
  // If newVacationDaysLeft is undefined, no update is needed, return undefined.
  if (newVacationDaysLeft === undefined) return undefined;

  // Update the employee's vacation days left using the provided transaction instance.
  return transactionInstance.employee.update({
    where: {
      id: employeeId,
    },
    data: {
      vacationDaysLeft: newVacationDaysLeft,
    },
    select: employeesdbModels.updateDaysLeftPrismaEmployeeSelect,
  });
};

/**
 * Determines the next status for the leave request, the signature owner and checks permissions for uploading a signature file.
 *
 * @param employeeId -  The ID of the employee making the request.
 * @param leaveRequest - The leave request being updated.
 * @returns - The signature owner and the next status for the leave request after the signature upload.
 * @throws {ForbiddenError} - Thrown if the employee does not have permission to upload a signature file.
 */
const getDBInputForSignatureFileUpload = (
  employeeId: string,
  leaveRequest: dbModels.fullWithInitiatorPrismaLeaveRequestGetPayload
): [SignatureOwner, LeaveRequestStatus] => {
  // For status AWAITING_INITIATOR only initiator can upload a signature file - next status: AWAITING_SUBSTITUTE
  if (leaveRequest.status === LeaveRequestStatus.AWAITING_INITIATOR) {
    if (leaveRequest.initiator.id !== employeeId) {
      throw new ForbiddenError(
        `Missing permissions for ${employeeId} to upload signature for request ${leaveRequest.id}`,
        "Missing permissions to upload signature."
      );
    }
    return [SignatureOwner.INITIATOR, LeaveRequestStatus.AWAITING_SUBSTITUTE];
  }

  // For status AWAITING_SUBSTITUTE only substitute can upload a signature file - next status: AWAITING_SUPERVISOR
  if (leaveRequest.status === LeaveRequestStatus.AWAITING_SUBSTITUTE) {
    if (leaveRequest.substituteId !== employeeId) {
      throw new ForbiddenError(
        `Missing permissions for ${employeeId} to upload signature for request ${leaveRequest.id}`,
        "Missing permissions to upload signature."
      );
    }
    return [SignatureOwner.SUBSTITUTE, LeaveRequestStatus.AWAITING_SUPERVISOR];
  }

  // For status AWAITING_SUPERVISOR only supervisor can upload a signature file - next status: AWAITING_HR
  if (leaveRequest.status === LeaveRequestStatus.AWAITING_SUPERVISOR) {
    if (leaveRequest.initiator.idSupervisor !== employeeId) {
      throw new ForbiddenError(
        `Missing permissions for ${employeeId} to upload signature for request ${leaveRequest.id}`,
        "Missing permissions to upload signature."
      );
    }
    return [SignatureOwner.SUPERVISOR, LeaveRequestStatus.AWAITING_HR];
  }

  // If the request status is either APPROVED, DENIED OR AWAITING_HR no more signature files can be uploaded
  throw new ForbiddenError(
    "No more signature files can be uploaded to a eave-request with status APPROVED, DENIED OR AWAITING_HR.",
    "Missing permissions to upload signature."
  );
};
