import ListeningExam from "../../models/listeningExam.model.js";

export const createListeningExamController = async (req, res) => {
  try {
    const data = req.body;

    const newExam = new ListeningExam(data);

    await newExam.save();

    return res.status(201).json({
      message: "Bài kiểm tra đã được tạo thành công!",
      data: newExam,
    });
  } catch (error) {
    console.error("Lỗi khi tạo bài kiểm tra:", error);
    return res.status(500).json({
      message: "Không thể tạo bài kiểm tra. Vui lòng thử lại sau.",
      error: error.message,
    });
  }
};

export const getAllListeningExamsController = async (req, res) => {
  try {
    const exams = await ListeningExam.find({
      isDeleted: false,
      isPublished: true,
    })
      .populate("questions")
      .populate("teacherId")
      .populate("audio");

    return res.status(200).json({
      message: "Danh sách bài kiểm tra",
      data: exams,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bài kiểm tra:", error);
    return res.status(500).json({
      message: "Không thể lấy danh sách bài kiểm tra. Vui lòng thử lại sau.",
      error: error.message,
    });
  }
};

export const getAllListeningExamsOfMyselfController = async (req, res) => {
  try {
    const teacherId = req.userId;
    const exams = await ListeningExam.find({
      isDeleted: false,
      teacherId: teacherId,
    })
      .populate("questions")
      .populate("teacherId")
      .populate("audio");

    return res.status(200).json({
      message: "Danh sách bài kiểm tra của bạn",
      data: exams,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bài kiểm tra:", error);
    return res.status(500).json({
      message: "Không thể lấy danh sách bài kiểm tra. Vui lòng thử lại sau.",
      error: error.message,
    });
  }
};

export const updateListeningExamController = async (req, res) => {
  try {
    const { examId } = req.params;
    const updateData = req.body;

    const updatedExam = await ListeningExam.findByIdAndUpdate(
      examId,
      updateData,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Cập nhật bài kiểm tra thành công!",
      data: updatedExam,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật bài kiểm tra:", error);
    return res.status(500).json({
      message: "Không thể cập nhật bài kiểm tra. Vui lòng thử lại sau.",
      error: error.message,
    });
  }
};

export const deleteExamController = async (req, res) => {
  const { examId } = req.params;

  try {
    const exam = await ListeningExam.findByIdAndUpdate(
      examId,
      { isDeleted: true },
      { new: true }
    );

    if (!exam) {
      return res.status(404).json({ message: "Bài kiểm tra không tồn tại." });
    }

    return res.status(200).json({
      message: "Bài kiểm tra đã được xóa thành công (soft delete).",
    });
  } catch (error) {
    console.error("Error during exam soft delete:", error);
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi khi xóa bài kiểm tra." });
  }
};
