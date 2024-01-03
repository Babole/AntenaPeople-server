import { Prisma } from "@prisma/client";

export const IDPrismaLeaveRequestSignatureFilesSelect = {
  id: true,
} satisfies Prisma.LeaveRequestSignatureFilesSelect;

export type IDPrismaLeaveRequestSignatureFilesGetPayload =
  Prisma.LeaveRequestSignatureFilesGetPayload<{
    select: typeof IDPrismaLeaveRequestSignatureFilesSelect;
  }>;
