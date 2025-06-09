import { createTransport } from "nodemailer";
import { serverConfig } from "../config/serverConfig";

export const transporter = createTransport({
  host: serverConfig.NODEMAILER_HOST,
  port: serverConfig.NODEMAILER_PORT,
  auth: {
    user: serverConfig.NODEMAILER_USER,
    pass: serverConfig.NODEMAILER_PASSWORD,
  },
});
