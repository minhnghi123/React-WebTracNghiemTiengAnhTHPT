export const validateExamData = (req, res, next) => {
  const { resultId, answers, listeningAnswers } = req.body;

  // Kiểm tra nếu resultId, answers hoặc listeningAnswers không tồn tại hoặc answers và listeningAnswers không phải là một mảng
  if (!resultId || !Array.isArray(answers) || !Array.isArray(listeningAnswers)) {
    return res.status(400).json({ message: "Invalid input data." });
  }

  // Nếu tất cả các điều kiện hợp lệ, tiếp tục xử lý yêu cầu
  next();
};