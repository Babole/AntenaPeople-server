import { Prisma } from "@prisma/client";

export type PrismaEmployeeUpdateInput = Prisma.EmployeeUpdateInput;

export const RegisteredEmployeeSelectPayload = {
  id: true,
  email: true,
};

export type PrismaEmployeeGetPayloadRegistered = Prisma.EmployeeGetPayload<{
  select: typeof RegisteredEmployeeSelectPayload;
}>;

export const idEmployeeSelectPayload = {
  id: true,
};

export type PrismaEmployeeGetPayloadId = Prisma.EmployeeGetPayload<{
  select: typeof idEmployeeSelectPayload;
}>;
