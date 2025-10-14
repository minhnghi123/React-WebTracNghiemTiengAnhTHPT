import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TaiKhoan",
    required: true,
  },
  score: { type: Number, required: true },
  classroomId: { type: mongoose.Schema.Types.ObjectId, ref: "Classroom" },
  correctAnswer: { type: Number, required: true },
  wrongAnswer: { type: Number, required: true },
  questions: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true,
      },
      content: { type: String, required: true, default: " " },
      answers: [
        {
          _id: { type: mongoose.Schema.Types.ObjectId, required: true },
          text: { type: String },
          correctAnswerForBlank: { type: String },
          isCorrect: { type: Boolean, required: true },
        },
      ],
      selectedAnswerId: { type: mongoose.Schema.Types.ObjectId },
      userAnswers: [
        {
          userAnswer: { type: String },
          answerId: { type: mongoose.Schema.Types.ObjectId, ref: "Answer" },
          isCorrect: { type: Boolean, default: false },
        },
      ],
      correctAnswerForTrueFalseNGV: [{ type: String }],
      isCorrect: { type: Boolean, required: true },
      isSkipped: { type: Boolean, default: false }, // Thêm field isSkipped
    },
  ],
  listeningQuestions: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ListeningQuestion",
        required: true,
      },
      content: { type: String, required: true, default: " " },
      answers: [
        {
          _id: { type: mongoose.Schema.Types.ObjectId, required: true },
          text: { type: String },
          correctAnswerForBlank: { type: String },
          isCorrect: { type: Boolean, required: true },
        },
      ],
      selectedAnswerId: { type: mongoose.Schema.Types.ObjectId },
      userAnswers: [
        {
          userAnswer: { type: String },
          answerId: { type: mongoose.Schema.Types.ObjectId, ref: "Answer" },
          isCorrect: { type: Boolean, default: false },
        },
      ],
      correctAnswerForTrueFalseNGV: [{ type: String }],
      isCorrect: { type: Boolean, required: true },
      isSkipped: { type: Boolean, default: false }, // Thêm field isSkipped
    },
  ],
  createdAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
  suggestionQuestion: {
    type: Array,
    default: [],
  },
  wrongAnswerByKnowledge: {
    type: Object,
    default: {},
  },
  isCompleted: { type: Boolean, default: false },
  endTime: { type: Date },
});

const Result = mongoose.model("Result", ResultSchema);
export default Result;
