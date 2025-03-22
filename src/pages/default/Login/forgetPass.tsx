import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import styles from "./ForgetPass.module.css";
import { AuthApi } from "@/services/Auth";

export const ForgetPass = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // Step 1: Enter email, Step 2: Enter OTP, Step 3: Reset Password
  const [message, setMessage] = useState("");

  const handleSendOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await AuthApi.forgetPassword(email); // Assuming sendOtp is implemented in AuthApi
      if (response.code == 201) {
        setMessage(response.message);
        setStep(2);
      } else {
        setMessage(response.message);
      }
    } catch (error) {
      setMessage("Có lỗi xảy ra. Vui lòng thử lại sau");
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await AuthApi.verifyOtp(email, otp); // Assuming verifyOtp is implemented in AuthApi
      if (response.code == 201) {
        setMessage(response.message);
        setStep(3);
      } else {
        setMessage(response.message);
      }
    } catch (error) {
      setMessage("Có lỗi xảy ra. Vui lòng thử lại sau");
    }
  };

  const handleResetPassword = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("Mật khẩu không đúng. Vui lòng thử lại");
      return;
    }
    try {
      const response = await AuthApi.resetPassword(
        newPassword,
        confirmPassword
      ); // Assuming resetPassword is implemented in AuthApi
      if (response.code == 201) {
        setMessage("Thay đổi mật khẩu thành công");
        setStep(1); // Redirect to login step or login page as needed
      } else {
        setMessage(response.message);
      }
    } catch (error) {
      setMessage("Có lỗi xảy ra. Vui lòng thử lại sau");
    }
  };

  return (
    <div className={styles.wrapper}>
      {message && (
        <div className={styles.alert}>
          <i className="bi bi-check-circle-fill"></i>
          <span>{message}</span>
        </div>
      )}
      <div className={styles.formContent}>
        <h2>Quên Mật Khẩu</h2>
        <div>
          <div className={`${styles.fadeIn} ${styles.first}`}>
            <img
              src="src/assets/img/P2N 1.svg"
              className={styles.icon}
              alt="User Icon"
            />
          </div>

          {step === 1 && (
            <form onSubmit={handleSendOtp}>
              <input
                type="email"
                id="email"
                className={`${styles.fadeIn} ${styles.second}`}
                name="email"
                placeholder="Nhập địa chỉ email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="submit"
                className={`${styles.fadeIn} ${styles.fourth}`}
                value="Gửi OTP"
              />
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp}>
              <input
                type="text"
                id="otp"
                className={`${styles.fadeIn} ${styles.second}`}
                name="otp"
                placeholder="Nhập OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <input
                type="submit"
                className={`${styles.fadeIn} ${styles.fourth}`}
                value="Xác thực OTP"
              />
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword}>
              <input
                type="password"
                id="newPassword"
                className={`${styles.fadeIn} ${styles.second}`}
                name="newPassword"
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                type="password"
                id="confirmPassword"
                className={`${styles.fadeIn} ${styles.third}`}
                name="confirmPassword"
                placeholder="Xác nhận lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <input
                type="submit"
                className={`${styles.fadeIn} ${styles.fourth}`}
                value="Đổi mật khẩu"
              />
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
