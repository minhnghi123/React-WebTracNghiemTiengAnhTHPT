import ErrorReport from "../../models/errorReport.model.js";
import { Question } from "../../models/Question.model.js";
import { TaiKhoan } from "../../models/Taikhoan.model.js";
import Exam from "../../models/Exam.model.js";

const handleErrorReport = () => {
  _io.on("connection", (socket) => {
    console.log(`Client ${socket.id} connected (error-report)`);

    // Xử lý sự kiện gửi báo lỗi
    socket.on("REPORT_ERROR", async (data) => {
      const { description, questionId, examId, userId, additionalInfo } = data;

      if (!description || !questionId || !examId) {
        socket.emit("error", {
          message: "Mô tả lỗi, mã câu hỏi và mã bài thi là bắt buộc!",
        });
        return;
      }

      try {
        const newReport = new ErrorReport({
          description,
          questionId,
          examId,
          userId,
          additionalInfo,
        });

        await newReport.save();

        socket.emit("REPORT_SUCCESS", {
          message: "Báo cáo lỗi đã được gửi thành công!",
          report: newReport,
        });
      } catch (error) {
        console.error("Lỗi khi tạo báo cáo lỗi:", error);
        socket.emit("error", {
          message: "Đã xảy ra lỗi, vui lòng thử lại sau.",
        });
      }
    });

    // Xử lý sự kiện lấy danh sách báo lỗi
    socket.on("GET_ERROR_REPORTS", async () => {
      try {
        const reports = await ErrorReport.find()
          .populate("questionId")
          .populate("examId")
          .populate({ path: "userId", model: "TaiKhoan" })
          .sort({ createdAt: -1 });

        socket.emit("ERROR_REPORTS", reports);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách báo lỗi:", error);
        socket.emit("error", {
          message: "Không thể lấy danh sách báo lỗi.",
        });
      }
    });

    // Xử lý sự kiện cập nhật trạng thái báo lỗi
    socket.on("UPDATE_ERROR_STATUS", async ({ reportId, status }) => {
      if (!["pending", "resolved", "closed"].includes(status)) {
        socket.emit("error", {
          message: "Trạng thái không hợp lệ!",
        });
        return;
      }

      try {
        const updatedReport = await ErrorReport.findByIdAndUpdate(
          reportId,
          { status },
          { new: true }
        );

        if (!updatedReport) {
          socket.emit("error", {
            message: "Không tìm thấy báo lỗi!",
          });
          return;
        }

        socket.emit("UPDATE_SUCCESS", {
          message: "Cập nhật trạng thái báo lỗi thành công!",
          report: updatedReport,
        });

        // Gửi cập nhật đến tất cả các client
        _io.emit("ERROR_REPORT_UPDATED", updatedReport);
      } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái báo lỗi:", error);
        socket.emit("error", {
          message: "Không thể cập nhật trạng thái báo lỗi.",
        });
      }
    });

    // Xử lý sự kiện giáo viên phản hồi báo lỗi
    socket.on("RESPOND_ERROR", async ({ reportId, additionalInfo }) => {
      if (!reportId || !additionalInfo) {
        socket.emit("error", {
          message: "Mã báo lỗi và phản hồi là bắt buộc!",
        });
        return;
      }

      try {
        const updatedReport = await ErrorReport.findByIdAndUpdate(
          reportId,
          { additionalInfo },
          { new: true }
        );

        if (!updatedReport) {
          socket.emit("error", {
            message: "Không tìm thấy báo lỗi!",
          });
          return;
        }

        socket.emit("RESPOND_SUCCESS", {
          message: "Phản hồi báo lỗi thành công!",
          report: updatedReport,
        });

        // Gửi cập nhật đến tất cả các client
        _io.emit("ERROR_REPORT_UPDATED", updatedReport);

        // Gửi thông báo phản hồi thành công đến học sinh
        const studentUserId = updatedReport.userId; // Ensure userId maps to the student's ID
        _io.emit("TEACHER_RESPONSE_SUCCESS", {
          message: "Giáo viên đã phản hồi báo lỗi của bạn.",
          report: updatedReport,
          userId: studentUserId, // Include userId in the emitted event
        });
      } catch (error) {
        console.error("Lỗi khi phản hồi báo lỗi:", error);
        socket.emit("error", {
          message: "Không thể phản hồi báo lỗi.",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Client ${socket.id} disconnected (error-report)`);
    });
  });
};

export default handleErrorReport;
