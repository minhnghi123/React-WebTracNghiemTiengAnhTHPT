import React, { useEffect, useState } from "react";
import { Modal, Input, Form } from "antd";

import { QuestionType, QuestionTypeAPI } from "@/services/teacher/Teacher";

interface CreateQuestionTypeModalProps {
  visible: boolean;
  handleClose: () => void;
  id: string;
}

export const UpdateQuestionTypeModal: React.FC<
  CreateQuestionTypeModalProps
> = ({ visible, handleClose, id }) => {
  const [question, setQuestion] = useState<QuestionType>({
    name: "",
    description: "",
    deleted: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setQuestion((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = () => {
    if (question.name === "") {
      alert("Vui lòng nhập nội dung câu hỏi");
      return;
    }
    if (question.description === "") {
      alert("Vui lòng nhập mô tả câu hỏi");
      return;
    }

    createQuestion(question);
  };
  useEffect(() => {
    if (visible) {
      QuestionTypeAPI.getQuestionType(id).then((rq) => {
        if (rq?.code === 200) {
          setQuestion(rq.questionType);
        }
      });
    }
  }, [visible]);
  const createQuestion = async (q: QuestionType) => {
    try {
      console.log("13");
      const rq = await QuestionTypeAPI.UpdateQuestionType(q, q._id || "");
      console.log(rq);
      if (rq?.code === 200) {
        setQuestion({
          name: "",
          description: "",
          deleted: false,
        });
        alert("Sửa dạng câu hỏi thành công");
        handleClose();
      }
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  };
  return (
    <Modal
      title="Sửa dạng câu hỏi"
      visible={visible}
      onCancel={handleClose}
      onOk={handleSaveClick}
      okText="Lưu"
      cancelText="Đóng"
      width={800}
    >
      <Form layout="vertical">
        <Form.Item label="Tên dạng câu hỏi">
          <Input.TextArea
            name="name"
            value={question.name}
            onChange={handleChange}
            required
          />
        </Form.Item>
        <Form.Item label="Mô tả">
          <Input.TextArea
            name="description"
            value={question.description}
            onChange={handleChange}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
