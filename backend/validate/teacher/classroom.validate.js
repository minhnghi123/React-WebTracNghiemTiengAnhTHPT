import mongoose from "mongoose";

export const validateClassroom = (req, res, next) => {
  const { title, teacherId } = req.body;

  // Kiểm tra name (Tên lớp học)
  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid classroom name. It must be a non-empty string.",
    });
  }
  if (!teacherId || !mongoose.Types.ObjectId.isValid(teacherId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid teacher ID. It must be a valid ObjectId.",
    });
  }

  next();
};
