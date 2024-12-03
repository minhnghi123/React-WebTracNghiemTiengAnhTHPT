import mongoose from "mongoose";
const AudioSchema = new mongoose.Schema({
  filePath: { type: String, default: "" },
  description: { type: String, default: "" },
  transcription: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null },
  isDeleted: { type: Boolean, default: false }
});

export const Audio = mongoose.model("Audio", AudioSchema);
