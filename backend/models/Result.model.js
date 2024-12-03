import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
  // userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  score: { type: Number, required: true },
  correctAnswer: { type: Number, required: true },
  wrongAnswer: { type: Number, required: true },
  questions: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
      content: { type: String, required: true },
      answers: [
        {
          _id: { type: mongoose.Schema.Types.ObjectId, required: true },
          text: { type: String },
          isCorrect: { type: Boolean, required: true },
        },
      ],
      selectedAnswerId: { type: mongoose.Schema.Types.ObjectId },
      isCorrect: { type: Boolean, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  isDeleted: {type: Boolean, default: false}
});

const Result = mongoose.model("Result", ResultSchema);
export default Result;
