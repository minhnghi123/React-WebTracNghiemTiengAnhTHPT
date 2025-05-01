import jwt from "jsonwebtoken";
import { ENV_VARS } from "../../config/envVars.config.js";
import Classroom from "../../models/Classroom.model.js";
import { userLog } from "../../utils/logUser.js";

// Tham gia lớp học
export const joinClassroom = async (req, res) => {
  const token = req.cookies["jwt-token"];
  const decoded = await jwt.verify(token, ENV_VARS.JWT_SECRET);
  const studentId = decoded.userId;
  const { classroomId, password } = req.body;

  try {
    // Tìm lớp học theo ID
    const classroom = await Classroom.findById(classroomId);

    // Kiểm tra lớp học có tồn tại không
    if (!classroom) {
      userLog(req, "Join Classroom", `Failed to join classroom: ${classroomId} (not found)`);
      return res.status(404).json({
        success: false,
        message: "Classroom not found",
      });
    }

    // Kiểm tra mật khẩu
    if (classroom.password !== password) {
      userLog(req, "Join Classroom", `Failed to join classroom: ${classroomId} (wrong password)`);
      return res.status(401).json({
        success: false,
        message: "Sai mật khẩu",
      });
    }

    // Thêm học sinh vào lớp học
    const updatedClassroom = await Classroom.findByIdAndUpdate(
      classroomId,
      { $addToSet: { students: studentId } },
      { new: true }
    );

    userLog(req, "Join Classroom", `Successfully joined classroom: ${classroomId}`);
    return res.status(200).json({
      success: true,
      message: "Joined classroom successfully",
      classroom: updatedClassroom,
    });
  } catch (error) {
    userLog(req, "Join Classroom", `Error joining classroom: ${classroomId}`);
    console.error("Error joining classroom:", error);
    return res.status(500).json({
      success: false,
      message: "Error joining classroom",
      error: error.message,
    });
  }
};

// Lấy bài kiểm tra trong lớp học cụ thể
export const getClassroomTests = async (req, res) => {
  const { classroomId } = req.params;

  try {
    const classroom = await Classroom.findById(classroomId).populate("exams");

    if (!classroom) {
      userLog(req, "Get Classroom Tests", `Failed to retrieve tests for classroom: ${classroomId} (not found)`);
      return res.status(404).json({
        success: false,
        message: "Classroom not found",
      });
    }

    userLog(req, "Get Classroom Tests", `Successfully retrieved tests for classroom: ${classroomId}`);
    return res.status(200).json({
      success: true,
      message: "Classroom tests retrieved successfully",
      exams: classroom.exams,
    });
  } catch (error) {
    userLog(req, "Get Classroom Tests", `Error retrieving tests for classroom: ${classroomId}`);
    console.error("Error retrieving classroom tests:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving classroom tests",
      error: error.message,
    });
  }
};

// Lấy thông tin lớp học cụ thể
export const getClassroomById = async (req, res) => {
  const token = req.cookies["jwt-token"];
  const decoded = await jwt.verify(token, ENV_VARS.JWT_SECRET);
  const studentId = decoded.userId;
  const { classroomId } = req.params;

  try {
    const classroom = await Classroom.findById(classroomId)
      .populate("teacherId")
      .populate("students")
      .populate("exams");

    if (!classroom) {
      userLog(req, "Get Classroom Info", `Failed to retrieve classroom: ${classroomId} (not found)`);
      return res.status(404).json({
        success: false,
        message: "Classroom not found",
      });
    }

    const isStudentInClassroom = classroom.students.some(student => student._id.toString() === studentId);

    if (!isStudentInClassroom) {
      userLog(req, "Get Classroom Info", `Successfully retrieved classroom: ${classroomId}`);
      return res.status(200).json({
        success: true,
        message: "Classroom retrieved successfully",
        classroom: {
          _id: classroom._id,
          title: classroom.title,
          teacherId: classroom.teacherId,
          isDeleted: classroom.isDeleted,
          status: classroom.status,
          createdAt: classroom.createdAt,
          updatedAt: classroom.updatedAt,
        },
      });
    }

    userLog(req, "Get Classroom Info", `Successfully retrieved classroom: ${classroomId}`);
    return res.status(200).json({
      success: true,
      message: "Classroom retrieved successfully",
      classroom,
    });
  } catch (error) {
    userLog(req, "Get Classroom Info", `Error retrieving classroom: ${classroomId}`);
    console.error("Error retrieving classroom:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving classroom",
      error: error.message,
    });
  }
};

// Lấy danh sách lớp học mà học sinh đã tham gia
export const getStudentClassrooms = async (req, res) => {
  const token = req.cookies["jwt-token"];
  const decoded = await jwt.verify(token, ENV_VARS.JWT_SECRET);
  const studentId = decoded.userId;
  console.log(studentId);
  try {
    const classrooms = await Classroom.find({ students: studentId, isDeleted: false })
      .populate("teacherId")
      .populate("students")
      .populate("exams");

    userLog(req, "Get Student Classrooms", `Successfully retrieved classrooms for student: ${studentId}`);
    return res.status(200).json({
      success: true,
      message: "Student classrooms retrieved successfully",
      classrooms,
    });
  } catch (error) {
    userLog(req, "Get Student Classrooms", `Error retrieving classrooms for student: ${studentId}`);
    console.error("Error retrieving student classrooms:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving student classrooms",
      error: error.message,
    });
  }
};