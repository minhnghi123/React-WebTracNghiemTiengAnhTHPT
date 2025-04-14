import express from "express";
import {
    createClassroom, getAllClassrooms, getClassroomById, updateClassroom, deleteClassroom, 
    addStudentsToClassroom, removeStudentFromClassroom, addExamToClassroom, removeExamFromClassroom, removeStudentsFromClassroom,
    getAllStudents,
    downloadStudentResultsExcel,
    getAllStudentResultsByExams,
    getStudentResultsByExam,
    getAllResultsForExamInClassroom,
    getStudentResultsForAllExamsInClassroom,
    getSpecificExamResult
  } from "../../controllers/teacher/classroomManagement.controller.js";

import { validateClassroom } from "../../validate/teacher/classroom.validate.js"

const router = express.Router();

// Route để tạo lớp học mới
router.post('/create', validateClassroom, createClassroom);

// Route để lấy danh sách tất cả lớp học
router.get('/all', getAllClassrooms);

// Route để lấy danh sách tất cả học sinh
router.get('/allStudents', getAllStudents);

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

// Route để lấy tất cả kết quả làm bài của học sinh trong lớp theo từng bài kiểm tra
router.get("/:classroomId/results", getAllStudentResultsByExams);

// Route để lấy kết quả học sinh theo từng bài kiểm tra
router.get("/:classroomId/exam/:examId/results", getStudentResultsByExam);

// Route để tải xuống file Excel kết quả học sinh theo lớp
router.get("/:classroomId/results/excel", downloadStudentResultsExcel);

// Route để lấy tất cả kết quả của 1 bài kiểm tra của tất cả học sinh trong 1 lớp
router.get("/:classroomId/exam/:examId/all-results", getAllResultsForExamInClassroom);

// Route để lấy kết quả của 1 học sinh của tất cả kiểm tra có trong lớp
router.get("/:classroomId/student/:studentId/all-results", getStudentResultsForAllExamsInClassroom);

// Route để lấy thông tin kết quả của 1 bài kiểm tra cụ thể
router.get("/exam/:id/", getSpecificExamResult);

export default router;