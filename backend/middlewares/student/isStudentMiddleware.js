import jwt from 'jsonwebtoken';
import { TaiKhoan } from '../../models/Taikhoan.model.js';
import { ENV_VARS } from '../../config/envVars.config.js';

export const isStudent = async (req, res, next) => {
  try {
    const token = req.cookies["jwt-token"];

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);
    const user = await TaiKhoan.findOne({ _id: decoded.userId });  // ✅ Sửa lại cho đúng

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Access denied. Students only.' });
    }

    req.user = user;
    res.locals.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Authentication failed, please login' });
  }
};
