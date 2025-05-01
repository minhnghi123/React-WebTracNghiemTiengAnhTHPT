import React, { useState } from "react";
import { AuthApi } from "@/services/Auth";
export const Verify2FA = () => {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const handleVerify2FA = async () => {
    try {
      const response = await AuthApi.verify2FA({ otp });
      setMessage(response.data.message);
    } catch (error) {
      setMessage("Mã OTP không hợp lệ");
    }
  };

  return (
    <div>
      <h2>Xác thực 2FA</h2>
      <input
        type="text"
        placeholder="Nhập mã OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      <button onClick={handleVerify2FA}>Xác thực</button>
      {message && <p>{message}</p>}
    </div>
  );
};
