import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // Kết nối đến server WebSocket

interface ErrorReport {
  _id: string;
  description: string;
  questionId: string;
  examId: string;
  userId: string;
  createdAt: string;
  status: string;
  additionalInfo?: string;
}

const QuanLyBaoLoi: React.FC = () => {
  const [errorReports, setErrorReports] = useState<ErrorReport[]>([]);
  const [response, setResponse] = useState("");
  const [selectedReport, setSelectedReport] = useState<ErrorReport | null>(null);

  useEffect(() => {
    // Kết nối và lắng nghe sự kiện từ server
    socket.emit("GET_ERROR_REPORTS"); // Yêu cầu danh sách báo lỗi

    socket.on("ERROR_REPORTS", (reports: ErrorReport[]) => {
      setErrorReports(reports); // Cập nhật danh sách báo lỗi
    });

    socket.on("ERROR_REPORT_UPDATED", (updatedReport: ErrorReport) => {
      // Cập nhật trạng thái báo lỗi trong danh sách
      setErrorReports((prev) =>
        prev.map((report) =>
          report._id === updatedReport._id ? updatedReport : report
        )
      );
    });

    return () => {
      socket.off("ERROR_REPORTS");
      socket.off("ERROR_REPORT_UPDATED");
    };
  }, []);

  const handleRespond = (report: ErrorReport) => {
    setSelectedReport(report);
  };

  const handleSubmitResponse = () => {
    if (!selectedReport) return;

    socket.emit("UPDATE_ERROR_STATUS", {
      reportId: selectedReport._id,
      status: "resolved",
    });

    socket.on("UPDATE_SUCCESS", (response) => {
      alert(response.message);
      setResponse("");
      setSelectedReport(null);
    });

    socket.on("error", (error) => {
      alert(error.message);
    });
  };

  return (
    <div>
      <h1>Quản Lý Báo Lỗi</h1>
      <table border="1" style={{ width: "100%", textAlign: "left" }}>
        <thead>
          <tr>
            <th>Mô tả lỗi</th>
            <th>Ngày tạo</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {errorReports.map((report) => (
            <tr key={report._id}>
              <td>{report.description}</td>
              <td>{new Date(report.createdAt).toLocaleString()}</td>
              <td>{report.status}</td>
              <td>
                <button onClick={() => handleRespond(report)}>Phản hồi</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedReport && (
        <div style={{ marginTop: "20px" }}>
          <h2>Phản hồi báo lỗi</h2>
          <p>
            <strong>Mô tả lỗi:</strong> {selectedReport.description}
          </p>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Nhập phản hồi..."
            style={{ width: "100%", height: "100px", marginBottom: "10px" }}
          />
          <br />
          <button onClick={handleSubmitResponse}>Gửi phản hồi</button>
          <button onClick={() => setSelectedReport(null)} style={{ marginLeft: "10px" }}>
            Hủy
          </button>
        </div>
      )}
    </div>
  );
};

export default QuanLyBaoLoi;