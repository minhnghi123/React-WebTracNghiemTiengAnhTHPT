import mongoose from "mongoose";
const { Schema } = mongoose;

const listeningQuestionSchema = new Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TaiKhoan",
      required: true,
    },
    questionText: {
      type: String,
      trim: true,
    },
    questionType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuestionType",
      required: true,
    },
    options: [
      {
        option_id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        optionText: {
          type: String,
          default: "",
        },
        isCorrect: {
          type: Boolean,
          required: true,
          default: false, // Set default to false
        },
      },
    ],
    correctAnswer: [
      {
        answer_id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        answer: {
          type: String,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          required: true,
          default: false, // Set default to false
        },
      },
    ],
    correctAnswerForTrueFalseNGV: {
      type: String,
      enum: ["true", "false", "notgiven", ""],
      default: "",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },
    isDeleted: { type: Boolean, default: false },
    blankAnswer: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Tạo model từ schema
const ListeningQuestion = mongoose.model(
  "ListeningQuestion",
  listeningQuestionSchema,
  "listening-questions"
);
export default ListeningQuestion;
