import mongoose from "mongoose";

const FlashCardSetSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    vocabs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vocab",
        required: true,
      },
    ],
    deleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Taikhoan",
      required: true,
    },
    public: {
      type: Boolean,
      default: false,
    },
    editable: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const FlashCardSet = mongoose.model(
  "FlashCardSet",
  FlashCardSetSchema,
  "flashcardsets"
);
