import { TaiKhoan } from "../../models/Taikhoan.model.js";
import { VerificationRequest } from "../../models/VerificationRequest.model.js";
import bcryptjs from "bcryptjs";
import { generateTokenAndSetToken } from "../../utils/generateToken.util.js";
import { ForgotPassword } from "../../models/Forgot-Password.model.js";
import { generateRandomString } from "../../helpers/generateNumber.helper.js";
import { sendMail } from "../../helpers/sendMail.helper.js";
import jwt from "jsonwebtoken";
import { ENV_VARS } from "../../config/envVars.config.js";
import axios from "axios";
import { redisService } from "../../config/redis.config.js";
import { userLog } from "../../utils/logUser.js";
//----RECAPTCHA---
// export async function verifyRecaptcha(token) {
//   const secretKey = ENV_VARS.RECAPTCHA_SECRET_KEY;
//   const response = await axios.post(
//     `https://www.google.com/recaptcha/api/siteverify`,
//     null,
//     {
//       params: {
//         secret: secretKey,
//         response: token,
//       },
//     }
//   );

//   return response.data.success;
// }
// ----RECAPTCHA---

// ------HCAPTCHA--------
export async function verifyHCaptcha(token) {
  const secretKey = ENV_VARS.HCAPTCHA_SECRET_KEY;

  const form = new URLSearchParams();
  form.append("secret", secretKey);
  form.append("response", token);

  const response = await axios.post(
    "https://hcaptcha.com/siteverify",
    form.toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  // console.log(response.data);
  return response.data.success;
}
// ------HCAPTCHA--------

export async function signup(req, res) {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
      return res.status(400).json({
        code: 400,
        message: "Tất cả các trường thông tin đều bắt buộc",
      });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ code: 400, message: "Mật khẩu phải có ít nhất 6 ký tự" });
    }
    const existingUserByEmail = await TaiKhoan.findOne({
      email: email,
    });
    const existingUserByUsername = await TaiKhoan.findOne({
      username: username,
    });
    if (existingUserByEmail) {
      return res
        .status(400)
        .json({ code: 400, message: "Email đã tồn tại trong hệ thống" });
    }
    if (existingUserByUsername) {
      return res.status(400).json({
        code: 400,
        message: "Tên người dùng đã tồn tại trong hệ thống",
      });
    }
    const salt = bcryptjs.genSaltSync(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    if (role === "teacher") {
      // Create a verification request for the teacher
      const verificationRequest = new VerificationRequest({
        username,
        email,
        password: hashedPassword,
        role,
      });
      await verificationRequest.save();

      // Send email to admin for approval
      const adminEmail = ENV_VARS.ADMIN_EMAIL;
      const subject = "New Teacher Signup Request";
      const text = `A new teacher has signed up. Please review and approve the request.\n\nUsername: ${username}\nEmail: ${email}`;
      sendMail(adminEmail, subject, text);

      userLog(req, "Signup", `Teacher signup request for username: ${username}`);
      return res.status(201).json({
        code: 201,
        message:
          "Yêu cầu đăng ký giáo viên đã được gửi. Vui lòng chờ quản trị viên phê duyệt.",
      });
    } else if (role === "student") {
      // Proceed with normal signup for students
      const newUser = new TaiKhoan({
        username,
        email,
        password: hashedPassword,
        role,
      });
      await newUser.save();
      generateTokenAndSetToken(newUser._id, res); //jwt
      userLog(req, "Signup", `Student account created for username: ${username}`);
      return res
        .status(201)
        .json({ code: 201, message: "Tạo tài khoản người dùng thành công" });
    } else {
      return res
        .status(400)
        .json({ code: 400, message: "Vai trò không hợp lệ" });
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({ code: 400, message: "Lỗi máy chủ" });
  }
}
export async function login(req, res) {
  const { email, password, captchaToken , deviceId} = req.body;
  // lay ip cua nguoi dung
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  // console.log(ip); -> dia chi ip v6
  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ code: 400, message: "Email, mật khẩu và deviceId là bắt buộc" });
    }
    // Kiểm tra số lần thử đăng nhập từ IP
    const attempts = (await redisService.get(ip)) || 0;
    if (attempts >= 5) {
      const ttl = await redisService.ttl(ip);
      return res.status(400).json({
        code: 400,
        message: "Bạn đã vượt quá số lần thử đăng nhập.",
        ttl,
      });
    }
    // xac minh captcha
    const recaptchaResponse = await verifyHCaptcha(captchaToken);
    // console.log(recaptchaResponse);
    if (!recaptchaResponse) {
      await redisService.incr(ip); // Tăng số lần thử cho IP
      await redisService.expire(ip, 900); // Đặt thời gian hết hạn là 15 phút
      return res.status(400).json({
        code: 400,
        message: "Captcha không hợp lệ. Vui lòng thử lại.",
      });
    }

    const user = await TaiKhoan.findOne({ email: email });
    if (!user) {
      await redisService.incr(ip); // Tăng số lần thử cho IP
      await redisService.expire(ip, 900); // Đặt thời gian hết hạn là 15 phút
      return res
        .status(400)
        .json({ code: 400, message: "Không tìm thấy người dùng" });
    }
    const isPasswordMatch = await bcryptjs.compare(password, user.password);
    if (!isPasswordMatch) {
      await redisService.incr(ip); // Tăng số lần thử cho IP
      await redisService.expire(ip, 900); // Đặt thời gian hết hạn là 15 phút
      return res
        .status(400)
        .json({ code: 400, message: "Mật khẩu không hợp lệ" });
    } 
    // Kiểm tra thiết bị đã tin cậy?
      const isTrusted = Array.isArray(user.trustedDevices) &&
      user.trustedDevices.some(d => d.deviceId === deviceId);

      if (!isTrusted) {
      // Gửi mail cảnh báo
      const subject = "Cảnh báo đăng nhập thiết bị lạ";
      const text = `Chúng tôi phát hiện bạn đang đăng nhập từ thiết bị mới. Nếu không phải bạn, vui lòng liên hệ hỗ trợ.`;
      await sendMail(user.email, subject, text);

      userLog(req, "Login", "Untrusted device detected");
      // return res.status(200).json({
      //   code: 200,
      //   message: "Phát hiện thiết bị mới. Chúng tôi đã gửi cảnh báo vào email của bạn."
      // });
      }

    // Đăng nhập thành công
    await redisService.del(ip); // Xóa số lần thử nếu đăng nhập thành công
    generateTokenAndSetToken(user._id, res); //jwt
    userLog(req, "Login", "User logged in successfully");
    res.status(201).json({
      code: 201,
      message: "Đăng nhập thành công",
      user: user,
    });
  } catch (error) {
    res.status(400).json({
      code: 400,
      message: error.message || "Lỗi máy chủ",
    });
  }
}
export async function saveTrustedDevice(req, res) {
  try {
    const { deviceId } = req.body;
    const token = req.cookies["jwt-token"];
    if (!token) {
      return res.status(401).json({ code: 401, message: "Bạn chưa đăng nhập" });
    }

    const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);
    const user = await TaiKhoan.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy người dùng" });
    }

    // Thêm thiết bị tin cậy
    user.trustedDevices.push({
      deviceId, // Chỉ lưu chuỗi deviceId
      addedAt: new Date(),
    });
    await user.save();

    userLog(req, "Save Trusted Device", `Device ID: ${deviceId} saved`);
    res.status(200).json({ code: 200, message: "Thiết bị đã được lưu thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: "Lỗi máy chủ" });
  }
}

