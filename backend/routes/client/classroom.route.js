import express from 'express';
import { joinClassroom, getClassroomTests, getClassroomById, getStudentClassrooms } from '../../controllers/client/classrooms.controller.js';

const router = express.Router();

// Tham gia lớp học
router.post('/join', joinClassroom);

// Lấy bài kiểm tra trong lớp học cụ thể
router.get('/:classroomId/tests', getClassroomTests);

// Lấy thông tin lớp học cụ thể
router.get('/:classroomId', getClassroomById);

// Lấy danh sách lớp học mà học sinh đã tham gia
router.get('/', getStudentClassrooms);

export default router;