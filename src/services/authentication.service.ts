import { db } from "../utils/db.server";
import { BaseError } from "../errors/BaseError";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import * as dbModels from "../models/db/employees.model";
import { transporter } from "../utils/emailTransporter";
import {
  PrismaError,
  EntryAlreadyExistsError,
  NotFoundError,
  MailerError,
  UnverifiedEmailError,
  InvalidCredentialsError,
} from "../errors/CustomErrors";
import envConfig from "../utils/envConfig";
import log from "../utils/logger";
import { Token, TokenTypeEnum } from "../models/AuthToken";
import * as transformations from "../utils/transformations";

// DB Interactions

/**
 * Register Emplpoyee Function - only if email not verified and is a current employee
 * @param employeeLoginCredentialsDBInput The Employee's Login Credentials to add
 * @param employeeCNP Employee's CNP(encrypted)
 */
export const registerEmployee = async (
  employeeDBInput: dbModels.registerPrismaEmployeeUpdateInput,
  employeeCNP: string
): Promise<dbModels.registerPrismaEmployeeGetPayload> => {
  try {
    // Transform incoming data
    const transformedEmployeeDBInput = {
      email: employeeDBInput.email.toLowerCase(),
      password: await transformations.hashWithBcrypt(employeeDBInput.password),
    };

    const transformedEmployeeCNP = transformations.hashWithSHA256(employeeCNP);

    // Check if employee exists
    const existingEmployee = await db.employee.findUnique({
      where: { cnp: transformedEmployeeCNP },
    });

    // Handle case where employee is not found or is no longer an employee
    if (!existingEmployee || !existingEmployee.currentEmployee) {
      throw new NotFoundError(`Employee with CNP ${employeeCNP} not found.`, {
        pointer: "/data/attributes/cnp",
      });
    }

    // Handle case where email IS verified
    if (existingEmployee.emailVerified) {
      throw new EntryAlreadyExistsError(
        `Employee with CNP ${employeeCNP} has already verified email account.`
      );
    }

    const updatedEmployee = await db.employee.update({
      where: {
        cnp: transformedEmployeeCNP,
        currentEmployee: true,
        emailVerified: false,
      },
      data: transformedEmployeeDBInput,
      select: dbModels.registerPrismaEmployeeSelect,
    });

    return updatedEmployee;
  } catch (err: any) {
    if (err instanceof BaseError) throw err;

    throw new PrismaError(err.message);
  }
};

/**
 * Confirm Emplpoyee Email Function - only if email not verified and is a current employee
 * @param employeeId Employee's unique id from Charisma
 */
export const emailConfirmation = async (
  employeeId: string
): Promise<dbModels.IDPrismaEmployeeGetPayload> => {
  try {
    // Check if employee exists
    const existingEmployee = await db.employee.findUnique({
      where: { id: employeeId },
    });

    // Handle case where employee is not found or is no longer an employee
    if (!existingEmployee || !existingEmployee.currentEmployee) {
      throw new NotFoundError(`Employee with ID ${employeeId} not found.`);
    }

    // Handle case where email IS verified
    if (existingEmployee.emailVerified) {
      throw new EntryAlreadyExistsError(
        `Employee with ID ${employeeId} has already verified their email.`
      );
    }

    const updatedEmployee = await db.employee.update({
      where: {
        id: employeeId,
        currentEmployee: true,
        emailVerified: false,
      },
      data: { emailVerified: true },
      select: dbModels.IDPrismaEmployeeSelect,
    });

    return updatedEmployee;
  } catch (err: any) {
    if (err instanceof BaseError) throw err;

    throw new PrismaError(err.message);
  }
};

/**
 * Login Employee Function - only if email verified and is a current employee
 * @param loginEmail Email provided on login
 * @param loginPassword Password provided on login
 */
