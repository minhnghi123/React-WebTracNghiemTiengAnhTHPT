import mongoose from "mongoose";

const taiKhoanSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Regular expression to validate email format
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: "",
  },
  phone: String,
  role: {
    type: String,
    enum: ["student", "teacher", "admin"],
    default: "student",
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    default: "false",
  },
  violationCount: {
    type: Number,
    default: 0,
  },
  blockedUntil: {
    type: Date,
    default: null,
  },
  lastLoginInfo: {
    ip: { type: String },             // IP đăng nhập lần gần nhất
    userAgent: { type: String },      // Trình duyệt + hệ điều hành (User-Agent)
    deviceId: { type: String },       // Có thể là fingerprint hoặc mã định danh thiết bị
    time: { type: Date },             // Thời điểm đăng nhập gần nhất
  },
  trustedDevices: [
    {
      deviceId: String,              // Mã định danh thiết bị đã xác thực/trusted
      addedAt: Date                  // Ngày thêm vào danh sách trusted
    }
  ],
});
export const TaiKhoan = mongoose.model("TaiKhoan", taiKhoanSchema, "taikhoans");
