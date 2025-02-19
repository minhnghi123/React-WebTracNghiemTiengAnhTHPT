import mongoose from "mongoose";

const VerificationRequestSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    status: { type: String, default: "pending" }, // "pending", "approved", "rejected"
  },
  {
    timestamps: true,
  }
);

export const VerificationRequest = mongoose.model(
  "VerificationRequest",
  VerificationRequestSchema,
  "verification-requests"
);
