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
    default: "student",
  },
});
export const TaiKhoan = mongoose.model("TaiKhoan", taiKhoanSchema, "taikhoans");
