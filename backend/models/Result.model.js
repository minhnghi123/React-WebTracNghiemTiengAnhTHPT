import mongoose from "mongoose";

const QuestionDetailSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  content: {
    type: String,
    required: false, // ✅ FIX: Bỏ required vì listening questions dùng questionText
  },
  answers: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      text: String,
      correctAnswerForBlank: String,
      isCorrect: Boolean,
    },
  ],
  userAnswers: [
    {
      userAnswer: mongoose.Schema.Types.Mixed,
      answerId: mongoose.Schema.Types.ObjectId,
      isCorrect: Boolean,
    },
  ],
  selectedAnswerId: mongoose.Schema.Types.ObjectId,
  correctAnswerForBlank: [String],
  correctAnswerForTrueFalseNGV: [String],
  audio: mongoose.Schema.Types.ObjectId,
  isCorrect: {
    type: Boolean,
    default: false,
  },
  isSkipped: {
    type: Boolean,
    default: false,
  },
});

const ResultSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TaiKhoan",
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    correctAnswer: {
      type: Number,
      default: 0,
    },
    wrongAnswer: {
      type: Number,
      default: 0,
    },
    questions: [QuestionDetailSchema],
    listeningQuestions: [QuestionDetailSchema],
    suggestionQuestion: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    wrongAnswerByKnowledge: {
      type: Map,
      of: Number,
      default: {},
    },
    answerDetail: {
      type: String,
      default: "",
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    endTime: {
      type: Date,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Result = mongoose.model("Result", ResultSchema);
export default Result;
