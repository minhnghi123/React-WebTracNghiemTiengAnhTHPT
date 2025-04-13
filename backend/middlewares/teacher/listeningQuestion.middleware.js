import jwt from "jsonwebtoken";
import { ENV_VARS } from "../../config/envVars.config.js";
  
export const listeningQuestionMiddleware = (req, res, next) => {
  const user = req.user; // Thông tin người dùng từ verifyToken

  console.log("User role:", user); // In ra vai trò của người dùng để kiểm tra
  if (user && (user.role === "teacher" || user.role === "admin")) {
    // Cho phép cả giáo viên và admin
    return next();
  }
  return res.status(403).json({
    code: 403,
    success: false,
    message: "Access denied. Teachers or Admins only.",
  });
};
