import React, { useState, useEffect } from "react";
import { Question, QuestionAPI } from "@/services/teacher/Teacher";
import {
  ExamListeningQuestionAPI,
  ExamDataRecieve,
} from "@/services/teacher/ListeningQuestion";
import { Form, InputNumber, Modal, Button, Table, Tag, Tabs, Card } from "antd";
import {
  PlusOutlined,
  MinusOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import QuestionComponent from "@/pages/giaovien/QuanLyCauHoi/Question";
import clsx from "clsx";
import CreateExamModal from "../CreateExam";

export const CreateExamQuestion = () => {
  const [data, setData] = useState<Question[]>([]);
  const [otherQuestions, setOtherQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [listeningExams, setListeningExams] = useState<ExamDataRecieve[]>([]);
  const [selectedListeningExams, setSelectedListeningExams] = useState<
    ExamDataRecieve[]
  >([]);
  const [total, setTotal] = useState<number>(1);
  const [easyLimit, setEasyLimit] = useState<number>(0);
  // const [mediumLimit, setMediumLimit] = useState<number>(0);
  const [hardLimit, setHardLimit] = useState<number>(0);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openInfoModal, setOpenInfoModal] = useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [openModalCreate, setOpenModalCreate] = useState<boolean>(false);

  const getAllQuestions = async (page: number) => {
    try {
      const rq = await QuestionAPI.getAllQuestionsTotal(page);
      if (rq?.code === 200) {
        setTotal(rq?.totalPage);
        setData((prev) => {
          const newQuestions = [...prev, ...rq?.questions];
          const uniqueQuestions = newQuestions.filter(
            (question, index, self) =>
              index === self.findIndex((q) => q._id === question._id)
          );
          return uniqueQuestions;
        });
      }
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  };

  const getAllListeningExams = async () => {
    try {
      const response = await ExamListeningQuestionAPI.getAllListeningExams();
      if (response?.data) {
        setListeningExams(response?.data);
      }
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.message);
      }
    }
  };

  useEffect(() => {
    setData([]);
    getAllQuestions(1);
    getAllListeningExams();
  }, []);

  useEffect(() => {
    for (let i = 2; i <= total; i++) {
      getAllQuestions(i);
    }
  }, [total]);

  useEffect(() => {
    setOtherQuestions(data);
  }, [data]);

  const shuffleArray = (array: Question[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const handleOk = () => {
    const easyQuestions = shuffleArray(
      otherQuestions.filter((q) => q.level === "easy")
    ).slice(0, easyLimit);

    const hardQuestions = shuffleArray(
      otherQuestions.filter((q) => q.level === "hard")
    ).slice(0, hardLimit);

    setSelectedQuestions([
      ...selectedQuestions,
      ...easyQuestions,
      ...hardQuestions,
    ]);

    setOtherQuestions((prev) =>
      prev.filter(
        (q) => !easyQuestions.includes(q) && !hardQuestions.includes(q)
      )
    );

    setOpenModal(false);
  };

  const handleCancel = () => {
    setOpenModal(false);
  };

  const moveQuestion = (
    question: Question,
    from: Question[],
    to: Question[],
    setFrom: React.Dispatch<React.SetStateAction<Question[]>>,
    setTo: React.Dispatch<React.SetStateAction<Question[]>>
  ) => {
    setFrom(from.filter((q) => q._id !== question._id));
    setTo([...to, question]);
  };

  const moveListeningExam = (
    exam: ExamDataRecieve,
    from: ExamDataRecieve[],
    to: ExamDataRecieve[],
    setFrom: React.Dispatch<React.SetStateAction<ExamDataRecieve[]>>,
    setTo: React.Dispatch<React.SetStateAction<ExamDataRecieve[]>>
  ) => {
    setFrom(from.filter((e) => e._id !== exam._id));
    setTo([...to, exam]);
  };

  const handleInfoClick = (question: Question) => {
    setSelectedQuestion(question);
    setOpenInfoModal(true);
  };

  const columns = [
    {
      title: "Nội dung",
      dataIndex: "content",
      key: "content",
      width: "60%",
      render: (text: string) =>
        text.length > 500 ? `${text.substring(0, 500)}...` : text,
    },
    {
      title: "Mức độ",
      dataIndex: "level",
      key: "level",
      render: (text: string) => (
        <Tag
          color={clsx(
            text === "easy" && "green",
            text === "medium" && "yellow",
            text === "hard" && "red"
          )}
          className="type-question"
        >
          {text}
        </Tag>
      ),
    },
    {
      title: "Chủ đề",
      dataIndex: "subject",
      key: "subject",
      render: (text: string) => (
        <Tag color="blue" className="type-question">
          {text}
        </Tag>
      ),
    },
    {
      title: "Kiến thức",
      dataIndex: "knowledge",
      key: "knowledge",
      render: (text: string) => (
        <Tag color="cyan" className="type-question">
          {text}
        </Tag>
      ),
    },
    {
      title: "",
      key: "action",
      render: (record: Question) => (
        <span className="gap-2">
          <Button
            onClick={() => {
              if (selectedQuestions.includes(record)) {
                moveQuestion(
                  record,
                  selectedQuestions,
                  otherQuestions,
                  setSelectedQuestions,
                  setOtherQuestions
                );
              } else {
                moveQuestion(
                  record,
                  otherQuestions,
                  selectedQuestions,
                  setOtherQuestions,
                  setSelectedQuestions
                );
              }
            }}
            icon={
              selectedQuestions.includes(record) ? (
                <MinusOutlined style={{ color: "red" }} />
              ) : (
                <PlusOutlined style={{ color: "green" }} />
              )
            }
          />
          <Button
            icon={<InfoCircleOutlined />}
            onClick={() => handleInfoClick(record)}
          ></Button>
        </span>
      ),
    },
  ];

  const listeningExamColumns = [
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
      title: "Trạng thái",
      dataIndex: "isPublished",
      key: "isPublished",
      render: (isPublished: boolean) =>
        isPublished ? "Đã phát hành" : "Chưa phát hành",
    },
    {
      title: "",
      key: "action",
      render: (record: ExamDataRecieve) => (
        <span className="gap-2">
          <Button
            onClick={() => {
              if (selectedListeningExams.includes(record)) {
                moveListeningExam(
                  record,
                  selectedListeningExams,
                  listeningExams,
                  setSelectedListeningExams,
                  setListeningExams
                );
              } else {
                moveListeningExam(
                  record,
                  listeningExams,
                  selectedListeningExams,
                  setListeningExams,
                  setSelectedListeningExams
                );
              }
            }}
            icon={
              selectedListeningExams.includes(record) ? (
                <MinusOutlined style={{ color: "red" }} />
              ) : (
                <PlusOutlined style={{ color: "green" }} />
              )
            }
          />
        </span>
      ),
    },
  ];

  return (
    <div>
      {/* Card chứa các nút hành động */}
      <Card className="m-3" bordered={false}>
        <Button
          type="primary"
          className="m-2"
          onClick={() => setOpenModal(true)}
        >
          Thêm câu hỏi từ ngân hàng câu hỏi
        </Button>
        <Button
          type="default"
          className="m-2"
          onClick={() => {
            if (
              selectedQuestions.length > 0 ||
              selectedListeningExams.length > 0
            ) {
              setOpenModalCreate(true);
            } else {
              alert("Chưa có câu hỏi hoặc Đề Thi nghe nào");
            }
          }}
        >
          Tạo đề thi
        </Button>
      </Card>

      {/* Tabs để phân chia nội dung */}
      <Tabs defaultActiveKey="1" type="card">
        <Tabs.TabPane tab="Danh sách câu hỏi" key="1">
          <h3>Danh sách câu hỏi hiện có</h3>
          <Table
            columns={columns}
            dataSource={selectedQuestions}
            rowKey="_id"
            pagination={{ pageSize: 5 }}
          />
          <h3>Danh sách câu hỏi còn lại</h3>
          <Table
            columns={columns}
            dataSource={otherQuestions}
            rowKey="_id"
            pagination={{ pageSize: 5 }}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Phần thi nghe" key="2">
          <h3>Phần thi nghe đã chọn</h3>
          <Table
            columns={listeningExamColumns}
            dataSource={selectedListeningExams}
            rowKey="_id"
            pagination={{ pageSize: 5 }}
          />
          <h3>Phần thi nghe còn lại</h3>
          <Table
            columns={listeningExamColumns}
            dataSource={listeningExams}
            rowKey="_id"
            pagination={{ pageSize: 5 }}
          />
        </Tabs.TabPane>
      </Tabs>

      {/* Modal thêm câu hỏi tự động */}
      <Modal
        open={openModal}
        title="Thêm câu hỏi tự động"
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Lưu"
        cancelText="Đóng"
      >
        <Form layout="vertical">
          <Form.Item
            label={`Số câu dễ (còn lại: ${
              otherQuestions.filter((q) => q.level === "easy").length
            })`}
          >
            <InputNumber
              min={0}
              max={otherQuestions.filter((q) => q.level === "easy").length}
              value={easyLimit}
              onChange={(value) => {
                if (value !== null) {
                  setEasyLimit(value);
                }
              }}
            />
          </Form.Item>

          <Form.Item
            label={`Số câu khó (còn lại: ${
              otherQuestions.filter((q) => q.level === "hard").length
            })`}
          >
            <InputNumber
              min={0}
              max={otherQuestions.filter((q) => q.level === "hard").length}
              value={hardLimit}
              onChange={(value) => {
                if (value !== null) {
                  setHardLimit(value);
                }
              }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chi tiết câu hỏi */}
      <Modal
        open={openInfoModal}
        title="Chi tiết câu hỏi"
        onCancel={() => setOpenInfoModal(false)}
        footer={null}
      >
        {selectedQuestion && (
          <QuestionComponent
            questionType={selectedQuestion.questionType || ""}
            onUpdateSuccess={() => {}}
            question={selectedQuestion}
          />
        )}
      </Modal>

      {/* Modal tạo đề thi */}
      <CreateExamModal
        visible={openModalCreate}
        handleClose={() => setOpenModalCreate(false)}
        onCreateSuccess={() => {
          setOpenModalCreate(false);
        }}
        dataQuestion={selectedQuestions}
        listeningExams={selectedListeningExams}
      />
    </div>
  );
};
