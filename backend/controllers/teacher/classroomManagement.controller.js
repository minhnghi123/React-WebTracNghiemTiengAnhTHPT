import Classroom from "../../models/Classroom.model.js";
import { TaiKhoan } from "../../models/Taikhoan.model.js";
import Result from "../../models/Result.model.js"; // Import model kết quả
import XLSX from "xlsx"; // Import thư viện XLSX

export const createClassroom = async (req, res) => {
  try {
    const classroomData = req.body;

    const classroom = await new Classroom(classroomData).save();

    return res.status(201).json({
      success: true,
      message: "Tạo lớp học thành công!",
      classroom,
    });
  } catch (error) {
    console.error("Error creating classroom:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi tạo lớp học",
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
      message: "Lấy danh sách lớp học thành công",
      classrooms,
    });
  } catch (error) {
    console.error("Error retrieving classrooms:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách lớp học",
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
        message: "Không tìm thấy lớp học",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy thông tin lớp học thành công",
      classroom,
    });
  } catch (error) {
    console.error("Error retrieving classroom:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin lớp học",
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
        message: "Không tìm thấy lớp học",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật lớp học thành công",
      classroom: updatedClassroom,
    });
  } catch (error) {
    console.error("Error updating classroom:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật lớp học",
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
        message: "Không tìm thấy lớp học",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Xóa lớp học thành công (xóa mềm)",
      classroom: updatedClassroom,
    });
  } catch (error) {
    console.error("Error deleting classroom:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi xóa lớp học",
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
      message: "Danh sách học sinh không hợp lệ. Vui lòng cung cấp một mảng ID học sinh.",
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
        message: "Không tìm thấy lớp học",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Thêm học sinh vào lớp học thành công",
      classroom: updatedClassroom,
    });
  } catch (error) {
    console.error("Error adding students to classroom:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi thêm học sinh vào lớp học",
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
        message: "Không tìm thấy lớp học",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Xóa học sinh khỏi lớp học thành công",
      classroom: updatedClassroom,
    });
  } catch (error) {
    console.error("Error removing student from classroom:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi xóa học sinh khỏi lớp học",
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
        message: "Không tìm thấy lớp học",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Xóa học sinh khỏi lớp học thành công",
      classroom: updatedClassroom,
    });
  } catch (error) {
    console.error("Error removing student from classroom:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi xóa học sinh khỏi lớp học",
      error: error.message,
    });
  }
};

export const addExamToClassroom = async (req, res) => {
  const { classroomId, examId } = req.params;

  if (!examId) {
    return res.status(400).json({
      success: false,
      message: "Yêu cầu không hợp lệ. Vui lòng cung cấp examId.",
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
      message: "Thêm bài thi vào lớp học thành công",
      classroom: updatedClassroom,
    });
  } catch (error) {
    console.error("Error adding exam to classroom:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi thêm bài thi vào lớp học",
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
      message: 'Xóa bài thi khỏi lớp học thành công'
    });

  } catch (error) {
    console.error('Error removing exam from classroom:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa bài thi khỏi lớp học',
      error: error.message
    });
  }
};
// 12. Lấy danh sách tất cả người dùng lớp học
export const getAllStudents = async (req, res) => {
  try {
    const students = await TaiKhoan.find({ 
      deleted: false, role: "student" 
    })
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách học sinh thành công",
      students,
    });
  } catch (error) {
    console.error("Error retrieving students:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách học sinh",
      error: error.message,
    });
  }
};

