import { Prisma, SignatureOwner } from "@prisma/client";
import { DateTime } from "luxon";

export type registerPrismaEmployeeUpdateInput = {
  email: string;
  password: string;
};

export const registerPrismaEmployeeSelect = {
  id: true,
  email: true,
} satisfies Prisma.EmployeeSelect;

export type registerPrismaEmployeeGetPayload = Prisma.EmployeeGetPayload<{
  select: typeof registerPrismaEmployeeSelect;
}>;

export const IDPrismaEmployeeSelect = {
  id: true,
} satisfies Prisma.EmployeeSelect;

export type IDPrismaEmployeeGetPayload = Prisma.EmployeeGetPayload<{
  select: typeof IDPrismaEmployeeSelect;
}>;

export const forgotPasswordPrismaEmployeeSelect = {
  id: true,
  currentEmployee: true,
  emailVerified: true,
} satisfies Prisma.EmployeeSelect;

export type forgotPasswordPrismaEmployeeGetPayload = Prisma.EmployeeGetPayload<{
  select: typeof forgotPasswordPrismaEmployeeSelect;
}>;

export type resetPasswordPrismaEmployeeUpdateInput = {
  password: string;
};

export const personalSummaryPrismaEmployeeSelect = {
  vacationDaysTotal: true,
  vacationDaysLeft: true,
  name: true,
  surname: true,
  supervisor: {
    select: {
      id: true,
      name: true,
      surname: true,
      email: true,
    },
  },
} satisfies Prisma.EmployeeSelect;

export type personalSummaryPrismaEmployeeGetPayload =
  Prisma.EmployeeGetPayload<{
    select: typeof personalSummaryPrismaEmployeeSelect;
  }>;

export const listSubordinatesPrismaEmployeeSelect = {
  id: true,
  name: true,
  surname: true,
  role: true,
  currentEmployee: true,
  leaveRequestsInitiated: {
    select: {
      id: true,
      startDate: true,
      endDate: true,
      leaveType: true,
      status: true,
    },
    where: {
      endDate: {
        gte: DateTime.now().minus({ months: 1 }).toJSDate(),
      },
      signatureFiles: {
        some: {
          owner: SignatureOwner.INITIATOR,
        },
      },
    },
  },
} satisfies Prisma.EmployeeSelect;

export type listSubordinatesPrismaEmployeeGetPayload =
  Prisma.EmployeeGetPayload<{
    select: typeof listSubordinatesPrismaEmployeeSelect;
  }>;

export const updateDaysLeftPrismaEmployeeSelect = {
  id: true,
  vacationDaysLeft: true,
} satisfies Prisma.EmployeeSelect;

export type updateDaysLeftPrismaEmployeeGetPayload = Prisma.EmployeeGetPayload<{
  select: typeof updateDaysLeftPrismaEmployeeSelect;
}>;
