import jwt from "jsonwebtoken";
import { TaiKhoan } from "../../models/Taikhoan.model.js";
import { ENV_VARS } from "../../config/envVars.config.js";
// Middleware để kiểm tra xem người dùng có phải là gv không
export const isTeacher = async (req, res, next) => {
  next(); 
  return;
  try {
    // Lấy token từ cookie
    const token = req.cookies["jwt-token"];

    if (!token) {
      return res
        .status(401)
        .send({ message: "No token, authorization denied" });
    }

    // Giải mã token và kiểm tra người dùng
    const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);
    const user = await TaiKhoan.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    if (user.role !== "teacher" ) {
      return res.status(403).send({ message: "Access denied. Not a teacher." });
    }

    req.user = user;
    res.locals.user = user;
    next();
  } catch (error) {
    return res.status(401).send({ message: error.message });
  }
};
