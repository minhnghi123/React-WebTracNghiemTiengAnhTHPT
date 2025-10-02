import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  Table,
  Button,
  Modal,
  Input,
  Space,
  Typography,
  message,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import QuestionComponent from "../QuanLyCauHoi/Question";
import { Question } from "@/services/teacher/Teacher";
import { Exam } from "@/types/interface";
import { useAuthContext } from "@/contexts/AuthProvider";

const { TextArea } = Input;
const { Title, Text } = Typography;

const socket = io(import.meta.env.VITE_API_URL_PROD);

export interface ErrorReport {
  _id: string;
  description: string;
  questionId: Question;
  examId: Exam;
  userId: string;
  createdAt: string;
  status: string;
  additionalInfo?: string;
}

const QuanLyBaoLoi: React.FC = () => {
  const [, setErrorReports] = useState<ErrorReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<ErrorReport[]>([]); // Danh sách đã lọc
  const [response, setResponse] = useState("");
  const [selectedReport, setSelectedReport] = useState<ErrorReport | null>(
    null
  );
  const [questionModalVisible, setQuestionModalVisible] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<Question>(
    {} as Question
  );

  const { user } = useAuthContext();
  useEffect(() => {
    // Yêu cầu danh sách báo lỗi khi component được render
    socket.emit("GET_ERROR_REPORTS");

    socket.on("ERROR_REPORTS", (reports: ErrorReport[]) => {
      setErrorReports(reports);

      // Lọc danh sách báo lỗi dựa trên adminId
      const filtered = reports.filter((report) => {
        const examOwner = report.examId?.createdBy;
        return examOwner === user?._id;
      });

      setFilteredReports(filtered); // Cập nhật danh sách đã lọc
    });

    socket.on("ERROR_REPORT_UPDATED", (updatedReport: ErrorReport) => {
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

    // Gửi phản hồi của giáo viên
    socket.emit("RESPOND_ERROR", {
      reportId: selectedReport._id,
      additionalInfo: response,
    });

    socket.on("RESPOND_SUCCESS", (res) => {
      message.success(res.message);
      setResponse("");
      setSelectedReport(null);
      socket.off("RESPOND_SUCCESS");
    });

    socket.on("error", (error) => {
      message.error(error.message);
      socket.off("error");
    });
  };

  const handleShowQuestionInfo = (questionId: Question) => {
    setSelectedQuestionId(questionId);
    setQuestionModalVisible(true);
  };

  const columns: ColumnsType<ErrorReport> = [
    {
      title: "Mô tả lỗi",
      dataIndex: "description",
      key: "description",
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => <Text>{new Date(date).toLocaleString()}</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={
            status === "pending"
              ? "yellow"
              : status === "resolved"
              ? "green"
              : "red"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => handleRespond(record)}>
            Phản hồi
          </Button>
          <Button onClick={() => handleShowQuestionInfo(record.questionId)}>
            Xem thông tin câu hỏi
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Quản Lý Báo Lỗi</Title>
      <Table
        dataSource={filteredReports} // Hiển thị danh sách đã lọc
        columns={columns}
        rowKey={(record) => record._id}
        pagination={{ pageSize: 5 }}
      />

      {selectedReport && (
        <Modal
          title="Phản hồi báo lỗi"
          visible={!!selectedReport}
          onOk={handleSubmitResponse}
          onCancel={() => setSelectedReport(null)}
          okText="Gửi phản hồi"
          cancelText="Hủy"
        >
          <p>
            <strong>Mô tả lỗi:</strong> {selectedReport.description}
          </p>
          <TextArea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Nhập phản hồi..."
            rows={4}
          />
        </Modal>
      )}

      <Modal
        title="Thông tin câu hỏi"
        visible={questionModalVisible}
        onOk={() => setQuestionModalVisible(false)}
        onCancel={() => setQuestionModalVisible(false)}
        okText="Đóng"
        width={1200}
      >
        <QuestionComponent
          editable={true}
          question={selectedQuestionId}
          onUpdateSuccess={function (): void {
            throw new Error("Function not implemented.");
          }}
          questionType={""}
        />
      </Modal>
    </div>
  );
};

export default QuanLyBaoLoi;
