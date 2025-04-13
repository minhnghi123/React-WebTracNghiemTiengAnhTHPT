export const questionCreate = (req, res, next) => {
  try {
    if (!req.body.content) {
      return res.status(400).json({
        code: 400,
        message: "The content must not be empty !",
      });
    }
    if (!req.body.level) {
      return res.status(400).json({
        code: 400,
        message: "The level must be provided !",
      });
    }

    if (req.body.questionType === "6742fb5dd56a2e75dbd817ee") {
      // Validation for True/False/Not Given
      if (!req.body.correctAnswerForTrueFalseNGV || 
          !["true", "false", "notgiven"].includes(req.body.correctAnswerForTrueFalseNGV)) {
        console.error("Invalid correctAnswerForTrueFalseNGV:", req.body.correctAnswerForTrueFalseNGV);
        return res.status(400).json({
          code: 400,
          message: "A valid answer for True/False/Not Given must be provided!",
        });
      }
    } else {
      // Validation for other question types
      if (!Array.isArray(req.body.answers) || req.body.answers.length === 0) {
        console.error("Invalid or empty answers array:", req.body.answers);
        return res.status(400).json({
          code: 400,
          message: "The answer must not be empty and must be an array!",
        });
      }
      let checkAnswer = false;
      for (const element of req.body.answers) {
        if (element.isCorrect) checkAnswer = true;
      }
      if (!checkAnswer) {
        console.error("No correct answer found in answers array:", req.body.answers);
        return res.status(400).json({
          code: 400,
          message: "At least one true answer must be provided",
        });
      }
    }

    next();
  } catch (error) {
    console.error("Error in questionCreate validation:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};
