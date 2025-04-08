import mongoose from 'mongoose';
import slug from 'mongoose-slug-updater';

// Activate the slug plugin
mongoose.plugin(slug);

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
      default: 90,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    slug: {
      type: String,
      slug: 'title',
      unique: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically create createdAt and updatedAt
  }
);

// Create model from schema
const ListeningExam = mongoose.model('ListeningExam', listeningExamSchema, 'listening-exams');

export default ListeningExam;
