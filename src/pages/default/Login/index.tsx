import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import styles from "./login.module.css";
import { AuthApi } from "@/services/Auth";

export const Login = () => {
  const location = useLocation();
  const [message, setMessage] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  useEffect(() => {
    if (location.state && location.state.message) {
      setMessage(location.state.message);
    }
  }, [location.state]);

  // Hide the success message after 2 seconds
  if (message) {
    setTimeout(() => {
      setMessage(null);
    }, 2000);
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle form submission logic here
    console.log("Username:", username);
    console.log("Password:", password);

    getUser(username, password);
  };

  const getUser = async (email: string, pass: string) => {
    try {
      const rq = await AuthApi.login({ email: email, password: pass });
      console.log(rq);
      setMessage(rq?.message);
      if (rq?.success) {
        // alert("Đăng nhập thành công");
        // setMessage(rq?.data?.message);
      } else {
        // setMessage("Login failed");
      }
    } catch (error: any) {
      if (error.response) {
        // Server responded with a status other than 200 range
        setMessage(`Login failed: ${error.response.data.message}`);
      } else if (error.request) {
        // Request was made but no response was received
        setMessage("Network error: Please check your connection.");
      } else {
        // Something else happened while setting up the request
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
