import React, { useState, useEffect } from "react";
import { Button, Card, Collapse, Tag, Row, Col } from "antd";
import { ExamDataRecieve, ListeningQuestion, Question } from "@/services/teacher/ListeningQuestion";
import ListeningQuestionComponent from "@/pages/giaovien/QuanLyCauHoi/ListeningQuestion";
import UpdateExamModal from "./UpdateExam/UpdateExam";

const { Panel } = Collapse;

interface DetailListeningExamProps {
  data: ExamDataRecieve;
  onBack: () => void;
  dataQUestion: Question[];
}

const DetailListeningExam: React.FC<DetailListeningExamProps> = ({
  data,
  onBack,
  dataQUestion,
}) => {
  const [exam, setExam] = useState<ExamDataRecieve>(data);
  const [openMOdal, setOpenModal] = useState(false);
  useEffect(() => {
    setExam(data);
    console.log(exam);

  }, [data]);

  // Lấy danh sách câu hỏi ngân hàng chưa có trong đề thi
  const remainingQuestions = dataQUestion.filter(
    (q) => !exam.questions.some((eq) => eq._id === q._id)
  );

  const handleAddQuestion = (q: Question) => {
    if (!exam.questions.some((eq) => eq._id === q._id)) {
      setExam((prev) => ({
        ...prev,
        questions: [...prev.questions, q as Question],
      }));
    }
  };

  const handleRemoveQuestion = (q: Question) => {
    setExam((prev) => ({
      ...prev,
      questions: prev.questions.filter((eq) => eq._id !== q._id),
    }));
  };

  return (
    <div className="container mx-auto p-4">
      <Button type="default" onClick={onBack} className="mb-4">
        Back
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
          <strong>Độ khó:</strong>{" "}
          <Tag
            color={
              exam.difficulty === "easy"
                ? "green"
                : exam.difficulty === "medium"
                ? "yellow"
                : "red"
            }
          >
            {exam.difficulty}
          </Tag>
        </p>
        <p>
          <strong>Điểm qua:</strong> {exam.passingScore}
        </p>
        <p>
          <strong>Trạng thái:</strong>{" "}
          {exam.isPublished ? "Đã phát hành" : "Chưa phát hành"}
        </p>
        <div>
          <strong>Audio: </strong>
          {exam.audio && typeof exam.audio === "object" ? (
            <audio controls src={typeof exam.audio.filePath === "string" ? exam.audio.filePath : ""} />
          ) : (
            <span>{exam.audio}</span>
          )}
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Cột bên trái: Câu hỏi trong đề thi */}
        <Col xs={24} md={12}>
          <h2 className="text-2xl font-semibold mb-2">Câu hỏi trong đề thi</h2>
          {exam.questions && exam.questions.length > 0 ? (
            <Collapse accordion>
              {exam.questions.map((q, index) => (
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
                        id: q._id,
                        options: q.options.map((o) => ({ ...o, option_id: o._id })),
                        correctAnswer: q.correctAnswer.map((a) => ({ ...a, answer_id: a._id })),
                        difficulty: q.difficulty as "easy" | "medium" | "hard",
                      }}
                      onUpdateSuccess={() => {}}
                    />
                    <Button type="link" danger onClick={() => handleRemoveQuestion(q)}>
                      Gỡ
                    </Button>
                  </div>
                </Panel>
              ))}
            </Collapse>
          ) : (
            <p>Không có câu hỏi nào trong đề thi.</p>
          )}
        </Col>

        {/* Cột bên phải: Ngân hàng câu hỏi */}
        <Col xs={24} md={12}>
          <h2 className="text-2xl font-semibold mb-2">Ngân hàng câu hỏi</h2>
          {remainingQuestions && remainingQuestions.length > 0 ? (
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
                        difficulty: q.difficulty as "easy" | "medium" | "hard",
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
        visible={openMOdal}
        examData={{
          ...exam,
          teacherId: exam.teacherId._id,
          questions: exam.questions.map(q => q._id),
          difficulty: ["easy", "medium", "hard"].includes(exam.difficulty) ? exam.difficulty as "easy" | "medium" | "hard" : "easy"
        }}
        dataQuestion={dataQUestion.map((q) => ({
          ...q,
          id: q._id,
          options: q.options.map((o) => ({ ...o, option_id: o._id })),
          correctAnswer: q.correctAnswer.map((a) => ({ ...a, answer_id: a._id })),
          difficulty: ["easy", "medium", "hard"].includes(q.difficulty) ? q.difficulty as "easy" | "medium" | "hard" : "easy"
        })) as ListeningQuestion[]}
        onUpdateSuccess={() => setOpenModal(false)}
        handleClose={() => setOpenModal(false)}
        />
    </div>
  );
};

export default DetailListeningExam;
