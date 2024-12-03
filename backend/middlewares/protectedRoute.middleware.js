import jwt from "jsonwebtoken";
import { ENV_VARS } from "../config/envVars.config.js";
import { TaiKhoan } from "../models/Taikhoan.model.js";

export const protectedRoute = async (req, res, next) => {
  try {
    const token = req.cookies["jwt-token"];
    if (!token) {
      return res.status(400).json({
        code: 400,
        message: "Not found any token",
      });
    }
    const decoded = await jwt.verify(token, ENV_VARS.JWT_SECRET);
    if (!decoded) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "Unauthorized-Invalid token !",
      });
    }
    const user = await TaiKhoan.findOne({
      _id: decoded.userId,
    });
    if (!user) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "Unauthorized-User not found",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(400).json({
      code: 400,
      message: "Internal server error",
    });
  }
};
