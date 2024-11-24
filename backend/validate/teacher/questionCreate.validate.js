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
    if (req.body.answers.length === 0) {
      return res.status(400).json({
        code: 400,
        message: "The answer must not be empty !",
      });
    }
    let checkAnswer = false;
    for (const element of req.body.answers) {
      if (element.isCorrect) checkAnswer = true;
    }
    if (!checkAnswer) {
      return res.status(400).json({
        code: 400,
        message: "At least one true answer must be provided",
      });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(400).json({
      code: 400,
      message: "Internal server error",
    });
  }
};
