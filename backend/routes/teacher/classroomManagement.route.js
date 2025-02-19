import express from "express";
import {
    createClassroom, getAllClassrooms, getClassroomById, updateClassroom, deleteClassroom, 
    addStudentsToClassroom, removeStudentFromClassroom, addExamToClassroom, removeExamFromClassroom, removeStudentsFromClassroom
  } from "../../controllers/teacher/classroomManagement.controller.js";

const router = express.Router();

// Route để tạo lớp học mới
router.post('/create', createClassroom);

// Route để lấy danh sách tất cả lớp học
router.get('/all', getAllClassrooms);

// Route để lấy lớp học theo ID
router.get('/:classroomId', getClassroomById);

// Route để cập nhật lớp học theo ID
router.patch('/update/:classroomId', updateClassroom);

// Route để xóa lớp học (soft delete)
router.delete('/delete/:classroomId', deleteClassroom);

router.patch('/add_students/:classroomId', addStudentsToClassroom);

// Route để xóa học viên khỏi lớp học
router.delete('/delete_student/:classroomId/:studentId', removeStudentFromClassroom);

router.delete('/remove_students/:classroomId', removeStudentsFromClassroom);

// Route để thêm bài thi vào lớp học
router.patch('/add_exam/:classroomId/:examId', addExamToClassroom);

router.delete('/remove_exam/:classroomId/:examId', removeExamFromClassroom);



export default router;