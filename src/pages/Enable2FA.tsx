import React, { useState, useEffect } from "react";
import { AuthApi } from "@/services/Auth";

export const Enable2FA = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [otp, setOtp] = useState<string>(""); // Lưu mã OTP người dùng nhập
  const [message, setMessage] = useState<string>(""); // Thông báo kết quả
  const [isActivated, setIsActivated] = useState<boolean>(false); // Trạng thái kích hoạt 2FA

  // Kiểm tra trạng thái 2FA khi component được mount
  useEffect(() => {
    const fetch2FAStatus = async () => {
      try {
        const response = await AuthApi.get2FAStatus();
        setIsActivated(response.is2FAEnabled); // Cập nhật trạng thái 2FA
      } catch (error) {
        console.error("Error fetching 2FA status:", error);
      }
    };

    fetch2FAStatus();
  }, []);

  const handleEnable2FA = async () => {
    try {
      const response = await AuthApi.enable2FA();
      setQrCodeUrl(response.qrCodeUrl);
    } catch (error) {
      console.error("Error enabling 2FA:", error);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await AuthApi.verify2FA({ otp });
      setMessage(response.message); // Hiển thị thông báo thành công
      setIsActivated(true); // Đặt trạng thái đã kích hoạt
    } catch (error) {
      setMessage("Mã OTP không hợp lệ hoặc đã hết hạn.");
    }
  };

  return (
    <div>
      <h2>Kích hoạt 2FA</h2>
      {isActivated ? (
        <div>
          <h3>2FA đã được kích hoạt</h3>
          <p>
            Bạn đã bật xác thực hai yếu tố. Từ bây giờ, bạn sẽ cần nhập mã OTP
            khi đăng nhập.
          </p>
        </div>
      ) : (
        <>
          <button onClick={handleEnable2FA}>Kích hoạt</button>
          {qrCodeUrl && (
            <div>
              <p>Quét mã QR bằng Google Authenticator:</p>
              <img src={qrCodeUrl} alt="QR Code" />
              <p>Sau khi quét mã QR, nhập mã OTP từ Google Authenticator:</p>
              <input
                type="text"
                placeholder="Nhập mã OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button onClick={handleVerifyOtp}>Xác minh OTP</button>
            </div>
          )}
          {message && <p>{message}</p>}
        </>
      )}
    </div>
  );
};
