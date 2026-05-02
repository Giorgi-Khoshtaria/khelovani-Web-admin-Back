import nodemailer from "nodemailer";
const options = {
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
};

export const transporter = nodemailer.createTransport(options);
