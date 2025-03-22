import { useState, useEffect } from "react";
import { Button, Table, Tag, Modal } from "antd";
import { ExamListeningQuestionAPI, listenQuestionAPI, ExamDataRecieve, Question } from "@/services/teacher/ListeningQuestion";
import CreateExamModal from "./DeThiNghe/CreateExam";
import { useAuthContext } from "@/contexts/AuthProvider";
import DetailListeningExam from "./DeThiNghe/deltailExam";

export const ListListeningExam = () => {
  const [exams, setExams] = useState<ExamDataRecieve[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [dataQuestion, setDataQuestion] = useState<Question[]>([]);
  const { user } = useAuthContext();
  // State để hiển thị chi tiết đề thi
  const [selectedExam, setSelectedExam] = useState<ExamDataRecieve | null>(null);

  const getAllExams = async () => {
    try {
      const rq = await ExamListeningQuestionAPI.getListeningExamMySelf();
      if (rq.data) {
        const examList = rq.data.map((exam: any) => ({
          ...exam,
          id: exam._id,
        }));
        setExams(examList);
      } else {
        setExams([]);
      }
    } catch (error: any) {
      console.error("Error fetching exams:", error);
    }
  };

  const getAllQuestions = async () => {
    try {
      const rq = await listenQuestionAPI.getAllListeningQuestions();
      if (rq.data) {
        setDataQuestion(rq.data);
      } else {
        setDataQuestion([]);
      }
    } catch (error: any) {
      console.error("Error fetching questions:", error);
    }
  };

  useEffect(() => {
    getAllExams();
    getAllQuestions();
  }, []);

  const handleUpdateSuccess = () => {
    getAllExams();
  };

  // Khi bấm "Xem chi tiết", lưu đề thi được chọn vào state selectedExam
  const handleDetail = (record: ExamDataRecieve) => {
    setSelectedExam(record);
  };

  // Hàm xóa đề thi với modal xác nhận
  const handleDeleteExam = (record: ExamDataRecieve) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa đề thi này không?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const response = await ExamListeningQuestionAPI.deleteListeningExam(record._id!);
          if (response) {
            Modal.success({
              title: "Thành công",
              content: "Đề thi đã được xóa thành công.",
            });
            getAllExams();
          }
        } catch (error: any) {
          Modal.error({
            title: "Lỗi",
            content: error.response?.data?.message || "Có lỗi xảy ra khi xóa đề thi.",
          });
        }
      },
    });
  };

  // Nếu có selectedExam, hiển thị DetailListeningExam với nút Back
  if (selectedExam) {
    return (
      <div className="container mx-auto p-4">
        <DetailListeningExam
          data={selectedExam}
          dataQUestion={dataQuestion}
          onBack={() => setSelectedExam(null)}
        />
      </div>
    );
  }

  // Các cột của bảng
  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Độ khó",
      dataIndex: "difficulty",
      key: "difficulty",
      render: (difficulty: string) => (
        <Tag
          color={
            difficulty === "easy"
              ? "green"
              : difficulty === "medium"
              ? "yellow"
              : "red"
          }
        >
          {difficulty}
        </Tag>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "duration",
      key: "duration",
      render: (duration: number) => `${duration} phút`,
    },
    {
      title: "Điểm qua",
      dataIndex: "passingScore",
      key: "passingScore",
    },
    {
      title: "Trạng thái",
      dataIndex: "isPublished",
      key: "isPublished",
      render: (isPublished: boolean) =>
        isPublished ? "Đã phát hành" : "Chưa phát hành",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: ExamDataRecieve) => (
        <>
          <Button type="link" onClick={() => handleDetail(record)}>
            Xem chi tiết
          </Button>
          <Button type="link" danger onClick={() => handleDeleteExam(record)}>
            Xóa
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Danh sách bài kiểm tra nghe</h1>
        <Button type="primary" onClick={() => setShowModal(true)}>
          Thêm bài kiểm tra
        </Button>
      </div>
      <Table
        dataSource={exams}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
      <CreateExamModal
        visible={showModal}
        handleClose={() => {
          setShowModal(false);
          getAllExams();
        }}
        onCreateSuccess={getAllExams}
        teacherId={user?._id || ""}
      />
    </div>
  );
};

export default ListListeningExam;
