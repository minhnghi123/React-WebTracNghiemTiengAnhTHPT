import mongoose from 'mongoose';

const { Schema } = mongoose;

const listeningExamSchema = new Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TaiKhoan', 
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    audio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Audio',
      required: true, 
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ListeningQuestion',
      },
    ],
    duration: {
      type: Number,
      required: true, 
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'], 
      required: true,
    },
    passingScore: {
      type: Number,
      required: true, 
    },
    isPublished: {
      type: Boolean,
      default: false, 
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true, // Tự động tạo createdAt và updatedAt
  }
);

// Tạo model từ schema
const ListeningExam = mongoose.model('ListeningExam', listeningExamSchema, "listening-exams");

export default ListeningExam;