export const getAllStudentResultsByExams = async (req, res) => {
  const { classroomId } = req.params;

  try {
    // Lấy thông tin lớp học, bao gồm danh sách học sinh và bài kiểm tra
    const classroom = await Classroom.findById(classroomId).populate("students exams");
    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lớp học",
      });
    }

    const studentIds = classroom.students.map(student => student._id);
    const examIds = classroom.exams.map(exam => exam._id);

    // Lấy tất cả kết quả của các bài kiểm tra của lớp (sử dụng trường userId thay cho studentId)
    const results = await Result.find({ 
      examId: { $in: examIds }, 
      userId: { $in: studentIds } 
    })
      .populate("userId", "email")
      .populate("examId", "questions")
      .sort({ createdAt: 1 });

    // Tạo map tổng hợp cho từng học sinh
    const studentAggregates = {};
    results.forEach(result => {
      const sid = result.userId._id.toString();
      const totalQuestions = result.examId.questions.length + result.listeningQuestions.length;
      // Bỏ qua nếu bài kiểm tra không có câu hỏi
      if (totalQuestions === 0) return;
      if (!studentAggregates[sid]) {
        studentAggregates[sid] = { totalCorrect: 0, totalQuestions: 0 };
      }
      studentAggregates[sid].totalCorrect += result.score;
      studentAggregates[sid].totalQuestions += totalQuestions;
    });

    // Tính số lượng học sinh theo từng loại dựa trên điểm trung bình (phần trăm số câu đúng)
    let excellent = 0;
    let good = 0;
    let average = 0;
    let poor = 0;

    classroom.students.forEach(student => {
      const sid = student._id.toString();
      if (studentAggregates[sid] && studentAggregates[sid].totalQuestions > 0) {
        const avgPercentage = (studentAggregates[sid].totalCorrect / studentAggregates[sid].totalQuestions) * 100;
        if (avgPercentage >= 80) {
          excellent++;
        } else if (avgPercentage >= 65) {
          good++;
        } else if (avgPercentage >= 50) {
          average++;
        } else {
          poor++;
        }
      } else {
        // Nếu học sinh chưa có kết quả, ta xếp vào loại "Poor"
        poor++;
      }
    });

    return res.status(200).json({
      success: true,
      message: "Phân loại kết quả học sinh thành công",
      data: {
        excellent,
        good,
        average,
        poor,
        totalStudents: classroom.students.length,
      }
    });
  } catch (error) {
    console.error("Error retrieving student results:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi phân loại kết quả học sinh",
      error: error.message,
    });
  }
};



export const getStudentResultsByExam = async (req, res) => {
  const { examId } = req.params;

  try {
    const results = await Result.find({ examId })
      .populate("userId", "email")
      .populate("examId", "title questions")
      .sort({ score: -1 });

    // Tính phần trăm cho từng kết quả: (score / totalQuestions) * 100
    const processedResults = results.map(result => {
      const totalQuestions = result.examId.questions.length;
      const percentage = totalQuestions ? (result.score / totalQuestions) * 100 : 0;
      return { ...result.toObject(), percentage: Number(percentage.toFixed(2)) };
    });

    return res.status(200).json({
      success: true,
      message: "Lấy kết quả học sinh thành công",
      data: processedResults,
    });
  } catch (error) {
    console.error("Error retrieving student results by exam:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy kết quả học sinh",
      error: error.message,
    });
  }
};


export const downloadStudentResultsExcel = async (req, res) => {
  const { classroomId } = req.params;

  try {
    // Lấy lớp học với danh sách học sinh và bài kiểm tra
    const classroom = await Classroom.findById(classroomId).populate("students exams");
    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lớp học",
      });
    }

    const studentIds = classroom.students.map(student => student._id);
    const examIds = classroom.exams.map(exam => exam._id);

    // Lấy kết quả của tất cả các bài kiểm tra của lớp (dùng userId thay cho studentId)
    const results = await Result.find({ 
      examId: { $in: examIds }, 
      userId: { $in: studentIds } 
    })
      .populate("userId", "email")
      .populate("examId", "title questions")
      .sort({ score: -1 });

    // Tạo đối tượng lưu trữ kết quả cao nhất (theo % số câu đúng) của mỗi học sinh cho mỗi bài kiểm tra
    const highestResults = {};
    results.forEach(result => {
      const studentEmail = result.userId.email;
      const examTitle = result.examId.title;
      const totalQuestions = result.examId.questions.length;
      const scoreOnScaleOf10 = totalQuestions ? (result.score / totalQuestions) * 10 : 0;
      if (!highestResults[studentEmail]) {
        highestResults[studentEmail] = {};
      }
      if (!highestResults[studentEmail][examTitle] || highestResults[studentEmail][examTitle] < scoreOnScaleOf10) {
        highestResults[studentEmail][examTitle] = Number(scoreOnScaleOf10.toFixed(2));
      }
    });

    // Tạo dữ liệu cho file Excel
    const header = ["Email", ...classroom.exams.map(exam => exam.title)];
    const data = [header];
    classroom.students.forEach(student => {
      const row = [student.email];
      classroom.exams.forEach(exam => {
        row.push(
          highestResults[student.email] ? highestResults[student.email][exam.title] || 0 : 0
        );
      });
      data.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Student Results");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=student_results_${classroomId}.xlsx`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (error) {
    console.error("Error downloading student results Excel:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi tải xuống kết quả học sinh",
      error: error.message,
    });
  }
};