export async function logout(req, res) {
  try {
    res.clearCookie("jwt-token");
    userLog(req, "Logout", "User logged out");
    res.status(201).json({ code: 201, message: "Đăng xuất thành công" });
  } catch (error) {
    res.status(400).json({ code: 400, message: "Lỗi máy chủ" });
  }
}
export async function forgotPost(req, res) {
  try {
    const existedUser = await TaiKhoan.findOne({
      email: req.body.email,
      deleted: false,
      status: "active",
    });
    if (!existedUser) {
      return res
        .status(400)
        .json({ code: 400, message: "Không tìm thấy người dùng" });
    }
    const existedEmailInForgotPassword = await ForgotPassword.findOne({
      email: req.body.email,
    });
    if (!existedEmailInForgotPassword) {
      const dataInfo = {
        email: req.body.email,
        otp: generateRandomString(6),
        expireAt: Date.now() + 3 * 60 * 1000, //3 mins expire
      };
      const newForgot = new ForgotPassword(dataInfo);
      await newForgot.save();
      const subject = "Xác thực mã OTP";
      const text = `Mã xác thực của bạn là <b>${dataInfo.otp}</b>. Mã OTP có hiệu lực trong vòng 3 phút, vui lòng không cung cấp mã OTP cho bất kỳ ai.`;
      sendMail(dataInfo.email, subject, text);
    }
    userLog(req, "Forgot Password", `OTP sent to email: ${req.body.email}`);
    res.status(201).json({
      code: 201,
      email: req.body.email,
      message: "Mã OTP đã được gửi thành công. Chỉ gửi 1 lần trong 3 phút.",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Lỗi máy chủ" });
  }
}
export async function sendOtpPost(req, res) {
  try {
    const existedUserInForgotPassword = await ForgotPassword.findOne({
      email: req.body.email,
      otp: req.body.otp,
    });
    if (!existedUserInForgotPassword) {
      return res.status(400).json({
        code: 400,
        message: "Mã OTP không hợp lệ hoặc đã hết hạn! Vui lòng thử lại!",
      });
    }
    const user = await TaiKhoan.findOne({
      email: req.body.email,
      deleted: false,
      status: "active",
    });
    generateTokenAndSetToken(user._id, res); //jwt
    userLog(req, "Verify OTP", `OTP verified for email: ${req.body.email}`);
    res.status(201).json({
      code: 201,
      message: "Mã OTP hợp lệ! Vui lòng đặt lại mật khẩu!",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Lỗi máy chủ" });
  }
}
export async function resetPassword(req, res) {
  try {
    const salt = bcryptjs.genSaltSync(10);
    const hashedPassword = await bcryptjs.hash(req.body.newPassword, salt);

    const token = req.cookies["jwt-token"];

    if (!token) {
      return res
        .status(401)
        .send({ message: "Không có token, quyền truy cập bị từ chối" });
    }

    // Giải mã token và kiểm tra người dùng
    const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);
    const user = await TaiKhoan.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).send({ message: "Không tìm thấy người dùng" });
    }
    console.log(user);
    await TaiKhoan.updateOne(
      {
        _id: user._id,
      },
      {
        password: hashedPassword,
      }
    );
    userLog(req, "Reset Password", "Password reset successfully");
    res.status(201).json({ code: 201, message: "Đặt lại mật khẩu thành công" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Lỗi máy chủ" });
  }
}
export async function getUserInfo(req, res) {
  try {
    const token = req.cookies["jwt-token"];
    if (!token) {
      return res.status(401).json({ code: 401, message: "Bạn chưa đăng nhập" });
    }

    const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);
    const user = await TaiKhoan.findById(decoded.userId).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ code: 404, message: "Không tìm thấy người dùng" });
    }

    userLog(req, "Get User Info", "User info retrieved");
    res.status(200).json({ code: 200, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: "Lỗi máy chủ" });
  }
}

export async function getBlockedInfo(req, res) {
  try {
    const token = req.cookies["jwt-token"];
    if (!token) {
      return res
        .status(401)
        .json({ code: 401, message: "Bạn chưa đăng nhập" });
    }

    const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);
    const userId = decoded.userId;

    const user = await TaiKhoan.findById(userId).select("blockedUntil");

    if (!user) {
      return res.status(404).json({ code: 404, message: "Không tìm thấy người dùng" });
    }

    userLog(req, "Get Blocked Info", "Blocked info retrieved");
    res.status(200).json({
      code: 200,
      blockedUntil: user.blockedUntil,
      isBlocked: user.blockedUntil && new Date(user.blockedUntil) > new Date(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: "Lỗi máy chủ" });
  }
}
