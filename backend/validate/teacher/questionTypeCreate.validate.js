export const questionTypeCreate = (req, res, next) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({
        code: 400,
        message: "Name is required",
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
