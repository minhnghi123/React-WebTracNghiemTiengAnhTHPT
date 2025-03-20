import jwt from "jsonwebtoken";
import { ENV_VARS } from "../../config/envVars.config.js";
  
export const listeningExamMiddleware = (req, res, next) => {
      const { teacherId } = req.body;  
      const token = req.cookies["jwt-token"];
      const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);
      const userId = decoded.userId;
      
      if (teacherId === userId) {
        return next();  
      }
    
      return res.status(403).json({
        message: "Bạn không có quyền truy cập !",
      });
    };