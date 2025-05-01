import express from "express";
const router = express.Router();
import {
  signup,
  login,
  logout,
  forgotPost,
  sendOtpPost,
  resetPassword,
  getBlockedInfo,
  saveTrustedDevice,
  verifyLoginOtp,
} from "../../controllers/client/auth.controller.js";
import { protectedRoute } from "../../middlewares/protectedRoute.middleware.js";
import { resetPasswordMiddleware } from "../../middlewares/resetPassword.middleware.js";
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPost);
router.post("/verify-otp", verifyLoginOtp);
router.post("/send-otp", sendOtpPost);
router.post(
  "/reset-password",
  protectedRoute,
  resetPasswordMiddleware,
  resetPassword
);
router.get("/blocked-info/", getBlockedInfo);
router.post("/save-trusted-device", saveTrustedDevice);
export default router;
