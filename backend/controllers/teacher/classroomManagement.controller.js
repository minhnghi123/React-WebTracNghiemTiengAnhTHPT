import Classroom from "../../models/Classroom.model.js";

export const createClassroom = async (req, res) => {
  try {
    const classroomData = req.body;

    const classroom = await new Classroom(classroomData).save();

    return res.status(201).json({
      success: true,
      message: "Classroom created successfully!",
      classroom,
    });
  } catch (error) {
    console.error("Error creating classroom:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating classroom",
      error: error.message,
    });
  }
};

export const getAllClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find({ isDeleted: false }).populate(
      "teacherId students exams"
    );
    return res.status(200).json({
      success: true,
      message: "Classrooms retrieved successfully",
      classrooms,
    });
  } catch (error) {
    console.error("Error retrieving classrooms:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving classrooms",
      error: error.message,
    });
  }
};

// 3. Lấy thông tin lớp học theo ID
export const getClassroomById = async (req, res) => {
  const { classroomId } = req.params; // Lấy classroomId từ params

  try {
    const classroom = await Classroom.findById(classroomId)
      .populate("teacherId")
      .populate("students")
      .populate("exams");

    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: "Classroom not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Classroom retrieved successfully",
      classroom,
    });
  } catch (error) {
    console.error("Error retrieving classroom:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving classroom",
      error: error.message,
    });
  }
};

// 4. Cập nhật thông tin lớp học
export const updateClassroom = async (req, res) => {
  const { classroomId } = req.params; // Lấy classroomId từ params
  const updateData = req.body; // Dữ liệu cập nhật từ body request

  try {
    // Thêm thời gian cập nhật vào dữ liệu
    updateData.updatedAt = Date.now();

    // Cập nhật lớp học theo ID và dữ liệu cập nhật
    const updatedClassroom = await Classroom.findByIdAndUpdate(
      classroomId,
      updateData,
      { new: true }
    );

    // Kiểm tra xem lớp học có tồn tại không
    if (!updatedClassroom) {
      return res.status(404).json({
        success: false,
        message: "Classroom not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Classroom updated successfully",
      classroom: updatedClassroom,
    });
  } catch (error) {
    console.error("Error updating classroom:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating classroom",
      error: error.message,
    });
  }
};

// 5. Xóa lớp học (soft delete)
export const deleteClassroom = async (req, res) => {
  const { classroomId } = req.params; // Lấy classroomId từ params

  try {
    const updatedClassroom = await Classroom.findByIdAndUpdate(
      classroomId,
      { isDeleted: true },
      { new: true }
    );

    if (!updatedClassroom) {
      return res.status(404).json({
        success: false,
        message: "Classroom not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Classroom deleted successfully (soft delete)",
      classroom: updatedClassroom,
    });
  } catch (error) {
    console.error("Error deleting classroom:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting classroom",
      error: error.message,
    });
  }
};

// 6. Thêm nhieu` học viên vào lớp học
export const addStudentsToClassroom = async (req, res) => {
  const { classroomId } = req.params; // classroomId từ params
  const { studentIds } = req.body; // studentIds từ body request (mảng các studentId)

  // Kiểm tra xem studentIds có phải là mảng không và có phần tử hay không
  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid student IDs. Please provide an array of student IDs.",
    });
  }

  try {
    const updatedClassroom = await Classroom.findByIdAndUpdate(
      classroomId,
      { $addToSet: { students: { $each: studentIds } } },
      { new: true }
    );

    if (!updatedClassroom) {
      return res.status(404).json({
        success: false,
        message: "Classroom not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Students added to classroom successfully",
      classroom: updatedClassroom,
    });
  } catch (error) {
    console.error("Error adding students to classroom:", error);
    return res.status(500).json({
      success: false,
      message: "Error adding students to classroom",
      error: error.message,
    });
  }
};

export const removeStudentFromClassroom = async (req, res) => {
  const { classroomId, studentId } = req.params; // classroomId và studentId từ params

  try {
    const updatedClassroom = await Classroom.findByIdAndUpdate(
      classroomId,
      { $pull: { students: studentId } },
      { new: true }
    );

    // Kiểm tra lớp học có tồn tại không
    if (!updatedClassroom) {
      return res.status(404).json({
        success: false,
        message: "Classroom not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student removed from classroom successfully",
      classroom: updatedClassroom,
    });
  } catch (error) {
    console.error("Error removing student from classroom:", error);
    return res.status(500).json({
      success: false,
      message: "Error removing student from classroom",
      error: error.message,
    });
  }
};

export const removeStudentsFromClassroom  = async (req, res) => {
  const { classroomId } = req.params;
  const { studentIds } = req.body;

  try {
    const updatedClassroom = await Classroom.findByIdAndUpdate(
      classroomId,
      { $pull: { students: { $in: studentIds } } }, 
      { new: true }
    );

    // Kiểm tra lớp học có tồn tại không
    if (!updatedClassroom) {
      return res.status(404).json({
        success: false,
        message: "Classroom not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student removed from classroom successfully",
      classroom: updatedClassroom,
    });
  } catch (error) {
    console.error("Error removing student from classroom:", error);
    return res.status(500).json({
      success: false,
      message: "Error removing student from classroom",
      error: error.message,
    });
  }
};

export const addExamToClassroom = async (req, res) => {
  const { classroomId, examId } = req.params;

  if (!examId) {
    return res.status(400).json({
      success: false,
      message: "Invalid request. Please provide examId.",
    });
  }

  try {
    const updatedClassroom = await Classroom.findByIdAndUpdate(
      classroomId,
      { $addToSet: { exams: examId } }, // Dùng $addToSet để tránh trùng lặp
      { new: true }
    ).populate("exams");

    return res.status(200).json({
      success: true,
      message: "Exam added to classroom successfully",
      classroom: updatedClassroom,
    });
  } catch (error) {
    console.error("Error adding exam to classroom:", error);
    return res.status(500).json({
      success: false,
      message: "Error adding exam to classroom",
      error: error.message,
    });
  }
};

// 11. Xóa bài thi khỏi lớp học
export const removeExamFromClassroom = async (req, res) => {
  const { classroomId, examId } = req.params;

  try {
    // 3. Xóa examId khỏi danh sách exams của lớp học
    await Classroom.findByIdAndUpdate(
      classroomId,
      { $pull: { exams: examId } }, 
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Exam removed from classroom successfully'
    });

  } catch (error) {
    console.error('Error removing exam from classroom:', error);
    return res.status(500).json({
      success: false,
      message: 'Error removing exam from classroom',
      error: error.message
    });
  }
};

