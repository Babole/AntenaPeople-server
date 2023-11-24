import { PrismaClient } from "@prisma/client";
import envConfig from "./envConfig";

const globalForPrisma = globalThis as unknown as { db: PrismaClient };

export const db = globalForPrisma.db || new PrismaClient();

if (envConfig.NODE_ENV !== "production") globalForPrisma.db = db;
