import nodemailer from "nodemailer";
import { resolve4 } from "dns/promises";

const [smtpIp] = await resolve4("smtp.gmail.com");

export const transporter = nodemailer.createTransport({
  host: smtpIp,
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    servername: "smtp.gmail.com",
  },
});
