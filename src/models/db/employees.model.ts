import { Prisma } from "@prisma/client";

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
