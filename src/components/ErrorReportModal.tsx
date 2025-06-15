import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Modal } from "antd";
import { useAuthContext } from "@/contexts/AuthProvider";

const socket = io("https://react-webtracnghiemtienganhthpt-ke5j.onrender.com"); // Kết nối đến server WebSocket

socket.on("connect", () => {
  console.log(`Connected to server with ID: ${socket.id}`);
});

interface ErrorReportModalProps {
  questionId: string;
  examId: string;
  userId: string;
  onClose: () => void; // Hàm đóng modal
}

const ErrorReportModal: React.FC<ErrorReportModalProps> = ({
  questionId,
  examId,
  userId,
  onClose,
}) => {
  const { user } = useAuthContext();
  const [description, setDescription] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  useEffect(() => {
    return () => {
      socket.off("TEACHER_RESPONSE_SUCCESS");
    };
  }, [userId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errorData = {
      description,
      questionId,
      examId,
      userId,
      additionalInfo,
    };

    // Gửi sự kiện REPORT_ERROR đến server
    socket.emit("REPORT_ERROR", errorData);

    // Lắng nghe phản hồi từ server
    socket.on("REPORT_SUCCESS", (response) => {
      alert(response.message); // Hiển thị thông báo thành công
      onClose(); // Đóng modal
    });

    socket.on("error", (error) => {
      alert(error.message); // Hiển thị thông báo lỗi
    });
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Báo lỗi</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label>Mô tả lỗi:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              style={styles.textarea}
            />
          </div>
          {/* <div style={styles.formGroup}>
            <label>Thông tin bổ sung:</label>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              style={styles.textarea}
            />
          </div> */}
          <button type="submit" style={styles.button}>
            Gửi báo lỗi
          </button>
          <button type="button" onClick={onClose} style={styles.closeButton}>
            Đóng
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed" as "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    width: "400px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  },
  formGroup: {
    marginBottom: "15px",
  },
  textarea: {
    width: "100%",
    height: "80px",
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginRight: "10px",
  },
  closeButton: {
    padding: "10px 20px",
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default ErrorReportModal;
