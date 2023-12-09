/**
 * Update Leave Request Function
 * - checks if leave-request exists
 * - checks if token employee id corresponds to initiator / substitute / supervisor / hr
 *   - initiator can ONLY update startDate, endDate, workDays, leaveType, leaveTypeDetails
 *     - initiator can ONLY update if status === AWAITING_SUBSTITUTE
 *     - checks if employee's days_left are enough for the work days taken
 *   - substitute / supervisor / hr can ONLY update status, rejectReason
 * @param leaveRequestDBInput The Leave-Request data to update
 * @param leaveRequestId The id of the Leave-Request to update
 * @param employeeId The token employee id
 */
export const updateLeaveRequest = async (
  leaveRequestDBInput: dbModels.PrismaLeaveRequestUpdateInput,
  leaveRequestId: string,
  employeeId: string
): Promise<void> => {
  try {
    // Find leave-request
    const initialLeaveRequest = await getLeaveRequestById(leaveRequestId);

    // Check user permissions
    checkUserPermissions(employeeId, initialLeaveRequest);

    if (employeeId === initialLeaveRequest.initiator.id) {
      updateLeaveRequestByInitiator(
        leaveRequestDBInput,
        leaveRequestId,
        initialLeaveRequest
      );
    } else {
      updateLeaveRequestBySubstituteSupervisorHR(
        leaveRequestDBInput,
        leaveRequestId
      );
    }
  } catch (err: any) {
    if (err instanceof BaseError) throw err;

    throw new PrismaError(err.message);
  }
};

// Helper function to get leave request by ID
const getLeaveRequestById = async (
  leaveRequestId: string
): Promise<dbModels.PrismaLeaveRequestGetPayload> => {
  const leaveRequest = await db.leaveRequest.findUnique({
    where: { id: leaveRequestId },
    include: {
      initiator: true,
    },
  });

  if (!leaveRequest) {
    throw new NotFoundError(
      `Leave-request not found when updating leave-request.`,
      { pointer: "/leaveRequestId" }
    );
  }

  return leaveRequest;
};

// Helper function to check user permissions
const checkUserPermissions = (
  employeeId: string,
  leaveRequest: dbModels.PrismaLeaveRequestGetPayload
): void => {
  const allowedUserIds = [
    leaveRequest.initiator.id,
    leaveRequest.substitute.id,
    leaveRequest.supervisor.id,
    leaveRequest.HR.id,
  ];

  if (!allowedUserIds.includes(employeeId)) {
    throw new ForbiddenError(
      `You do not have permission to update this leave-request.`,
      { pointer: "/employeeId" }
    );
  }
};

// Helper function to update leave request by initiator
const updateLeaveRequestByInitiator = async (
  leaveRequestDBInput: dbModels.PrismaLeaveRequestUpdateInput,
  leaveRequestId: string,
  initialLeaveRequest: dbModels.PrismaLeaveRequestGetPayload
): Promise<void> => {
  if (initialLeaveRequest.status !== LeaveRequestStatus.AWAITING_SUBSTITUTE) {
    throw new ForbiddenError(
      `Initiator can only update leave-requests with status AWAITING_SUBSTITUTE.`,
      { pointer: "/status" }
    );
  }

  const allowedFields = [
    "startDate",
    "endDate",
    "workDays",
    "leaveType",
    "leaveTypeDetails",
  ];

  validateUpdatedFields(leaveRequestDBInput, allowedFields);

  const newVacationDaysLeft = vacationDaysLeftCalculator(
    leaveRequestDBInput.leaveType,
    initialLeaveRequest.initiator.vacationDaysLeft,
    leaveRequestDBInput.workDays
  );

  await db.$transaction(async (tx) => {
    await Promise.all([
      // Update the leave request
      tx.leaveRequest.update({
        where: { id: leaveRequestId },
        data: leaveRequestDBInput,
      }),
      // Update the employee's vacationDaysLeft
      updateEmployeeVacationDays(
        initialLeaveRequest.initiator.id,
        newVacationDaysLeft,
        tx
      ),
    ]);
  });
};

// Helper function to update leave request by substitute, supervisor, or HR
const updateLeaveRequestBySubstituteSupervisorHR = async (
  leaveRequestDBInput: dbModels.PrismaLeaveRequestUpdateInput,
  leaveRequestId: string
): Promise<void> => {
  const allowedFields = ["status", "rejectReason"];

  validateUpdatedFields(leaveRequestDBInput, allowedFields);

  await db.$transaction(async (tx) => {
    // Update the leave request
    await tx.leaveRequest.update({
      where: { id: leaveRequestId },
      data: leaveRequestDBInput,
    });
  });
};

// Helper function to validate updated fields
const validateUpdatedFields = (
  leaveRequestDBInput: dbModels.PrismaLeaveRequestUpdateInput,
  allowedFields: string[]
): void => {
  const invalidFields = Object.keys(leaveRequestDBInput).filter(
    (field) => !allowedFields.includes(field)
  );

  if (invalidFields.length > 0) {
    throw new ForbiddenError(`Invalid fields: ${invalidFields.join(", ")}`, {
      pointer: "/leaveRequestDBInput",
    });
  }
};

const vacationDaysLeftCalculator = (
  leaveType: LeaveType,
  vacationDaysLeft: number,
  workDaysAbsent: number,
  initialLeaveType: LeaveType,
  initialWorkDays: number
): number | undefined => {
  let newVacationDaysLeft = vacationDaysLeft;

  if (leaveType === initialLeaveType) {
    // If the leave type remains the same, use the initial leave type
    newVacationDaysLeft = vacationDaysLeft - workDaysAbsent;
  } else {
    // If the leave type changes, check if work days are provided
    if (typeof workDaysAbsent !== "number") {
      throw new BadRequestError(
        "Work days must be provided when changing leave type",
        "Work days must be provided when changing leave type",
        { pointer: "/data/attributes/workDays" }
      );
    }

    if (leaveType === LeaveType.VACATION || leaveType === LeaveType.OTHER) {
      // If the new leave type is VACATION or OTHER, subtract work days
      newVacationDaysLeft = vacationDaysLeft - workDaysAbsent;
    } else {
      // If the new leave type is not VACATION or OTHER, throw an error
      throw new BadRequestError(
        `Invalid leave type "${leaveType}" when changing leave type`,
        `Invalid leave type "${leaveType}" when changing leave type`,
        { pointer: "/data/attributes/leaveType" }
      );
    }
  }

  if (newVacationDaysLeft < 0) {
    throw new BadRequestError(
      "Not enough vacation days left",
      "Not enough vacation days left for the given work days absent",
      { pointer: "/data/attributes/workDays" }
    );
  }

  return newVacationDaysLeft;
};
