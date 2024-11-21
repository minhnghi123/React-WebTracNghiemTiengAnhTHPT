import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import styles from "./login.module.css";
import { AuthApi } from "@/services/Auth";

export const Login = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Username:", username);
    console.log("Password:", password);

    getUser(username, password);
  };

  const getUser = async (email: string, pass: string) => {
    try {
      const rq = await AuthApi.login({ email: email, password: pass });
      console.log(rq);
      setMessage(rq?.data.message);
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
      <div className="formContent">
        <h2>Đăng Nhập</h2>
        <div>
          {/* Tabs Titles */}
          {/* Icon */}
          <div className={`${styles.fadeIn} ${styles.first}`}>
            <img
              src="src/assets/img/P2N 1.svg"
              className={styles.icon}
              alt="User Icon"
            />
          </div>

          {/* Login Form */}
          <form onSubmit={(event) => handleSubmit(event)}>
            <input
              type="text"
              id="login"
              className={`${styles.fadeIn} ${styles.second}`}
              name="username"
              placeholder="username"
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="text"
              id="password"
              className={`${styles.fadeIn} ${styles.third}`}
              name="password"
              placeholder="password"
              maxLength={30}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="submit"
              className={`${styles.fadeIn} ${styles.fourth}`}
              value="Log In"
            />
          </form>

          {/* Remind Password */}
          <div className={styles.formFooter}>
            <a className={styles.underlineHover} href="#">
              Forgot Password?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
