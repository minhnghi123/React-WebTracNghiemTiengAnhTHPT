import React, { useState, useEffect } from "react";
import { AuthApi } from "@/services/Auth";
import styles from "./login.module.css";
import { getDeviceId } from "@/utils/cn";
import { useAuthContext } from "@/contexts/AuthProvider";
import { SafetyOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { message } from "antd";

interface OTPVerificationProps {
  email: string;
  onSuccess: (user: any) => void;
  onError: (errorMessage: string) => void;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  onSuccess,
  onError,
}) => {
  const [otp, setOtp] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [saveDevice, setSaveDevice] = useState<boolean>(false);
  const [, setUserRole] = useState<string>("");
  const { handleLogin } = useAuthContext();
  const [, setDeviceId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // ✅ Thêm states cho resend OTP
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [resendCountdown, setResendCountdown] = useState<number>(0);
  const [canResend, setCanResend] = useState<boolean>(true);

  // ✅ Countdown timer effect
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resendCountdown === 0) {
      setCanResend(true);
    }
  }, [resendCountdown]);

  const saveTrustedDevice = async () => {
    try {
      const deviceId = getDeviceId();
      await AuthApi.saveTrustedDevice(deviceId);
      setMessage("Thiết bị đã được lưu thành công.");
    } catch (error) {
      setMessage("Lỗi khi lưu thiết bị. Vui lòng thử lại.");
    }
  };

  const redirectUser = (role: string) => {
    if (role === "admin") {
      window.location.href = "/admin";
    } else if (role === "teacher") {
      window.location.href = "/giaovien";
    } else {
      window.location.href = "/";
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!otp.trim()) {
      setMessage("Vui lòng nhập mã OTP.");
      return;
    }

    setLoading(true);
    const deviceId = getDeviceId();
    setDeviceId(deviceId);

    try {
      const response = await AuthApi.loginOTP(email, otp.trim(), deviceId);
      setMessage(response.data.message);

      if (response.data.code === 200) {
        handleLogin(response.data.user);
        setUserRole(response.data.user.role);
        if (saveDevice) {
          await saveTrustedDevice();
        }
        redirectUser(response.data.user.role);
        onSuccess(response.data.user);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Xác thực OTP thất bại.";
      setMessage(errorMessage);
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle resend OTP
  const handleResendOTP = async () => {
    if (!canResend || resendLoading) return;

    setResendLoading(true);
    setCanResend(false);

    try {
      // TODO: Replace with actual API call
      const response = await AuthApi.resendOTP(email);

      if (response.code === 200) {
        message.success("Mã OTP mới đã được gửi đến email của bạn!");
        setResendCountdown(60); // Start 60 seconds countdown
        setOtp(""); // Clear current OTP input
      } else {
        message.error(
          response.message || "Không thể gửi lại mã OTP. Vui lòng thử lại sau."
        );
        setCanResend(true);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi gửi lại mã OTP.";
      message.error(errorMessage);
      setCanResend(true);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginForm}>
        <div className={styles.otpIconWrapper}>
          <SafetyOutlined className={styles.otpIcon} />
        </div>

        <h2 className={styles.title}>Xác thực OTP</h2>

        <p className={styles.otpDescription}>
          Mã OTP đã được gửi đến email: <strong>{email}</strong>
        </p>

        <form onSubmit={handleVerifyOtp}>
          <div className="mb-3">
            <label htmlFor="otp" className="form-label">
              Mã OTP
            </label>
            <input
              type="text"
              className="form-control"
              id="otp"
              value={otp}
              placeholder="Nhập mã 6 chữ số"
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              autoFocus
            />
          </div>

          <div className={styles.checkboxWrapper}>
            <input
              type="checkbox"
              className={styles.customCheckbox}
              id="saveDevice"
              checked={saveDevice}
              onChange={(e) => setSaveDevice(e.target.checked)}
            />
            <label htmlFor="saveDevice" className={styles.checkboxLabel}>
              <CheckCircleOutlined className={styles.checkIcon} />
              <span>Lưu thiết bị này để đăng nhập nhanh hơn</span>
            </label>
          </div>

          {/* ✅ Wrap button trong div để căn giữa */}
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !otp.trim()}
              style={{ display: "block", width: "100%" }}
            >
              {loading ? "Đang xác thực..." : "Xác thực"}
            </button>
          </div>

          <div
            className="formFooter"
            style={{ textAlign: "center", width: "100%" }}
          >
            <p style={{ marginBottom: "1rem", color: "#6b7280" }}>
              Không nhận được mã?{" "}
            </p>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={!canResend || resendLoading}
              className={styles.resendButton}
              style={{
                width: "100%",
                padding: "0.75rem 1.5rem",
                background: canResend && !resendLoading ? "#f3f4f6" : "#e5e7eb",
                color: canResend && !resendLoading ? "#3b82f6" : "#9ca3af",
                border: "2px solid",
                borderColor:
                  canResend && !resendLoading ? "#3b82f6" : "#d1d5db",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "0.9375rem",
                cursor: canResend && !resendLoading ? "pointer" : "not-allowed",
                transition: "all 0.3s ease",
                opacity: canResend && !resendLoading ? 1 : 0.6,
              }}
            >
              {resendLoading
                ? "Đang gửi..."
                : resendCountdown > 0
                ? `Gửi lại sau ${resendCountdown}s`
                : "Gửi lại mã OTP"}
            </button>
          </div>
        </form>

        {message && (
          <div
            className={`alert ${
              message.includes("thành công") || message.includes("Xác thực")
                ? "alert-success"
                : "alert-danger"
            } mt-3`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};
