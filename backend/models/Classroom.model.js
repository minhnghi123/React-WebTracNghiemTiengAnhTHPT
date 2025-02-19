import mongoose from "mongoose";

const ClassroomSchema = new mongoose.Schema({
    title: { type: String, required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'TaiKhoan', required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TaiKhoan' }],
    password: { type: String, required: false },
    exams: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Exam'
    }],
    isDeleted: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive', 'completed'], default: 'active' }
}, { 
    timestamps: true
});

const Classroom = mongoose.model("Classroom", ClassroomSchema);

export default Classroom;
