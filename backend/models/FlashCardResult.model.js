import mongoose from "mongoose";

const FlashCardResultSchema = new mongoose.Schema(
  {
    flashCardExamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FlashCardExam",
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    correctAnswer: {
      type: Number,
      required: true,
    },
    wrongAnswer: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
export const FlashCardResult = mongoose.model(
  "FlashCardResult",
  FlashCardResultSchema,
  "flashcardresults"
);
