import React, { useState } from "react";
import { AuthApi } from "@/services/Auth";
import styles from "./login.module.css";
import { getDeviceId } from "@/utils/cn";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthProvider";

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
  const [saveDevice, setSaveDevice] = useState<boolean>(false); // State để lưu lựa chọn của người dùng
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string>("");
  const { handleLogin } = useAuthContext();
  const [deviceId, setDeviceId] = useState<string>("");

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
      navigate("/admin");
    } else if (role === "teacher") {
      navigate("/giaovien");
    } else {
      navigate("/");
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!otp.trim()) {
      setMessage("Vui lòng nhập mã OTP.");
      return;
    }
    const deviceId = getDeviceId();
    setDeviceId(deviceId);
    try {
      const response = await AuthApi.loginOTP(email, otp.trim(), deviceId);
      setMessage(response.data.message);
      console.log("response", response);
      if (response.data.code === 200) {
        handleLogin(response.data.user);
        setUserRole(response.data.user.role);
        if (saveDevice) {
          await saveTrustedDevice(); // Chỉ lưu thiết bị nếu người dùng chọn
        }
        redirectUser(response.data.user.role);
        onSuccess(response.data.user);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Xác thực OTP thất bại.";
      setMessage(errorMessage);
      onError(errorMessage);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginForm}>
        <h2 className={styles.title}>Xác thực OTP</h2>
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
              placeholder="Nhập mã OTP"
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>

          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="saveDevice"
              checked={saveDevice}
              onChange={(e) => setSaveDevice(e.target.checked)}
            />
            <label htmlFor="saveDevice" className="form-check-label">
              Lưu thiết bị này
            </label>
          </div>

          <button type="submit" className="btn btn-primary">
            Xác thực
          </button>
        </form>

        {message && (
          <div
            className={`alert alert-${
              message.includes("thành công") ? "success" : "danger"
            } mt-3`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};