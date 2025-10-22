import mongoose from "mongoose";
import slug from "mongoose-slug-updater";

// Kích hoạt plugin
mongoose.plugin(slug);

const ExamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  class: {
    type: String,
    enum: ["10", "11", "12"],
    default: "10",
  },
  topic: {
    type: Array,
    default: [],
  },
  knowledge: {
    type: Array,
    default: [],
  },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  duration: { type: Number, default: 90 },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  isPublic: { type: Boolean, default: false },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Taikhoan",
    required: true,
  },
  slug: {
    type: String,
    slug: "title",
    unique: true,
  },
  createdAt: { type: Date, default: Date.now },
  listeningExams: [
    { type: mongoose.Schema.Types.ObjectId, ref: "ListeningExam" },
  ], // Add this line
});

// ✅ FIX: Thêm index để query nhanh hơn
ExamSchema.index({ slug: 1 }); // Index cho slug
ExamSchema.index({ createdBy: 1, isPublic: 1 }); // Index cho filter
ExamSchema.index({ createdAt: -1 }); // Index cho sort

const Exam = mongoose.model("Exam", ExamSchema);
export default Exam;
