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
  enable2FA,
  verify2FA,
  get2FAStatus,
  check2FAStatus,
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
router.get("/blocked-info/", getBlockedInfo);
router.get("/get-2fa-status", protectedRoute, get2FAStatus);
router.post("/save-trusted-device", saveTrustedDevice);
router.post("/enable-2fa", protectedRoute, enable2FA);
router.post("/verify-2fa", protectedRoute, verify2FA);
router.post("/check-2fa-status", check2FAStatus);
export default router;
