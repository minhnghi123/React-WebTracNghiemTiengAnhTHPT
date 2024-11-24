import mongoose from "mongoose";
const SourceTypeSchema = new mongoose.Schema({
  name: { type: String, required: true }, //Listening,Reading
  description: { type: String, default: "" },
});

export const SourceType = mongoose.model("SourceType", SourceTypeSchema);
