export const resetPasswordMiddleware = async (req, res, next) => {
  try {
    const { newPassword, rePassword } = req.body;
    if (!newPassword || !rePassword) {
      return res.status(400).json({
        code: 400,
        message: "New password and re-enter password are required",
      });
    }
    if (newPassword !== rePassword) {
      return res.status(400).json({
        code: 400,
        message: "New password and re-enter password must be the same",
      });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        code: 400,
        message: "Password must be at least 6 characters",
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
