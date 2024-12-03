import express from "express";
const router = express.Router();
import {
  signup,
  login,
  logout,
  forgotPost,
  sendOtpPost,
  resetPassword,
} from "../../controllers/client/auth.controller.js";
import { protectedRoute } from "../../middlewares/protectedRoute.middleware.js";
import { resetPasswordMiddleware } from "../../middlewares/resetPassword.middleware.js";
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPost);
router.post("/send-otp", sendOtpPost);
router.post(
  "/reset-password",
  protectedRoute,
  resetPasswordMiddleware,
  resetPassword
);
export default router;
