import mongoose from "mongoose";
const PassageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  sourceType: { type: mongoose.Schema.Types.ObjectId, ref: "SourceType" },
  deleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Passage = mongoose.model("Passage", PassageSchema);
