import React, { useState, useEffect } from "react";
import { Button, Card, Collapse, Tag, Row, Col } from "antd";
import { ListeningExamData, Question } from "@/services/teacher/ListeningQuestion";
import ListeningQuestionComponent from "@/pages/giaovien/QuanLyCauHoi/ListeningQuestion";
import UpdateExamModal from "./UpdateExam/UpdateExam";

const { Panel } = Collapse;

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

  useEffect(() => {
    setExam(data);
  }, [data]);

  // Lấy danh sách câu hỏi ngân hàng chưa có trong đề thi
  const remainingQuestions = dataQuestion.filter(
    (q) => !exam.questions.some((eq) => eq === q._id)
  );
  console.log("dataQuestion", exam);

  const handleAddQuestion = (q: Question) => {
    if (!exam.questions.includes(q._id)) {
      setExam((prev) => ({
        ...prev,
        questions: [...prev.questions, q._id],
      }));
    }
  };

  const handleRemoveQuestion = (q: Question) => {
    setExam((prev) => ({
      ...prev,
      questions: prev.questions.filter((id) => id !== q._id),
    }));
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
            <audio controls src={exam.audio.filePath} />
          ) : (
            <span>Không có audio</span>
          )}
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Cột bên trái: Câu hỏi trong đề thi */}
        <Col xs={24} md={12}>
          <h2 className="text-2xl font-semibold mb-2">Câu hỏi trong đề thi</h2>
          {exam.questions  ? (
          
            <Collapse accordion>
              {exam.questions.map((questionId: any, index) => {
                const question = dataQuestion.find((q) => q._id === questionId._id);

                return (
                  question && (
                    <Panel
                      header={
                        <div>
                          <strong>
                            Câu {index + 1}:{" "}
                            {question.questionText.length > 50
                              ? question.questionText.slice(0, 50) + "..."
                              : question.questionText}
                          </strong>
                        </div>
                      }
                      key={questionId._id}
                    >
                      <div className="flex flex-col gap-2">
                        <ListeningQuestionComponent
                          question={{
                            ...question,
                            id: question._id,
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
                        <Button type="link" danger onClick={() => handleRemoveQuestion(question)}>
                          Gỡ
                        </Button>
                      </div>
                    </Panel>
                  )
                );
              })}
            </Collapse>
          ) : (
 
            <p>Không có câu hỏi nào trong đề thi.</p>
          )}
        </Col>

        {/* Cột bên phải: Ngân hàng câu hỏi */}
        <Col xs={24} md={12}>
          <h2 className="text-2xl font-semibold mb-2">Ngân hàng câu hỏi</h2>
          {remainingQuestions ? (
            <Collapse accordion>
              {remainingQuestions.map((q, index) => (
                <Panel
                  header={
                    <div>
                      <strong>
                        Câu {index + 1}:{" "}
                        {q.questionText.length > 50
                          ? q.questionText.slice(0, 50) + "..."
                          : q.questionText}
                      </strong>
                    </div>
                  }
                  key={q._id || index.toString()}
                >
                  <div className="flex flex-col gap-2">
                    <ListeningQuestionComponent
                      question={{
                        ...q,
                        id: q._id || "",
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
                    <Button type="link" onClick={() => q._id && handleAddQuestion(q)}>
                      Thêm
                    </Button>
                  </div>
                </Panel>
              ))}
            </Collapse>
          ) : (
            <p>Không có câu hỏi nào trong ngân hàng.</p>
          )}
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
