import nodemailer from "nodemailer";
import envConfig from "./envConfig";

export const transporter = nodemailer.createTransport({
  host: envConfig.EMAIL_SERVICE,
  port: 587,
  secure: false,
  auth: {
    user: envConfig.EMAIL_USER,
    pass: envConfig.EMAIL_PASS,
  },
});
