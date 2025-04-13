import React, { useState, useEffect } from "react";
import { Button, Card, Tag, Row, Col, Input } from "antd";
import { ListeningExamData, Question } from "@/services/teacher/ListeningQuestion";
import ListeningQuestionComponent from "@/pages/giaovien/QuanLyCauHoi/ListeningQuestion";
import UpdateExamModal from "./UpdateExam/UpdateExam";

interface DetailListeningExamProps {
  data: ListeningExamData;
  onBack: () => void;
  dataQuestion: Question[];
}
const DetailListeningExam: React.FC<DetailListeningExamProps> = ({
  data,
  onBack,
  dataQuestion,
}) => {
  const [exam, setExam] = useState<ListeningExamData>(data);
  const [openModal, setOpenModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [otherQuestions, setOtherQuestions] = useState<Question[]>([]);
  useEffect(() => {
    setExam(data);
    setSelectedQuestions(data.questions as unknown as Question[]);
    setOtherQuestions(dataQuestion.filter((q) => !data.questions.some((eq) => eq._id === q._id)));
  }, [data, dataQuestion]);

  const handleAddQuestion = (q: Question) => {
    setSelectedQuestions((prev) => [...prev, q]);
    setOtherQuestions((prev) => prev.filter((item) => item._id !== q._id));
  };

  const handleRemoveQuestion = (q: Question) => {
    setSelectedQuestions((prev) => prev.filter((item) => item._id !== q._id));
    setOtherQuestions((prev) => [...prev, q]);
  };

  return (
    <div className="container mx-auto p-4">
      <Button type="default" onClick={onBack} className="mb-4">
        Quay lại
      </Button>
      <Button type="primary" onClick={() => setOpenModal(true)} className="mb-4">
        Lưu bài thi
      </Button>
      <Card title={exam.title} className="shadow rounded mb-4">
        <p>
          <strong>Mô tả:</strong> {exam.description}
        </p>
        <p>
          <strong>Thời gian:</strong> {exam.duration} phút
        </p>
        <p>
          <strong>Trạng thái:</strong>{" "}
          {exam.isPublic ? (
            <Tag color="green">Công khai</Tag>
          ) : (
            <Tag color="volcano">Riêng tư</Tag>
          )}
        </p>
        <div>
          <strong>Audio: </strong>
          {exam.audio ? (
            <audio controls src={exam.audio?.filePath} />
          ) : (
            <span>Không có audio</span>
          )}
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Cột bên trái: Câu hỏi trong đề thi */}
        <Col xs={24} md={12}>
        <div style={{ height: "100px"}}>

          <h2 className="text-2xl font-semibold mb-2">Câu hỏi trong đề thi</h2>
          </div>
          <div style={{ maxHeight: "500px", overflowY: "auto" }}>
            {selectedQuestions.length > 0 ? (
              <div className="space-y-4">
                {selectedQuestions.map((question, index) => (
                  <Card
                    key={question._id}
                    title={`Câu ${index + 1}: ${
                      question.questionText.length > 50
                        ? question.questionText.slice(0, 50) + "..."
                        : question.questionText
                    }`}
                    extra={
                      <Button
                        type="link"
                        danger
                        onClick={() => handleRemoveQuestion(question)}
                      >
                        Gỡ
                      </Button>
                    }
                  >
                    <ListeningQuestionComponent
                      question={{
                        ...question,
                        options: question.options.map((o) => ({
                          ...o,
                          option_id: o._id,
                        })),
                        correctAnswer: question.correctAnswer.map((a) => ({
                          ...a,
                          answer_id: a._id,
                        })),
                        difficulty: question.difficulty as "medium" | "easy" | "hard",
                      }}
                      onUpdateSuccess={() => {}}
                    />
                  </Card>
                ))}
              </div>
            ) : (
              <p>Không có câu hỏi nào trong đề thi.</p>
            )}
          </div>
        </Col>

        {/* Cột bên phải: Ngân hàng câu hỏi */}
        <Col xs={24} md={12}>
        <div style={{ height: "100px"}}>
          <h2 className="text-2xl font-semibold mb-2">Ngân hàng câu hỏi</h2>
          <Input
            placeholder="Tìm kiếm câu hỏi..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="mb-4"
          />
         </div>
          <div style={{ maxHeight: "500px", overflowY: "auto" }}>
            {otherQuestions.filter((q) =>
              q.questionText.toLowerCase().includes(searchText.toLowerCase())
            ).length > 0 ? (
              <div className="space-y-4">
                {otherQuestions
                  .filter((q) =>
                    q.questionText.toLowerCase().includes(searchText.toLowerCase())
                  )
                  .map((q, index) => (
                    <Card
                      key={q._id || index.toString()}
                      title={`Câu ${index + 1}: ${
                        q.questionText.length > 50
                          ? q.questionText.slice(0, 50) + "..."
                          : q.questionText
                      }`}
                      extra={
                        <Button
                          type="link"
                          onClick={() => handleAddQuestion(q)}
                        >
                          Thêm
                        </Button>
                      }
                    >
                      <ListeningQuestionComponent
                        question={{
                          ...q,
                          options: q.options.map((o) => ({
                            ...o,
                            option_id: o._id,
                          })),
                          correctAnswer: q.correctAnswer.map((a) => ({
                            ...a,
                            answer_id: a._id,
                          })),
                          difficulty: q.difficulty as "medium" | "easy" | "hard",
                        }}
                        onUpdateSuccess={() => {}}
                      />
                    </Card>
                  ))}
              </div>
            ) : (
              <p>Không có câu hỏi nào trong ngân hàng.</p>
            )}
          </div>
        </Col>
      </Row>
      <UpdateExamModal
        visible={openModal}
        examData={exam}
        dataQuestion={dataQuestion.map((q) => ({
          ...q,
          difficulty: q.difficulty as "medium" | "easy" | "hard",
        }))}
        onUpdateSuccess={() => setOpenModal(false)}
        handleClose={() => setOpenModal(false)}
      />
    </div>
  );
};

export default DetailListeningExam;
