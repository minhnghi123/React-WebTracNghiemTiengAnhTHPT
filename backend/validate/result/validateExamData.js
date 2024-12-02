export const validateExamData = (req, res, next) => {
  const { examId, userId, answers } = req.body;

  // Kiểm tra nếu examId, userId hoặc answers không tồn tại hoặc answers không phải là một mảng
  if (!examId || !userId || !answers || !Array.isArray(answers)) {
    return res.status(400).json({ message: "Invalid input data." });
  }

  // Nếu tất cả các điều kiện hợp lệ, tiếp tục xử lý yêu cầu
  next();
};
