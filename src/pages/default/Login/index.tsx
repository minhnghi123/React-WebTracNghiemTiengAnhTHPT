import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import styles from "./login.module.css";
import { AuthApi } from "@/services/Auth";
import { useAuthContext } from "@/contexts/AuthProvider";
import { useNavigate } from "react-router-dom";

interface Message {
  text: string;
  type: "success" | "error";
}

export const Login = () => {
  const [message, setMessage] = useState<Message | null>(null);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { handleLogin } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    getUser(username, password);
  };

  const getUser = async (email: string, pass: string) => {
    try {
      const rq = await AuthApi.login({ email: email, password: pass });
      setMessage({ text: rq?.data.message, type: "success" });
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
      if (error.response) {
        setMessage({
          text: `Login failed: ${error.response.data.message}`,
          type: "error",
        });
      } else if (error.request) {
        setMessage({
          text: "Network error: Please check your connection.",
          type: "error",
        });
      } else {
        setMessage({ text: `Error: ${error.message}`, type: "error" });
      }
    }
  };

  return (
    <div className="wrapper fadeInDown">
      {message && (
        <div
          className={`alert ${
            message.type === "success" ? "alert-success" : "alert-danger"
          } alert-fade`}
        >
          <i
            className={`bi ${
              message.type === "success"
                ? "bi-check-circle-fill"
                : "bi-exclamation-circle-fill"
            }`}
          ></i>
          <span>{message.text}</span>
        </div>
      )}
      <div className={`${styles.loginContainer}`}>
        <div className={`${styles.leftPanel}`}>
          <img
            src="src/assets/img/englishBanner.jpg"
            alt="Illustration"
            className={styles.illustration}
          />
        </div>
        <form onSubmit={(event) => handleSubmit(event)} className={styles.form}>
          <h2 className={styles.formTitle}>Đăng nhập</h2>

          {/* Username Input */}
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>
              Tài khoản
            </label>
            <input
              type="text"
              id="username"
              className={`${styles.input}`}
              name="username"
              placeholder="Nhập email của bạn"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Password Input */}
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Mật khẩu
            </label>
            <div className={styles.passwordWrapper}>
              <input
                type="password"
                id="password"
                className={`${styles.input}`}
                name="password"
                placeholder="Nhập mật khẩu của bạn"
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className={styles.togglePassword}></span>
            </div>
          </div>

          {/* Remind Password */}
          <div className={styles.formFooter}>
            <a className={styles.underlineHover} href="/forgetPassword">
              Quên mật khẩu?
            </a>
          </div>

          {/* Submit Button */}
          <button type="submit" className={`${styles.submitButton}`}>
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
};
