import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { AuthApi } from "@/services/Auth";
import { useAuthContext } from "@/contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import styles from "./login.module.css";
import { Result, Typography } from "antd";
import { LockOutlined } from "@ant-design/icons";

const { Paragraph, Text } = Typography;
// import ReCAPTCHA from "react-google-recaptcha";
import HCaptcha from "@hcaptcha/react-hcaptcha";
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
  const [isIpBlocked, setIsIpBlocked] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const navigate = useNavigate();
  // ---------------- ReCAPTCHA ------------------
  // const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  // const RECAPTCHA_SITE_KEY: string = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  // const handleCaptchaChange = (token: string | null) => {
  //   setCaptchaToken(token);
  // };
  //---------------- ReCAPTCHA ------------------
  // -----------------------HCAPTCHA-------------------------------
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const HCAPTCHA_SITE_KEY: string = import.meta.env.VITE_HCAPTCHA_SITE_KEY;
  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };
  // ----------------------- HCAPTCHA -----------------------------
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (message) {
      // Nếu đang lỗi và đã vượt quá 5 lần thì KHÔNG clear message
      if (message.type === "error" && loginAttempts >= 5) {
        setMessage({
          text: "Bạn đã vượt quá số lần đăng nhập cho phép. Vui lòng đến trang Quên mật khẩu để lấy lại tài khoản.",
          type: "error",
        });
      }

      // Ngược lại (bình thường) thì clear message sau 3s
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message, loginAttempts]);

  useEffect(() => {
    if (username) {
      const storedAttempts = JSON.parse(
        localStorage.getItem("loginAttempts") || "{}"
      );

      if (storedAttempts[username]) {
        setLoginAttempts(storedAttempts[username]);
      }
    }
  }, [username]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Bước 1: Kiểm tra đã nhập tài khoản/mật khẩu chưa
    if (!username.trim() || !password.trim()) {
      setMessage({
        text: "Vui lòng nhập đầy đủ tài khoản và mật khẩu.",
        type: "error",
      });
      return;
    }
    // Check capcha
    if (!captchaToken) {
      setMessage({
        text: "Vui lòng xác minh CAPTCHA trước khi đăng nhập.",
        type: "error",
      });
      return;
    }

    try {
      // Gửi token và thông tin đăng nhập đến server
      getUser(username, password, captchaToken);
    } catch (error) {
      setMessage({
        text: "Lỗi khi xác minh CAPTCHA. Vui lòng thử lại.",
        type: "error",
      });
    }
  };

  const getUser = async (email: string, pass: string, captchaToken: string) => {
    try {
      const rq = await AuthApi.login({ email, password: pass, captchaToken });
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
      setLoginAttempts((prev) => prev + 1);
      if (
        (error.response?.status === 400 &&
          error.response?.data?.message.includes(
            "Vui lòng thử lại sau 15 phút"
          )) ||
        error.response?.data.message.includes(
          "Bạn đã vượt quá số lần thử đăng nhập."
        )
      ) {
        setIsIpBlocked(true);
        setTimeLeft(error.response?.data?.ttl || 0);
      } else {
        setMessage({
          text: error.response?.data?.message || "Đăng nhập thất bại.",
          type: "error",
        });
      }
    }
  };

  // Cập nhật thời gian còn lại theo thời gian thực
  useEffect(() => {
    if (isIpBlocked && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => clearInterval(timer); // Xóa timer khi component bị unmount
    }
  }, [isIpBlocked, timeLeft]);
  if (isIpBlocked) {
    // Giao diện khi IP bị khóa
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Result
          icon={<LockOutlined style={{ fontSize: 48, color: "#ff4d4f" }} />}
          title={<Text type="danger">IP của bạn đã bị khóa</Text>}
          subTitle={
            <Paragraph>
              Bạn đã vượt quá số lần thử đăng nhập. <br />
              Vui lòng thử lại sau{" "}
              <Text strong>
                {Math.floor(timeLeft / 60)} phút {timeLeft % 60} giây
              </Text>
              .
            </Paragraph>
          }
        />
      </div>
    );
  }
  return (
    <div className={styles.container}>
      <div className={styles.loginForm}>
        <h2 className={styles.title}>Đăng nhập</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Tài khoản
            </label>
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
            <label htmlFor="password" className="form-label">
              Mật khẩu
            </label>
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
                className={`bi ${
                  showPassword ? "bi-eye-slash" : "bi-eye"
                } eyeIcon`}
                onClick={togglePasswordVisibility}
              ></i>
            </div>
          </div>
          {/* Add reCAPTCHA
          <div className="mb-3">
            <ReCAPTCHA
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={handleCaptchaChange}
              datatype="image"
            />
          </div> */}
          {/* Add hCaptcha */}
          <div className="mb-3">
            <HCaptcha
              sitekey={HCAPTCHA_SITE_KEY}
              onVerify={handleCaptchaChange}
            />
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
            className={`alert alert-${
              message.type === "success" ? "success" : "danger"
            } mt-3`}
          >
            {message.text}
            {message.type === "error" &&
              loginAttempts > 0 &&
              loginAttempts < 5 && (
                <div className="mt-2">
                  Bạn còn <strong>{5 - loginAttempts}</strong> lần thử đăng
                  nhập.
                </div>
              )}
          </div>
        )}

        {/* Nếu vượt quá số lần --> hiện riêng nút này */}
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
