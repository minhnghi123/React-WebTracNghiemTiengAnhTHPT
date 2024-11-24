import { TaiKhoan } from "../../models/Taikhoan.model.js";
import bcryptjs from "bcryptjs";
import { generateTokenAndSetToken } from "../../utils/generateToken.util.js";
export async function signup(req, res) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        code: 400,
        message: "All fields are required",
      });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ code: 400, message: "Password must be at least 6 characters" });
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
        .json({ code: 400, message: "Email already exists" });
    }
    if (existingUserByUsername) {
      return res
        .status(400)
        .json({ code: 400, message: "Username already exists" });
    }
    const salt = bcryptjs.genSaltSync(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    // console.log(salt);
    // console.log(hashedPassword);
    const newUser = new TaiKhoan({
      username,
      email,
      password: hashedPassword,
    });
    if (newUser) {
      generateTokenAndSetToken(newUser._id, res); //jwt
      await newUser.save();
      res.status(201).json({ code: 201, message: "User created successfully" });
    } else {
      res.status(400).json({ code: 400, message: "Failed to create user" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ code: 400, message: "Internal server error" });
  }
}
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ code: 400, message: "Email and password are required" });
    }
    const user = await TaiKhoan.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ code: 400, message: "User not found" });
    }
    const isPasswordMatch = await bcryptjs.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ code: 400, message: "Invalid password" });
    }
    generateTokenAndSetToken(user._id, res); //jwt
    res.status(201).json({
      code: 201,
      message: "Logged in successfully",
      user: user,
    });
  } catch (error) {
    res.status(400).json({
      code: 400,
      message: "Internal server error",
    });
  }
}
export async function logout(req, res) {
  try {
    res.clearCookie("jwt-token");
    res.status(201).json({ code: 201, message: "Logged out successfully" });
  } catch (error) {
    res.status(400).json({ code: 400, message: "Internal server error" });
  }
}
