import { useState, useEffect } from "react";
import { Button, Table, Tag, Modal } from "antd";
import { ExamListeningQuestionAPI, ListeningExamData, listenQuestionAPI, Question } from "@/services/teacher/ListeningQuestion";
import CreateExamModal from "./DeThiNghe/CreateExam";
import { useAuthContext } from "@/contexts/AuthProvider";
import DetailListeningExam from "./DeThiNghe/deltailExam";

export const ListListeningExam = () => {
  const [exams, setExams] = useState<ListeningExamData[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [dataQuestion, setDataQuestion] = useState<Question[]>([]);
  const { user } = useAuthContext();
  const [selectedExam, setSelectedExam] = useState<ListeningExamData | null>(null);

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

  // const handleUpdateSuccess = () => {
  //   getAllExams();
  // };

  const handleDetail = (record: ListeningExamData) => {
    setSelectedExam(record);
  };

  const handleDeleteExam = (record: ListeningExamData) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa bài kiểm tra này không?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const response = await ExamListeningQuestionAPI.deleteListeningExam(record.id!,user?._id || "");
          if (response) {
            Modal.success({
              title: "Thành công",
              content: "Bài kiểm tra đã được xóa thành công.",
            });
            getAllExams();
          }
        } catch (error: any) {
          Modal.error({
            title: "Lỗi",
            content: error.response?.data?.message || "Có lỗi xảy ra khi xóa bài kiểm tra.",
          });
        }
      },
    });
  };

  if (selectedExam) {
    return (
      <div className="container mx-auto p-4">
        <DetailListeningExam
          data={selectedExam}
          dataQuestion={dataQuestion}
          onBack={() => setSelectedExam(null)}
        />
      </div>
    );
  }

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
      title: "Thời gian",
      dataIndex: "duration",
      key: "duration",
      render: (duration: number) => `${duration} phút`,
    },
    {
      title: "Thời gian bắt đầu",
      dataIndex: "startTime",
      key: "startTime",
      render: (startTime: string) =>
        startTime
          ? new Intl.DateTimeFormat("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).format(new Date(startTime)) +
            ` (${new Date(startTime).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })})`
          : "N/A",
    },
    {
      title: "Thời gian kết thúc",
      dataIndex: "endTime",
      key: "endTime",
      render: (endTime: string) =>
        endTime
          ? new Intl.DateTimeFormat("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).format(new Date(endTime)) +
            ` (${new Date(endTime).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })})`
          : "N/A",
    },
    {
      title: "Trạng thái",
      dataIndex: "isPublic",
      key: "isPublic",
      render: (isPublic: boolean) =>
        isPublic ? (
          <Tag color="green">Công khai</Tag>
        ) : (
          <Tag color="volcano">Riêng tư</Tag>
        ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: ListeningExamData) => (
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
