import { Prisma, LeaveRequestStatus } from "@prisma/client";

export const listApprovalPrismaLeaveRequestWhereInput = (
  employeeId: string,
  leaveRequestStatusFilter?: LeaveRequestStatus[]
): Prisma.LeaveRequestWhereInput => {
  return {
    OR: [
      { substituteId: employeeId },
      { initiator: { idSupervisor: employeeId } },
      { initiator: { idHr: employeeId } },
    ],
    initiator: {
      currentEmployee: true,
    },
    status: {
      in: leaveRequestStatusFilter,
    },
  } satisfies Prisma.LeaveRequestWhereInput;
};

export const listApprovalPrismaLeaveRequestSelect = {
  id: true,
  startDate: true,
  endDate: true,
  workDays: true,
  leaveType: true,
  leaveTypeDetails: true,
  status: true,
  rejectReason: true,
  createdAt: true,
  modifiedAt: true,
  substitute: {
    select: {
      id: true,
      name: true,
      surname: true,
      role: true,
    },
  },
  initiator: {
    select: {
      id: true,
      name: true,
      surname: true,
      role: true,
      supervisor: {
        select: {
          id: true,
        },
      },
      HR: {
        select: {
          id: true,
        },
      },
    },
  },
} satisfies Prisma.LeaveRequestSelect;

export type listApprovalPrismaLeaveRequestGetPayload =
  Prisma.LeaveRequestGetPayload<{
    select: typeof listApprovalPrismaLeaveRequestSelect;
  }>;

export type includedEmployee = {
  id: string;
  name: string;
  surname: string;
  role?: string;
  email?: string;
};

export const listPersonalPrismaLeaveRequestWhereInput = (
  employeeId: string,
  leaveRequestStatusFilter?: LeaveRequestStatus[]
): Prisma.LeaveRequestWhereInput => {
  return {
    initiator: {
      id: employeeId,
    },
    status: {
      in: leaveRequestStatusFilter,
    },
  } satisfies Prisma.LeaveRequestWhereInput;
};

export const listPersonalPrismaLeaveRequestSelect = {
  id: true,
  startDate: true,
  endDate: true,
  workDays: true,
  leaveType: true,
  leaveTypeDetails: true,
  status: true,
  createdAt: true,
  modifiedAt: true,
  substitute: {
    select: {
      id: true,
      name: true,
      surname: true,
      role: true,
    },
  },
} satisfies Prisma.LeaveRequestSelect;

export type listPersonalPrismaLeaveRequestGetPayload =
  Prisma.LeaveRequestGetPayload<{
    select: typeof listPersonalPrismaLeaveRequestSelect;
  }>;

export type PrismaLeaveRequestCreateInput = Prisma.LeaveRequestCreateInput;

export const IDPrismaLeaveRequestSelect = {
  id: true,
} satisfies Prisma.LeaveRequestSelect;

export type IDPrismaLeaveRequestGetPayload = Prisma.LeaveRequestGetPayload<{
  select: typeof IDPrismaLeaveRequestSelect;
}>;

export type PrismaLeaveRequestUpdateInput = Prisma.LeaveRequestUpdateInput;

export type fullWithInitiatorPrismaLeaveRequestGetPayload =
  Prisma.LeaveRequestGetPayload<{
    include: {
      initiator: true;
    };
  }>;