export const loginEmployee = async (
  loginEmail: string,
  loginPassword: string
): Promise<dbModels.IDPrismaEmployeeGetPayload> => {
  try {
    // Transform incoming data
    const transformedLoginEmail = loginEmail.toLowerCase();

    // Find employee
    const loggedinEmployee = await db.employee.findUnique({
      where: {
        email: transformedLoginEmail,
      },
      select: {
        ...dbModels.IDPrismaEmployeeSelect,
        currentEmployee: true,
        emailVerified: true,
        password: true,
      },
    });

    // Handle case where employee is not found Or is no longer an employee Or has no password set (last case unlikley)
    if (
      !loggedinEmployee ||
      !loggedinEmployee.currentEmployee ||
      !loggedinEmployee.password
    ) {
      throw new InvalidCredentialsError(`Invalid credentials on login.`);
    }

    // Verify password (password must be non null since )
    const authed = await bcrypt.compare(
      loginPassword,
      loggedinEmployee.password
    );
    if (!authed) {
      throw new InvalidCredentialsError(`Invalid credentials on login.`);
    }

    // Handle case where email IS NOT verified
    if (!loggedinEmployee.emailVerified) {
      throw new UnverifiedEmailError(
        `Employee with ID ${loggedinEmployee.id} attempted a login without a verified email.`
      );
    }

    return { id: loggedinEmployee.id };
  } catch (err: any) {
    if (err instanceof BaseError) throw err;

    throw new PrismaError(err.message);
  }
};

/**
 * Forgot Password Function
 * @param requestorEmail Email provided on forgot password request
 */
export const forgotPassword = async (
  requestorEmail: string
): Promise<dbModels.forgotPasswordPrismaEmployeeGetPayload | null> => {
  try {
    // Transform incoming data
    const transformedRequestorEmail = requestorEmail.toLowerCase();

    // Find employee
    const existingEmployee = await db.employee.findUnique({
      where: {
        email: transformedRequestorEmail,
      },
      select: dbModels.forgotPasswordPrismaEmployeeSelect,
    });

    // no need to throw errors just check for requirments and send email if they are satisfied

    return existingEmployee;
  } catch (err: any) {
    if (err instanceof BaseError) throw err;

    throw new PrismaError(err.message);
  }
};

/**
 * Reset Password Function - only if is current employee
 * @param newPasswordDBInput New Employee password
 * @param employeeId Employee's unique id from Charisma
 */
export const resetPassword = async (
  newPasswordDBInput: dbModels.resetPasswordPrismaEmployeeUpdateInput,
  employeeId: string
): Promise<void> => {
  try {
    // Check if employee exists
    const existingEmployee = await db.employee.findUnique({
      where: { id: employeeId },
    });

    // Handle case where employee is not found or is no longer an employee
    if (!existingEmployee || !existingEmployee.currentEmployee) {
      throw new NotFoundError(`Employee with ID ${employeeId} not found.`);
    }

    // Transform incoming data
    const transformedNewPasswordDBInput = {
      password: await transformations.hashWithBcrypt(
        newPasswordDBInput.password
      ),
    };

    // Update employee with new password
    await db.employee.update({
      where: {
        id: employeeId,
        currentEmployee: true,
      },
      data: transformedNewPasswordDBInput,
    });
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
    const payload: Token = {
      employeeId: employeeId,
      type: TokenTypeEnum.EMAIL_VALIDATION,
    };
    const token = jwt.sign(payload, envConfig.JWT_SECRET, {
      expiresIn: 900,
    });

    // const token_link = `${envConfig.SERVER_URL}/employees/email-status/${token}`; -- update with frontend page
    const token_link = token;

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

/**
 * Email Forgot Password Function
 * @param requestorEmail Email provided on forgot password request
 * @param employeeId ID of registered employee
 */
export async function forgotPasswordMailer(
  requestorEmail: string,
  employeeId: string
): Promise<void> {
  try {
    console.log("hello");
    // Create token-link for email confirmation
    const payload: Token = {
      employeeId: employeeId,
      type: TokenTypeEnum.PASSWORD_RESET,
    };
    const token = jwt.sign(payload, envConfig.JWT_SECRET, {
      expiresIn: 900,
    });

    // const token_link = `${envConfig.SERVER_URL}/employees/email-status/${token}`; -- update with frontend page
    const token_link = token;

    // Read the HTML file
    const htmlFilePath = path.join(
      __dirname,
      "../emailTemplates/forgot-pass.html"
    );
    let htmlContent = fs.readFileSync(htmlFilePath, "utf-8");
    htmlContent = htmlContent.replace(
      /INSERT_SITE_URL_HERE/g,
      envConfig.CLIENT_URL
    );
    htmlContent = htmlContent.replace(
      /INSERT_LOGO_URL_HERE/g,
      envConfig.LOGO_URL
    );
    htmlContent = htmlContent.replace(/INSERT_TOKEN_URL_HERE/g, token_link);

    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: envConfig.EMAIL_USER,
      to: requestorEmail,
      subject: "Recuperare parolă - AntenaPeople",
      html: htmlContent,
    });

    log.info("Message sent: %s", info.messageId);
  } catch (err: any) {
    console.log(err);
    throw new MailerError(err.message);
  }
}
