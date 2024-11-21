import mongoose from "mongoose";
const QuestionSchema = new mongoose.Schema({
  content: { type: String, required: true },
  level: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "easy",
  },
  answers: [
    {
      text: { type: String, required: true },
      isCorrect: { type: Boolean, default: false },
    },
  ],
  subject: { type: String, default: "English" },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Question = mongoose.model("Question", QuestionSchema);
