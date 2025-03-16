import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import styles from "./login.module.css";
import { AuthApi } from "@/services/Auth";
import { useAuthContext } from "@/contexts/AuthProvider";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { handleLogin } = useAuthContext();
  const navigate = useNavigate();
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    getUser(username, password);
  };

  const getUser = async (email: string, pass: string) => {
    try {
      const rq = await AuthApi.login({ email: email, password: pass });
      console.log(rq);
      setMessage(rq?.data.message);
      if (rq?.status === 201) {
        handleLogin(rq?.data.user);
        if(rq?.data.user.role === "admin") {
          navigate("/admin");
        } else if(rq?.data.user.role === "teacher") {
          navigate("/giaovien");
        } else {
          navigate("/");
        }
      }
    } catch (error: any) {
      if (error.response) {
        setMessage(`Login failed: ${error.response.data.message}`);
      } else if (error.request) {
        setMessage("Network error: Please check your connection.");
      } else {
        setMessage(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div className="wrapper fadeInDown">
      {message && (
        <div className="alert alert-success alert-fade">
          <i className="bi bi-check-circle-fill"></i>
          <span>{message}</span>
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
            <label htmlFor="username" className={styles.label}>Tài khoản</label>
            <input
              type="text"
              id="username"
              className={`${styles.input}`}
              name="username"
              placeholder="Nhập tài khoản hoặc email"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          {/* Password Input */}
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Mật khẩu</label>
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
