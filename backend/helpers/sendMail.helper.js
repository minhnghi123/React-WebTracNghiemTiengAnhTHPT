import nodemailer from "nodemailer";
import { ENV_VARS } from "../config/envVars.config.js";
export const sendMail = (email, subject, text) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // use SSL
    auth: {
      user: ENV_VARS.SYSTEM_EMAIL,
      pass: ENV_VARS.SYSTEM_PASS,
    },
  });

  const mailOptions = {
    from: ENV_VARS.SYSTEM_EMAIL,
    to: email,
    subject: subject,
    html: text,
  };

  // Send the email
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("Error:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

export const sendDeviceVerificationMail = (email, deviceId) => {
  const subject = "Xác thực thiết bị mới";
  const text = `Thiết bị với mã định danh <b>${deviceId}</b> đang cố gắng đăng nhập vào tài khoản của bạn. Nếu đây là bạn, vui lòng xác thực thiết bị này.`;

  sendMail(email, subject, text);
};
