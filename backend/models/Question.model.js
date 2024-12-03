import mongoose from "mongoose";
const QuestionSchema = new mongoose.Schema({
  content: { type: String, required: true },
  questionType: { type: mongoose.Schema.Types.ObjectId, ref: "QuestionType", require: true },
  level: {
    type: String,
    enum: ["easy", "hard"],
    default: "easy",
  },
  answers: [
    {
      text: { type: String, required: true },
      correctAnswerForBlank: { type: String, default: "" },
      isCorrect: { type: Boolean, default: false },
    },
  ],
  subject: { type: String, default: "English" },
  audio: { type: String, default: "" },
  knowledge: {
    type: String,
    default: "General Knowledge",
  },
  translation: {
    type: String,
    default: "",
  },
  explanation: {
    type: String,
    default: "",
  },
  // author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  // isApproved: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Question = mongoose.model("Question", QuestionSchema);
