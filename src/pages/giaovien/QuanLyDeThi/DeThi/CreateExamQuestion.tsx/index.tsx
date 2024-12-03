import React, { useState, useEffect } from "react";
import { Question, QuestionAPI } from "@/services/teacher/Teacher";
import { Form, InputNumber, Modal, Button, Table, Tag } from "antd";
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
  const [total, setTotal] = useState<number>(1);
  const [easyLimit, setEasyLimit] = useState<number>(0);
  const [mediumLimit, setMediumLimit] = useState<number>(0);
  const [hardLimit, setHardLimit] = useState<number>(0);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openInfoModal, setOpenInfoModal] = useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [openModalCreate, setOpenModalCreate] = useState<boolean>(false);

  const [total2, setTotal2] = useState<number>(1);
  const getAllQuestions = async (page: number) => {
    try {
      const rq = await QuestionAPI.getAllQuestions(page);
      if (rq?.code === 200) {
        setTotal(rq?.totalPage);
        setData((prev) => [...prev, ...rq?.questions]);
      }
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  };
  const getAllQuestions2 = async (page: number) => {
    try {
      const rq = await QuestionAPI.getAllQuestionsBlank(page);
      if (rq?.code === 200) {
        setTotal2(rq?.totalPage);
        setData((prev) => [...prev, ...rq?.questions]);
      }
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  };
  useEffect(() => {
    setData([]);
    getAllQuestions(1);
    getAllQuestions2(1);
  }, []);

  useEffect(() => {
    for (let i = 2; i <= total; i++) {
      getAllQuestions(i);
    }
  }, [total]);
  useEffect(() => {
    for (let i = 2; i <= total2; i++) {
      getAllQuestions2(i);
    }
  }, [total2]);

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
    const mediumQuestions = shuffleArray(
      otherQuestions.filter((q) => q.level === "medium")
    ).slice(0, mediumLimit);
    const hardQuestions = shuffleArray(
      otherQuestions.filter((q) => q.level === "hard")
    ).slice(0, hardLimit);

    setSelectedQuestions([
      ...selectedQuestions,
      ...easyQuestions,
      ...mediumQuestions,
      ...hardQuestions,
    ]);

    setOtherQuestions((prev) =>
      prev.filter(
        (q) =>
          !easyQuestions.includes(q) &&
          !mediumQuestions.includes(q) &&
          !hardQuestions.includes(q)
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
      title: "Action",
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

  return (
    <div>
      <div>
        <Button
          type="default"
          className="m-3 "
          onClick={() => setOpenModal(true)}
        >
          Thêm câu hỏi từ ngân hàng câu hỏi của bạn
        </Button>
        <Button
          type="default"
          onClick={() => {
            if (selectedQuestions.length > 0) {
              setOpenModalCreate(true);
            } else alert("chưa có câu hỏi nào");
          }}
        >
          Tạo đề thi
        </Button>
      </div>
      <h3>Danh sách câu hỏi hiện có</h3>
      <Table columns={columns} dataSource={selectedQuestions} rowKey="_id" />
      <h3>Danh sách câu hỏi còn lại</h3>
      <Table columns={columns} dataSource={otherQuestions} rowKey="_id" />
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
            label={`Số câu trung bình (còn lại: ${
              otherQuestions.filter((q) => q.level === "medium").length
            })`}
          >
            <InputNumber
              min={0}
              max={otherQuestions.filter((q) => q.level === "medium").length}
              value={mediumLimit}
              onChange={(value) => {
                if (value !== null) {
                  setMediumLimit(value);
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
      <CreateExamModal
        visible={openModalCreate}
        handleClose={() => setOpenModalCreate(false)}
        onCreateSuccess={() => {
          setOpenModalCreate(false);
        }}
        dataQuestion={selectedQuestions}
      />
    </div>
  );
};
