import mongoose from "mongoose";

const errorReportSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Taikhoan",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "resolved", "closed"],
      default: "pending",
    },
    additionalInfo: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const ErrorReport = mongoose.model(
  "ErrorReport",
  errorReportSchema,
  "error-reports"
);
export default ErrorReport;
