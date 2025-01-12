import mongoose from "mongoose";

const vocabSchema = new mongoose.Schema(
  {
    term: {
      type: String,
      required: true,
      unique: true,
    },
    definition: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Taikhoan",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Vocab = mongoose.model("Vocab", vocabSchema, "vocabs");
