import React, { useState, useEffect } from "react";
import { Modal, Button, Input, Form, Select } from "antd";
import { Question, QuestionAPI } from "@/services/teacher/Teacher"; // Adjust the import path as needed

interface UpdateBlankQuestionModalProps {
  visible: boolean;
  handleClose: () => void;
  question2: Question;
}

const UpdateBlankQuestionModal: React.FC<UpdateBlankQuestionModalProps> = ({
  visible,
  handleClose,
  question2: initialQuestion,
}) => {
  const [question, setQuestion] = useState<Question>(initialQuestion);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setQuestion((prev) => ({ ...prev, [name]: value }));
  };
  useEffect(() => {
    setQuestion(initialQuestion);
  }, [initialQuestion]);

  const handleAnswerChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const newAnswers = [...question.answers];
    newAnswers[index] = {
      ...newAnswers[index],
      [name]: value,
      isCorrect: false,
    };
    setQuestion((prev) => ({ ...prev, answers: newAnswers }));
  };

  const handleAddAnswer = () => {
    setQuestion((prev) => ({
      ...prev,
      answers: [
        ...prev.answers,
        { text: "", correctAnswerForBlank: "", isCorrect: false },
      ],
    }));
  };

  const handleRemoveAnswer = (index: number) => {
    const newAnswers = question.answers.filter((_, i) => i !== index);
    setQuestion((prev) => ({ ...prev, answers: newAnswers }));
  };
  const UpdateQuestion = async (q: Question) => {
    try {
      if (!q._id) return;
      const rq = await QuestionAPI.UpdateQuestion(q, q._id);
      console.log(rq);
      if (rq?.code === 200) {
        alert("Sửa câu hỏi thành công");
        handleClose();
      }
    } catch (error: any) {
      console.log(error);
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  };
  const handleSaveClick = async () => {
    UpdateQuestion(question);
  };

  return (
    <Modal
      title="Update Question"
      visible={visible}
      onCancel={handleClose}
      onOk={handleSaveClick}
      okText="Save"
      cancelText="Cancel"
      width={800}
    >
      <Form layout="vertical">
        <Form.Item label="Content">
          <Input.TextArea
            name="content"
            value={question.content}
            onChange={(e) =>
              setQuestion({ ...question, content: e.target.value })
            }
          />
        </Form.Item>
        <Form.Item label="Level">
          <Select
            value={question.level}
            onChange={(value) => setQuestion({ ...question, level: value })}
          >
            <Select.Option value="easy">Easy</Select.Option>
            <Select.Option value="medium">Medium</Select.Option>
            <Select.Option value="hard">Hard</Select.Option>
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
        <Form.Item label="Answers">
          {question.answers.map((answer, index) => (
            <div key={index} className="mb-2">
              <Input
                name="correctAnswerForBlank"
                value={answer.correctAnswerForBlank}
                onChange={(e) => handleAnswerChange(index, e)}
                placeholder={`Answer ${index + 1}`}
                style={{ marginRight: "8px" }}
              />
              <Button
                type="link"
                onClick={() => handleRemoveAnswer(index)}
                style={{ color: "red" }}
              >
                Xóa
              </Button>
            </div>
          ))}
          <Button type="dashed" onClick={handleAddAnswer}>
            Thêm đáp án
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

export default UpdateBlankQuestionModal;
