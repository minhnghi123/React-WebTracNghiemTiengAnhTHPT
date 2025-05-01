import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { AuthApi } from "@/services/Auth";
import { useAuthContext } from "@/contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import styles from "./login.module.css";

interface Message {
  text: string;
  type: "success" | "error";
}

export const Login = () => {
  const [message, setMessage] = useState<Message | null>(null);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState<number>(0);
  const { handleLogin } = useAuthContext();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Load số lần đăng nhập từ localStorage khi người dùng nhập username
  useEffect(() => {
    if (username) {
      try {
        const storedAttempts = JSON.parse(localStorage.getItem("loginAttempts") || "{}");
        if (typeof storedAttempts === "object" && storedAttempts !== null && !Array.isArray(storedAttempts)) {
          setLoginAttempts(storedAttempts[username] || 0);
        } else {
          setLoginAttempts(0);
        }
      } catch {
        setLoginAttempts(0);
      }
    } else {
      setLoginAttempts(0);
    }
  }, [username]);

  // Xử lý hiển thị message (tự động ẩn sau 3s nếu không vượt quá số lần)
  useEffect(() => {
    if (message) {
      if (message.type === "error" && loginAttempts >= 5) {
        setMessage({
          text: "Bạn đã vượt quá số lần đăng nhập cho phép. Vui lòng đến trang Quên mật khẩu để lấy lại tài khoản.",
          type: "error",
        });
      } else {
        const timer = setTimeout(() => setMessage(null), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [message, loginAttempts]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      setMessage({
        text: "Vui lòng nhập đầy đủ tài khoản và mật khẩu.",
        type: "error",
      });
      return;
    }

    getUser(username, password);
  };

  const getUser = async (email: string, pass: string) => {
    try {
      const rq = await AuthApi.login({ email, password: pass });
      setMessage({ text: rq?.data.message, type: "success" });

      // Reset số lần đăng nhập nếu thành công
      const stored = JSON.parse(localStorage.getItem("loginAttempts") || "{}");
      stored[email] = 0;
      localStorage.setItem("loginAttempts", JSON.stringify(stored));
      setLoginAttempts(0);

      if (rq?.status === 201) {
        handleLogin(rq?.data.user);
        if (rq?.data.user.role === "admin") {
          navigate("/admin");
        } else if (rq?.data.user.role === "teacher") {
          navigate("/giaovien");
        } else {
          navigate("/");
        }
      }
    } catch (error: any) {
      // Tăng số lần và lưu lại vào localStorage
      setLoginAttempts((prev) => {
        const newAttempts = prev + 1;
        let storedAttempts: Record<string, number> = {};
        try {
          const parsed = JSON.parse(localStorage.getItem("loginAttempts") || "{}");
          if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
            storedAttempts = parsed;
          }
        } catch {
          storedAttempts = {};
        }
        storedAttempts[email] = newAttempts;
        localStorage.setItem("loginAttempts", JSON.stringify(storedAttempts));
        return newAttempts;
      });

      // Hiển thị thông báo lỗi
      setMessage({
        text: "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu.",
        type: "error",
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginForm}>
        <h2 className={styles.title}>Đăng nhập</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Tài khoản</label>
            <input
              type="text"
              className="form-control"
              id="username"
              value={username}
              placeholder="Nhập email"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Mật khẩu</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                id="password"
                value={password}
                placeholder="Nhập mật khẩu"
                onChange={(e) => setPassword(e.target.value)}
              />
              <i
                className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} eyeIcon`}
                onClick={togglePasswordVisibility}
              ></i>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loginAttempts >= 5}
          >
            Đăng nhập
          </button>

          <div className="forget-password">
            <a href="/forgetPass">Quên mật khẩu?</a>
          </div>

          <div className="formFooter">
            <p>
              Chưa có tài khoản? <a href="/SignUp">Đăng ký ngay</a>
            </p>
          </div>
        </form>

        {message && (
          <div
            className={`alert alert-${message.type === "success" ? "success" : "danger"} mt-3`}
          >
            {message.text}
            {message.type === "error" && loginAttempts > 0 && loginAttempts < 5 && (
              <div className="mt-2">
                Bạn còn <strong>{5 - loginAttempts}</strong> lần thử đăng nhập.
              </div>
            )}
          </div>
        )}

        {loginAttempts >= 5 && (
          <div className="mt-3">
            <button
              onClick={() => navigate("/forgetPass")}
              className="btn btn-warning"
            >
              ➡️ Đi đến trang Quên mật khẩu
            </button>
          </div>
        )}
      </div>
    </div>
  );
};