import Exam from "../../models/Exam.model.js";


// [GET]: teacher/exam
export const  getAllExams = async (req, res) => {
    try {
      const { page = 1, limit = 10, title, isPublic } = req.query; // Lấy các tham số từ query
      
      // Tạo bộ lọc (filter)
      const filter = {};
      if (title) {
        filter.title = { $regex: title, $options: "i" }; // Lọc theo tiêu đề (không phân biệt hoa thường)
      }
      if (isPublic !== undefined) {
        filter.isPublic = isPublic === "true"; // Lọc theo trạng thái công khai
      }
  
      // Phân trang
      const skip = (page - 1) * limit;
  
      // Lấy danh sách đề thi dựa trên bộ lọc và phân trang
      const exams = await Exam.find(filter)
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }); // Sắp xếp giảm dần theo thời gian tạo
  
      // Đếm tổng số đề thi thỏa mãn bộ lọc
      const total = await Exam.countDocuments(filter);
  
      // Phản hồi thành công
      return res.status(200).json({
        success: true,
        message: "Lấy danh sách đề thi thành công!",
        data: exams,
        pagination: {
          total,
          page: Number(page),
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      // Xử lý lỗi server
      console.error("Lỗi khi lấy danh sách đề thi:", error.message);
  
      return res.status(500).json({
        success: false,
        message: "Lỗi server! Không thể lấy danh sách đề thi.",
        error: error.message,
      });
    }
};

// [GET]: teacher/exam/detail/:slug
export const getExamDetail = async (req, res) => {
  try {
    const { slug } = req.params; // Lấy slug từ URL

    // Tìm đề thi theo slug và populate danh sách câu hỏi
    const exam = await Exam.findOne({ slug }).populate("questions");

    // Nếu không tìm thấy đề thi, trả về lỗi 404
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Đề thi không tồn tại!",
      });
    }

    // Phản hồi thành công với thông tin đề thi
    return res.status(200).json({
      success: true,
      message: "Lấy thông tin đề thi thành công!",
      data: exam,
    });
  } catch (error) {
    // Xử lý lỗi server
    console.error("Lỗi khi lấy thông tin đề thi:", error.message);

    return res.status(500).json({
      success: false,
      message: "Lỗi server! Không thể lấy thông tin đề thi.",
      error: error.message,
    });
  }
};

// [PATCH]: teacher/exam/toggle-visibility/:id
export const toggleExamVisibility = async (req, res) => {
  try {
    const { id } = req.params; // Lấy id từ URL

    // Tìm đề thi theo id
    const exam = await Exam.findById(id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Đề thi không tồn tại!",
      });
    }

    // Chuyển đổi trạng thái công khai
    exam.isPublic = !exam.isPublic;

    // Lưu thay đổi
    await exam.save();

    // Phản hồi thành công
    return res.status(200).json({
      success: true,
      message: `Đề thi đã được ${exam.isPublic ? "công khai" : "ẩn"} thành công!`,
      data: {
        id: exam._id,
        title: exam.title,
        isPublic: exam.isPublic,
      },
    });
  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Lỗi server! Không thể cập nhật trạng thái công khai của đề thi.",
      error: error.message,
    });
  }
};

// [POST]: teacher/exam/create
export const createExam = async (req, res) => {
  try {
    const { title, description, questions, duration, isPublic, startTime, endTime} = req.body;

    if (!title || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Thiếu dữ liệu bắt buộc! Vui lòng kiểm tra lại.",
      });
    }

    if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({
        success: false,
        message: "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc!",
      });
    }

    // Tạo đối tượng Exam mới
    const newExam = new Exam({
      title,
      description,
      questions,
      duration: duration || 90, // Sử dụng giá trị mặc định nếu không có
      isPublic: isPublic || false,
      startTime: startTime ? new Date(startTime) : undefined, 
      endTime: endTime ? new Date(endTime) : undefined, 
    });

    // Lưu vào database
    const savedExam = await newExam.save();

    // Phản hồi thành công
    return res.status(200).json({
      success: true,
      message: "Đề thi đã được tạo thành công!",
      data: savedExam,
    });
  } catch (error) {
    // Xử lý lỗi server
    console.error("Error creating exam:", error.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi server! Không thể tạo đề thi.",
      error: error.message,
    });
  }
};

// [PATCH]: teacher/exam/update/:slug
export const updateExam = async (req, res) => {
    try {
      const { slug } = req.params; // Lấy slug từ URL
      const { title, description, questions, duration, isPublic, startTime, endTime } = req.body;
  
      if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
        return res.status(400).json({
          success: false,
          message: "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc!",
        });
      }

      if (startTime && new Date(startTime) < new Date()) {
        return res.status(400).json({
          success: false,
          message: "Thời gian bắt đầu không thể là quá khứ!",
        });
      }

      if (startTime && new Date(startTime) < new Date()) {
        return res.status(400).json({
          success: false,
          message: "Thời gian bắt đầu không thể là quá khứ!",
        });
      }
      
      // Cập nhật đề thi dựa trên slug
      const updatedExam = await Exam.findOneAndUpdate(
        { slug }, 
        { title, description, questions, duration, isPublic, startTime, endTime }, 
        { new: true, runValidators: true } // Trả về tài liệu sau khi cập nhật
      );
  
      // Nếu không tìm thấy đề thi, trả về lỗi 404
      if (!updatedExam) {
        return res.status(404).json({
          success: false,
          message: "Đề thi không tồn tại!",
        });
      }
  
      // Phản hồi thành công
      return res.status(200).json({
        success: true,
        message: "Đề thi đã được cập nhật thành công!",
        data: updatedExam,
      });
    } catch (error) {
      // Xử lý lỗi server
      return res.status(500).json({
        success: false,
        message: "Lỗi server! Không thể cập nhật đề thi.",
        error: error.message,
      });
    }
};

// [DELETE]: teacher/exam/delete/:id
export const deleteExam = async (req, res) => {
    try {
      const { id } = req.params; // Lấy id từ URL
  
      // Tìm và xóa đề thi dựa trên _id
      const deletedExam = await Exam.findByIdAndDelete(id);
  
      // Nếu không tìm thấy đề thi, trả về lỗi 404
      if (!deletedExam) {
        return res.status(404).json({
          success: false,
          message: "Đề thi không tồn tại!",
        });
      }
  
      // Phản hồi thành công
      return res.status(200).json({
        success: true,
        message: "Đề thi đã được xóa thành công!",
      });
    } catch (error) {
      // Xử lý lỗi server
      console.error("Lỗi khi xóa đề thi:", error.message);
  
      // Trả về lỗi 500 cho client
      return res.status(500).json({
        success: false,
        message: "Lỗi server! Không thể xóa đề thi.",
        error: error.message,
      });
    }
};
