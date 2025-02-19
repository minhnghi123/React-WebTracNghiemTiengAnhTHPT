import mongoose from "mongoose";
const { Schema } = mongoose;

const listeningQuestionSchema  = new Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TaiKhoan",
      required: true,
    },
    questionText: {
      type: String,
      required: true,
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
          required: true,
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
      },
    ],
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Tạo model từ schema
const ListeningQuestion = mongoose.model("ListeningQuestion", listeningQuestionSchema, "listening-questions");
export default ListeningQuestion;