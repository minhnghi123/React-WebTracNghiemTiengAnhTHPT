export const validateExamData = (req) => {
    const { examId, userId, answers } = req.body;
  
    if (!examId || !userId || !answers || !Array.isArray(answers)) {
      return { isValid: false, message: "Invalid input data." };
    }
  
    return { isValid: true };
  };