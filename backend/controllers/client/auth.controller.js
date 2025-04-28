import { TaiKhoan } from "../../models/Taikhoan.model.js";
import { VerificationRequest } from "../../models/VerificationRequest.model.js";
import bcryptjs from "bcryptjs";
import { generateTokenAndSetToken } from "../../utils/generateToken.util.js";
import { ForgotPassword } from "../../models/Forgot-Password.model.js";
import { generateRandomString } from "../../helpers/generateNumber.helper.js";
import { sendMail } from "../../helpers/sendMail.helper.js";
import jwt from "jsonwebtoken";
import { ENV_VARS } from "../../config/envVars.config.js";

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
      return res
        .status(400)
        .json({ code: 400, message: "Tên người dùng đã tồn tại trong hệ thống" });
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

      return res.status(201).json({
        code: 201,
        message: "Yêu cầu đăng ký giáo viên đã được gửi. Vui lòng chờ quản trị viên phê duyệt.",
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
      return res
        .status(201)
        .json({ code: 201, message: "Tạo tài khoản người dùng thành công" });
    } else {
      return res.status(400).json({ code: 400, message: "Vai trò không hợp lệ" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ code: 400, message: "Lỗi máy chủ" });
  }
}
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ code: 400, message: "Email và mật khẩu là bắt buộc" });
    }
    const user = await TaiKhoan.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ code: 400, message: "Không tìm thấy người dùng" });
    }
    const isPasswordMatch = await bcryptjs.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ code: 400, message: "Mật khẩu không hợp lệ" });
    }
    generateTokenAndSetToken(user._id, res); //jwt
    res.status(201).json({
      code: 201,
      message: "Đăng nhập thành công",
      user: user,
    });
  } catch (error) {
    res.status(400).json({
      code: 400,
      message: "Lỗi máy chủ",
    });
  }
}
export async function logout(req, res) {
  try {
    res.clearCookie("jwt-token");
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
      return res.status(400).json({ code: 400, message: "Không tìm thấy người dùng" });
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
    res
      .status(201)
      .json({ code: 201, message: "Mã OTP hợp lệ! Vui lòng đặt lại mật khẩu!" });
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
      return res
        .status(401)
        .json({ code: 401, message: "Bạn chưa đăng nhập" });
    }

    const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);
    const user = await TaiKhoan.findById(decoded.userId).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ code: 404, message: "Không tìm thấy người dùng" });
    }

    res.status(200).json({ code: 200, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: "Lỗi máy chủ" });
  }
}
