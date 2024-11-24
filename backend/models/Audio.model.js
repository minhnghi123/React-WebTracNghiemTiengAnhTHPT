import mongoose from "mongoose";
const AudioSchema = new mongoose.Schema({
  filePath: { type: String, required: true },
  description: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export const Audio = mongoose.model("Audio", AudioSchema);
