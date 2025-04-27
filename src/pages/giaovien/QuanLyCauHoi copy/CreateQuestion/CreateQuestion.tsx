import React, { useState, useEffect } from "react";
import { Modal, Button, Input, Select, Form } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import clsx from "clsx";
import { Question, QuestionAPI, AudioAPI, Audio } from "@/services/teacher/Teacher";
import { CreateAudioModal } from "../../QuanLyFileAudio/FileAudio/CreateDangCauHoiModal";

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
    audio: "",
  });
  const [audioFile] = useState<File | null>(null);
  const [existingAudios, setExistingAudios] = useState<Audio[]>([]);
  const [isCreateAudioModalVisible, setIsCreateAudioModalVisible] = useState(false); // State to manage CreateAudioModal visibility
  const handleAudioCreated = (audioId: string) => {
    const fetchAudios = async () => {
      const response = await AudioAPI.getAllAudio();
      setExistingAudios(response);
    };
    fetchAudios();

    setQuestion((prev) => ({ ...prev, audio: audioId }));
    setIsCreateAudioModalVisible(false);
  };
  
  useEffect(() => {
    const fetchAudios = async () => {
      const response = await AudioAPI.getAllAudio();
      setExistingAudios(response);
    };
    fetchAudios();
  }, []);

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
      setQuestion((prev) => ({
        ...prev,
        questionType: "6742fb3bd56a2e75dbd817ec",
        answers: [{ text: "", correctAnswerForBlank: "", isCorrect: true }],
      }));
    } else {
      setQuestion((prev) => ({
        ...prev,
        questionType: "6742fb1cd56a2e75dbd817ea",
        answers: [{ text: "", isCorrect: false }],
      }));
    }
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

  // const handleAudioChange = (info: any) => {
  //   if (info.file.status === "done") {
  //     setAudioFile(info.file.originFileObj);
  //   }
  // };

  const handleSaveClick = async () => {
    if (!question.content.trim()) {
      return Modal.error({
        title: "Lỗi",
        content: "Nội dung câu hỏi không được để trống",
      });
    }

    if (question.questionType === "6742fb3bd56a2e75dbd817ec") {
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
      const emptyAnswer = question.answers.some(
        (answer) => !answer.text?.trim()
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

    if (audioFile) {
      const formData = new FormData();
      formData.append("filePath", audioFile);
      formData.append("description", question.content);
      const response = await AudioAPI.createAudio(formData as unknown as Audio);
      if (response.success) {
        question.audio = response.data._id;
      }
    }

    createQuestion(question);
  };

  const createQuestion = async (q: Question) => {
    try {
      const rq = await QuestionAPI.createQuestion(q);
      console.log(rq);
      if (rq?.code === 200) {
        setQuestion({
          content: "",
          level: "easy",
          questionType: "6742fb1cd56a2e75dbd817ea",
          answers: [{ text: "", isCorrect: false }],
          subject: "",
          knowledge: "",
          translation: "",
          explanation: "",
          audio: "",
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
    <>
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

          <Form.Item label="Cập nhật file nghe (nếu có)">
          <Button type="dashed" onClick={() => setIsCreateAudioModalVisible(true)}>
              Tạo file nghe mới
            </Button>
            <Select
              placeholder="Hoặc chọn audio có sẵn"
              onChange={(value) => setQuestion((prev) => ({ ...prev, audio: value }))}
              style={{ width: "100%", marginTop: "10px" }}
            >
              {existingAudios.map((audio) => (
                <Option key={audio._id} value={audio._id}>
                  {audio.description}
                </Option>
              ))}
            </Select>
           
          </Form.Item>
        </Form>
      </Modal>

      <CreateAudioModal
        visible={isCreateAudioModalVisible}
        handleClose={() => setIsCreateAudioModalVisible(false)}
        onAudioCreated={handleAudioCreated} 
      />
    </>
  );
};

export default CreateQuestionModal;
