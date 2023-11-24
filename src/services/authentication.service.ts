import { db } from "../utils/db.server";
import { BaseError } from "../errors/BaseError";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";

import * as dbModels from "../models/db/employees.model";
import { transporter } from "../utils/emailTransporter";
import {
  PrismaError,
  EntryAlreadyExistsError,
  NotFoundError,
  MailerError,
} from "../errors/CustomErrors";
import envConfig from "../utils/envConfig";
import log from "../utils/logger";

// DB Interactions

/**
 * Register Emplpoyee Function only if email not verified and is a current employee
 * @param employeeDBInput The Employee Data to Update
 * @param employeeCNP Employee's CNP(encrypted)
 */
export const registerEmployee = async (
  employeeDBInput: dbModels.PrismaEmployeeUpdateInput,
  employeeCNP: string
): Promise<dbModels.PrismaEmployeeGetPayloadRegistered> => {
  try {
    // Check if employee exists
    const existingEmployee = await db.employee.findUnique({
      where: { cnp: employeeCNP },
    });

    // Handle case where employee is not found or is no longer an employee
    if (!existingEmployee || !existingEmployee.currentEmployee) {
      throw new NotFoundError(`Employee with CNP ${employeeCNP} not found.`, {
        pointer: "/data/attributes/cnp",
      });
    }

    // Handle case where email is already verified
    if (existingEmployee.emailVerified) {
      throw new EntryAlreadyExistsError(
        `Employee with CNP ${employeeCNP} has already verified email account.`
      );
    }

    const updatedEmployee = await db.employee.update({
      where: {
        cnp: employeeCNP,
        currentEmployee: true,
        emailVerified: false,
      },
      data: employeeDBInput,
      select: dbModels.RegisteredEmployeeSelectPayload,
    });

    return updatedEmployee;
  } catch (err: any) {
    if (err instanceof BaseError) throw err;

    throw new PrismaError(err.message);
  }
};

// Emailing

/**
 * Email Registered Emplpoyee Function
 * @param employeeEmail Email of registered employee
 * @param employeeId ID of registered employee
 */
export async function registeredEmployeeMailer(
  employeeEmail: string,
  employeeId: string
): Promise<void> {
  try {
    // Create token-link for email confirmation
    const payload = { id: employeeId };
    const token = jwt.sign(payload, envConfig.JWT_SECRET, {
      expiresIn: 900,
    });
    const token_link = `${envConfig.SERVER_URL}/employees/email-status/${token}`;

    // Read the HTML file
    const htmlFilePath = path.join(
      __dirname,
      "../emailTemplates/register.html"
    );
    let htmlContent = fs.readFileSync(htmlFilePath, "utf-8");
    htmlContent = htmlContent.replace(
      /INSERT_SITE_URL_HERE/g,
      envConfig.CLIENT_URL || ""
    );
    htmlContent = htmlContent.replace(
      /INSERT_LOGO_URL_HERE/g,
      envConfig.LOGO_URL || ""
    );
    htmlContent = htmlContent.replace(/INSERT_TOKEN_URL_HERE/g, token_link);

    // Send email with defined transport object
    const info = await transporter.sendMail({
      from: envConfig.EMAIL_USER || "",
      to: employeeEmail,
      subject: "Înregistrare - AntenaPeople",
      html: htmlContent,
    });

    log.info("Message sent: %s", info.messageId);
  } catch (err: any) {
    console.log(err);
    throw new MailerError(err.message);
  }
}
