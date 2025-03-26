import ErrorReport from '../../models/errorReport.model';

const handleErrorReport = () => {
    _io.on('connection', (socket) => {
    console.log(`Client ${socket.id} connected (error-report)`);

    socket.on('REPORT_ERROR', async (data) => {
      const { description, questionId, userId, additionalInfo } = data;

      if (!description || !questionId) {
        socket.emit('error', { message: 'Mô tả lỗi và mã câu hỏi là bắt buộc!' });
        return;
      }

      try {

        const newReport = new ErrorReport({
          description,
          
          questionId,
          userId,
          additionalInfo,
        });

        await newReport.save();

        socket.emit('REPORT_SUCCESS', { message: 'Báo cáo lỗi đã được gửi thành công!', report: newReport });

      } catch (error) {
        console.error('Lỗi khi tạo báo cáo lỗi:', error);
        socket.emit('error', { message: 'Đã xảy ra lỗi, vui lòng thử lại sau.' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client ${socket.id} disconnected (error-report)`);
    });
  });
};

export default handleErrorReport;
