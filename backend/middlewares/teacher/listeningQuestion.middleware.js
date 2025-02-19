export const listeningQuestionMiddleware = (req, res, next) => {
    const { teacherId } = req.body;  
    const userId = req.userId;      
  
    
    if (teacherId === userId) {
      return next();  
    }
  
    return res.status(403).json({
      message: "Bạn không có quyền truy cập vào lớp học này!",
    });
  };
  