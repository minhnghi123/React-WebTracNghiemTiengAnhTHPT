import fs from "fs";
import path from "path";
import { fileURLToPath } from "url"; 
import { ENV_VARS } from "../config/envVars.config.js";
import jwt from "jsonwebtoken";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logFilePath = path.join(__dirname, "../logs/userLog.log");

export const userLog = (req, action, details) => {
  try {
    const token = req.cookies["jwt-token"];
    if (!token) {
      const thoiGian = new Date().toISOString();
      const noiDungLog = `${thoiGian} | Action: ${action} | Detail: ${details}\n`;

      fs.appendFile(logFilePath, noiDungLog, (loi) => {
        if (loi) {
          console.error("Không thể ghi nhật ký người dùng:", loi);
        }
      });
      return;
    }
    const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);
    const userId = decoded.userId;
    const thoiGian = new Date().toISOString();
    const noiDungLog = `${thoiGian} | User: ${userId} | Action: ${action} | Detail: ${details}\n`;

    fs.appendFile(logFilePath, noiDungLog, (loi) => {
      if (loi) {
        console.error("Không thể ghi nhật ký người dùng:", loi);
      }
    });
  } catch (loi) {
    console.error("Lỗi khi ghi nhật ký người dùng:", loi);
  }
}; 