// Lấy tất cả kết quả của 1 bài kiểm tra của tất cả học sinh trong 1 lớp
export const getAllResultsForExamInClassroom = async (req, res) => {
  const { classroomId, examId } = req.params;

  try {
    const classroom = await Classroom.findById(classroomId).populate("students");
    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lớp học",
      });
    }

    const studentIds = classroom.students.map(student => student._id);

    const results = await Result.find({
      examId,
      userId: { $in: studentIds },
    })
      .populate("userId", "email username") // Ensure both fields exist in the schema
      .sort({ score: -1 });

    return res.status(200).json({
      success: true,
      message: "Lấy kết quả của bài kiểm tra thành công",
      data: results,
    });
  } catch (error) {
    console.error("Error retrieving results for exam in classroom:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy kết quả của bài kiểm tra",
      error: error.message,
    });
  }
};

// Lấy kết quả của 1 học sinh của tất cả kiểm tra có trong lớp
export const getStudentResultsForAllExamsInClassroom = async (req, res) => {
  const { classroomId, studentId } = req.params;

  try {
    const classroom = await Classroom.findById(classroomId).populate("exams");
    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lớp học",
      });
    }

    const examIds = classroom.exams.map(exam => exam._id);

    const results = await Result.find({
      userId: studentId,
      examId: { $in: examIds },
    })
      .populate("examId", "title")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      message: "Lấy kết quả của học sinh thành công",
      data: results,
    });
  } catch (error) {
    console.error("Error retrieving student results for all exams in classroom:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy kết quả của học sinh",
      error: error.message,
    });
  }
};

// Lấy thông tin kết quả của 1 bài kiểm tra cụ thể
export const getSpecificExamResult = async (req, res) => {
  const { id } = req.params;
  const filter = {
    _id: id,
    isDeleted: false,
  };
  // console.log(filter);
 
  try {
    const result = await Result.findOne(filter).populate({
      path: "examId",
      populate: [
        { path: "questions" },
        {
          path: "listeningExams",
          populate: {
            path: "questions",
            select: "questionText options correctAnswer blankAnswer audio", // Include necessary fields
          },
        },
      ],
    });

    // Calculate additional details
    const totalQuestions = result.examId.questions.length;
    const correctAnswers = result.score;
    const percentage = totalQuestions ? (correctAnswers / totalQuestions) * 100 : 0;

    return res.status(200).json({
      success: true,
      message: "Lấy thông tin kết quả bài kiểm tra thành công",
      data: {
        result: result,
        examTitle: result.examId.title,
        studentEmail: result.userId.email,
        score: result.score,
        totalQuestions,
        correctAnswers,
        percentage: Number(percentage.toFixed(2)),
        createdAt: result.createdAt,
        duration: result.duration, // Assuming `duration` is stored in the result model
      },
    });
  } catch (error) {
    console.error("Error retrieving specific exam result:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin kết quả bài kiểm tra",
      error: error.message,
    });
  }
};
