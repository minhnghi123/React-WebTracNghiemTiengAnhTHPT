import React, { useState } from "react";
import { Modal, Button, Input, Select, Form } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import clsx from "clsx";
import { Question, Teacher } from "@/services/teacher";

const { Option } = Select;

interface CreateQuestionModalProps {
  visible: boolean;
  handleClose: () => void;
}

const CreateQuestionModal: React.FC<CreateQuestionModalProps> = ({
  visible,
  handleClose,
}) => {
  const [question, setQuestion] = useState<Question>({
    content: "",
    level: "easy",
    answers: [{ text: "", isCorrect: false }],
    subject: "",
    knowledge: "",
    translation: "",
    explanation: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setQuestion((prev) => ({ ...prev, [name]: value }));
  };

  const handleLevelChange = (value: "easy" | "medium" | "hard") => {
    setQuestion((prev) => ({ ...prev, level: value }));
    console.log(question);
  };

  const handleAnswerChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const newAnswers = [...question.answers];
    newAnswers[index] = { ...newAnswers[index], [name]: value };
    setQuestion((prev) => ({ ...prev, answers: newAnswers }));
  };

  const handleCheckboxChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newAnswers = [...question.answers];
    newAnswers[index] = { ...newAnswers[index], isCorrect: e.target.checked };
    setQuestion((prev) => ({ ...prev, answers: newAnswers }));
  };

  const handleAddAnswer = () => {
    setQuestion((prev) => ({
      ...prev,
      answers: [...prev.answers, { text: "", isCorrect: false }],
    }));
  };

  const handleRemoveAnswer = (index: number) => {
    const newAnswers = question.answers.filter((_, i) => i !== index);
    setQuestion((prev) => ({ ...prev, answers: newAnswers }));
  };

  const handleSaveClick = () => {
    console.log(question);
    if (!question.content.trim()) {
      return Modal.error({
        title: "Lỗi",
        content: "Nội dung câu hỏi không được để trống",
      });
    }

    const emptyAnswer = question.answers.some((answer) => !answer.text.trim());
    if (emptyAnswer) {
      return Modal.error({
        title: "Lỗi",
        content: "Nội dung đáp án không được để trống",
      });
    }

    const check = question.answers.some((answer) => answer.isCorrect);
    if (!check) {
      return Modal.error({
        title: "Lỗi",
        content: "Cần phải chọn ít nhất 1 đáp án đúng",
      });
    } else createQuestion(question);
  };
  const createQuestion = async (q: Question) => {
    try {
      const rq = await Teacher.creteQuestion(q);
      if (rq?.code === 200) {
        console.log("Thêm câu hỏi thành công");
        console.log(rq);
        setQuestion({
          content: "",
          level: "easy",
          answers: [{ text: "", isCorrect: false }],
          subject: "",
          knowledge: "",
          translation: "",
          explanation: "",
        });
        alert("Thêm câu hỏi thành công");
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
      title="Thêm câu hỏi"
      visible={visible}
      onCancel={handleClose}
      onOk={handleSaveClick}
      okText="Lưu"
      cancelText="Đóng"
      width={800}
    >
      <Form layout="vertical">
        <Form.Item label="Nội dung">
          <Input.TextArea
            name="content"
            value={question.content}
            onChange={handleChange}
            required
          />
        </Form.Item>
        <Form.Item label="Mức độ">
          <Select value={question.level} onChange={handleLevelChange}>
            <Option value="easy">Easy</Option>
            <Option value="medium">Medium</Option>
            <Option value="hard">Hard</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Chủ đề">
          <Input
            name="subject"
            value={question.subject}
            onChange={handleChange}
            required
          />
        </Form.Item>
        <Form.Item label="Kiến thức">
          <Input
            name="knowledge"
            value={question.knowledge}
            onChange={handleChange}
          />
        </Form.Item>

        <Form.Item label="Đáp án">
          {question.answers.map((answer, index) => (
            <div
              key={index}
              className={clsx(
                answer.isCorrect
                  ? "border border-success"
                  : "border border-warning",
                "mb-2 flex items-center"
              )}
            >
              {answer.isCorrect ? (
                <span style={{ marginLeft: "8px", color: "green" }}>
                  Đáp án chính xác{" "}
                </span>
              ) : null}
              <div className="d-flex">
                <Input
                  name="text"
                  value={answer.text}
                  onChange={(e) => handleAnswerChange(index, e)}
                  placeholder={`Answer ${index + 1}`}
                  style={{ marginRight: "8px", flexGrow: 1 }}
                  className="flex-1"
                />
                <div className=" align-items-center d-flex flex-column justify-content-center">
                  <Input
                    type="checkbox"
                    name="isCorrect"
                    checked={answer.isCorrect}
                    onChange={(e) => handleCheckboxChange(index, e)}
                    style={{ height: "16px" }}
                  />

                  <Button
                    type="link"
                    icon={<CloseCircleOutlined />}
                    onClick={() => handleRemoveAnswer(index)}
                    style={{ color: "#FF0000" }}
                  />
                </div>
              </div>
            </div>
          ))}
          <Button type="dashed" onClick={handleAddAnswer}>
            Thêm câu trả lời
          </Button>
        </Form.Item>
        <Form.Item label="Dịch">
          <Input
            name="translation"
            value={question.translation}
            onChange={handleChange}
            style={{ width: "95% " }}
          />
        </Form.Item>
        <Form.Item label="Giải thích">
          <Input
            name="explanation"
            value={question.explanation}
            onChange={handleChange}
            style={{ width: "95% " }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateQuestionModal;
