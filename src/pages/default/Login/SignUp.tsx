import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./SignUp.module.css";

export const SignUp = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    // Handle form submission logic here
    try {
      const response = await fetch("/admin/SignUp/SignUp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Sign up successful");
      } else {
        setMessage(data.message || "Sign up failed");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="body">
      {message && (
        <div className="alert alert-danger alert-fade">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span>{message}</span>
        </div>
      )}
      <div className="container">
        <div className="formContainer">
          <h2>Đăng Ký Tài Khoản</h2>
          <form onSubmit={handleSubmit}>
            <div className="inputGroup">
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
            <div className="inputGroup">
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
            <div className="inputGroup">
              <label htmlFor="password">Mật Khẩu</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="inputGroup">
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
            <button type="submit" className="btnSubmit">
              Đăng Ký
            </button>
          </form>
          <p>
            Đã có tài khoản? <a href="/admin/Login/Login">Đăng nhập</a>
          </p>
        </div>
      </div>
    </div>
  );
};
