import mongoose from "mongoose";

const FlashCardExamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  flashCardSetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FlashCardSet",
    required: true,
  },
  examType: {
    type: [String],
    enum: ["true false", "multiple choices", "written", "match"],
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Taikhoan",
    required: true,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
});
export const FlashCardExam = mongoose.model(
  "FlashCardExam",
  FlashCardExamSchema,
  "falshcardexams"
);
