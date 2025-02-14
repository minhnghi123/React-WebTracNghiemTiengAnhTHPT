import React, { useState } from "react";
import { Modal, Button, Input, Select, Form } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import clsx from "clsx";
import { Question, QuestionAPI } from "@/services/teacher/Teacher";

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
    questionType: "6742fb1cd56a2e75dbd817ea", // Mặc định là Yes/No (ID)
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
  };

  const handleQuestionTypeChange = (value: string) => {
    if (value === "fillblank") {
      // Khi chọn điền khuyết, đặt questionType là ID tương ứng và khởi tạo mảng từ khóa
      setQuestion((prev) => ({
        ...prev,
        questionType: "6742fb3bd56a2e75dbd817ec",
        answers: [{ text: "", correctAnswerForBlank: "", isCorrect: true }],
      }));
    } else {
      // Khi chọn Yes/No, đặt questionType là ID tương ứng và reset mảng đáp án
      setQuestion((prev) => ({
        ...prev,
        questionType: "6742fb1cd56a2e75dbd817ea",
        answers: [{ text: "", isCorrect: false }],
      }));
    }
  };

  // Xử lý cho câu hỏi Yes/No
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

  // Xử lý cho câu hỏi Điền khuyết (Fill in the Blank)
  const handleFillBlankChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    const newAnswers = [...question.answers];
    newAnswers[index] = { ...newAnswers[index], correctAnswerForBlank: value };
    setQuestion((prev) => ({ ...prev, answers: newAnswers }));
  };

  const handleAddBlank = () => {
    setQuestion((prev) => ({
      ...prev,
      answers: [
        ...prev.answers,
        { text: "", correctAnswerForBlank: "", isCorrect: true },
      ],
    }));
  };

  const handleRemoveBlank = (index: number) => {
    const newAnswers = question.answers.filter((_, i) => i !== index);
    setQuestion((prev) => ({ ...prev, answers: newAnswers }));
  };

  const handleSaveClick = () => {
    if (!question.content.trim()) {
      return Modal.error({
        title: "Lỗi",
        content: "Nội dung câu hỏi không được để trống",
      });
    }

    if (question.questionType === "6742fb3bd56a2e75dbd817ec") {
      // Kiểm tra các từ khóa điền khuyết
      const emptyBlank = question.answers.some(
        (answer) => !answer.correctAnswerForBlank?.trim()
      );
      if (emptyBlank) {
        return Modal.error({
          title: "Lỗi",
          content: "Tất cả các từ khóa điền khuyết phải được nhập",
        });
      }
    } else {
      // Kiểm tra đáp án cho Yes/No
      const emptyAnswer = question.answers.some(
        (answer) => !answer.text.trim()
      );
      if (emptyAnswer) {
        return Modal.error({
          title: "Lỗi",
          content: "Nội dung đáp án không được để trống",
        });
      }

      const hasCorrect = question.answers.some((answer) => answer.isCorrect);
      if (!hasCorrect) {
        return Modal.error({
          title: "Lỗi",
          content: "Cần phải chọn ít nhất 1 đáp án đúng",
        });
      }
    }

    createQuestion(question);
  };

  const createQuestion = async (q: Question) => {
    try {
      console.log(q);
      const rq = await QuestionAPI.createQuestion(q);
      if (rq?.code === 200) {
        console.log("Thêm câu hỏi thành công", rq);
        setQuestion({
          content: "",
          level: "easy",
          questionType: "6742fb1cd56a2e75dbd817ea",
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
      <Form layout="vertical" className="question-form">
        <Form.Item label="Nội dung">
          <Input.TextArea
            name="content"
            value={question.content}
            onChange={handleChange}
            placeholder="Nhập nội dung câu hỏi"
            required
          />
          {/* Preview nội dung câu hỏi */}
          <div className="question-preview">
            <strong>Preview:</strong>
            <div>{question.content}</div>
          </div>
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
            placeholder=""
            required
          />
        </Form.Item>

        <Form.Item label="Kiến thức">
          <Input
            name="knowledge"
            value={question.knowledge}
            onChange={handleChange}
            placeholder="Nhập kiến thức liên quan"
          />
        </Form.Item>

        <Form.Item label="Loại câu hỏi">
          <Select
            value={
              question.questionType === "6742fb1cd56a2e75dbd817ea"
                ? "yesno"
                : "fillblank"
            }
            onChange={handleQuestionTypeChange}
          >
            <Option value="yesno">Yes/No</Option>
            <Option value="fillblank">Điền khuyết</Option>
          </Select>
        </Form.Item>

        {question.questionType === "6742fb1cd56a2e75dbd817ea" ? (
          <Form.Item label="Đáp án">
            {question.answers.map((answer, index) => (
              <div
                key={index}
                className={clsx(
                  "answer-container",
                  answer.isCorrect
                    ? "answer-correct"
                    : "answer-incorrect"
                )}
              >
                <div className="answer-input">
                  <Input
                    name="text"
                    value={answer.text}
                    onChange={(e) => handleAnswerChange(index, e)}
                    placeholder={`Đáp án ${index + 1}`}
                  />
                </div>
                <div className="answer-actions">
                  <Input
                    type="checkbox"
                    name="isCorrect"
                    checked={answer.isCorrect}
                    onChange={(e) => handleCheckboxChange(index, e)}
                  />
                  <Button
                    type="link"
                    icon={<CloseCircleOutlined />}
                    onClick={() => handleRemoveAnswer(index)}
                    danger
                  />
                </div>
              </div>
            ))}
            <Button type="dashed" onClick={handleAddAnswer}>
              Thêm đáp án
            </Button>
          </Form.Item>
        ) : (
          <Form.Item label="Từ khóa cần điền">
            {question.answers.map((answer, index) => (
              <div key={index} className="blank-container">
                <Input
                  placeholder={`Từ khóa ${index + 1}`}
                  value={answer.correctAnswerForBlank || ""}
                  onChange={(e) => handleFillBlankChange(index, e)}
                />
                <Button type="link" onClick={() => handleRemoveBlank(index)} danger>
                  Xóa
                </Button>
              </div>
            ))}
            <Button type="dashed" onClick={handleAddBlank}>
              Thêm từ khóa
            </Button>
          </Form.Item>
        )}

        <Form.Item label="Dịch">
          <Input
            name="translation"
            value={question.translation}
            onChange={handleChange}
            placeholder="Nhập bản dịch (nếu có)"
          />
        </Form.Item>

        <Form.Item label="Giải thích">
          <Input
            name="explanation"
            value={question.explanation}
            onChange={handleChange}
            placeholder="Nhập giải thích cho câu hỏi"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateQuestionModal;
