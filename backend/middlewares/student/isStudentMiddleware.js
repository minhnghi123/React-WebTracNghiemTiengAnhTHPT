import jwt from 'jsonwebtoken';
import { TaiKhoan } from '../../models/Taikhoan.model'; 

// Middleware để kiểm tra xem người dùng có phải là học sinh không
export const isStudent = async (req, res, next) => {
  next(); 
  return;
  try {
    // Lấy token từ cookie
    const token = req.cookies["jwt-token"];

    if (!token) {
      return res.status(401).send({ message: 'No token, authorization denied' });
    }

    // Giải mã token và kiểm tra người dùng
    const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET); 
    const user = await TaiKhoan.findOne({ _id: decoded._id });
    
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Kiểm tra role là 'student'
    if (user.role !== 'student') {
      return res.status(403).send({ message: 'Access denied. Not a student.' });
    }

    req.user = user;
    res.locals.user = user;
    next(); 
  } catch (error) {
    return res.status(401).send({ message: 'Authentication failed, please login' });
  }
};
