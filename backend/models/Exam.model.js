import mongoose from "mongoose";
import slug from "mongoose-slug-updater";

// Kích hoạt plugin
mongoose.plugin(slug);

const ExamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  duration: { type: Number, default: 90 },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  isPublic: { type: Boolean, default: false },
  // createdBy: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "User",
  //   required: true,
  // },
  slug: {
    type: String,
    slug: "title",
    unique: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const Exam = mongoose.model("Exam", ExamSchema);
export default Exam;
