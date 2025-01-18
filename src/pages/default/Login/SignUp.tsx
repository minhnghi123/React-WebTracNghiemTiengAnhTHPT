import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./SignUp.css";
import { AuthApi } from "@/services/Auth";

export const SignUp = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    // Handle form submission logic here
    try {
      const response = await AuthApi.createUser({
        email,
        password,
        username: name,
      });

      if (response.status === 201) {
        setMessage(response.data.message);
        navigate("/admin/Login/Login", {
          state: { message: "Đăng ký thành công" },
        });
      } else {
        setMessage(response.data.message);
      }
    } catch (error: any) {
      if (error.response) {
        // Server responded with a status other than 200 range
        setMessage(`Sign up failed: ${error.response.data.message}`);
      } else if (error.request) {
        // Request was made but no response was received
        setMessage("Network error: Please check your connection.");
      } else {
        // Something else happened while setting up the request
        setMessage(`Error: ${error.message}`);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="wrapper fadeInDown">
      {message && (
        <div className="alert alert-danger alert-fade">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span>{message}</span>
        </div>
      )}
      <div className="formContent">
      <h2>Đăng Ký Tài Khoản</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="name">Họ Tên</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Nhập họ tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Mật Khẩu</label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="confirm-password">Xác Nhận Mật Khẩu</label>
            <input
              type="password"
              id="confirm-password"
              name="confirm-password"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-submit">
            Đăng Ký
          </button>
        </form>
        <div className="formFooter">
          <p>
            Đã có tài khoản? <a href="/Login">Đăng nhập</a>
          </p>
        </div>
      </div>
    </div>
  );
};
