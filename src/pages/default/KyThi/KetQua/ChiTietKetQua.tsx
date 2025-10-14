import React from "react";
import { QuestionAnswerResult, Result } from "@/services/student";
import QuestionAnswerComponent from "./QuestionAnswer";
import "./ChiTietKetQua.css";
import { Tag } from "antd";
interface ChiTietKetQuaProps {
  result: Result;
}

// Hàm ghép dữ liệu của 1 câu hỏi nghe: sử dụng thông tin từ listeningExamQuestion và kết quả từ listeningQuestions (nếu tìm thấy)
const mergeListeningQuestion = (
  listeningExamQuestion: any,
  listeningQuestions: QuestionAnswerResult[]
): QuestionAnswerResult => {
  // Tìm kết quả dựa theo questionId (trùng với _id của câu hỏi trong listeningExam)
  const resultQuestion = listeningQuestions.find(
    (lq) => lq.questionId === listeningExamQuestion._id
  );

  // Ghép dữ liệu: ưu tiên thông tin từ listeningExamQuestion (ví dụ questionText, blankAnswer, options,...)
  return {
    _id: listeningExamQuestion._id,
    content: listeningExamQuestion.questionText,
    answers:
      listeningExamQuestion.options && listeningExamQuestion.options.length > 0
        ? // Chuyển đổi options thành dạng giống với trường answers trong kết quả
          listeningExamQuestion.options.map((opt: any) => ({
            _id: opt._id,
            text: opt.optionText,
            isCorrect: false, // sẽ đánh dấu đúng/sai dựa vào mảng correctAnswer nếu cần
            correctAnswerForBlank: "",
          }))
        : [],
    // Nếu câu hỏi dạng điền khuyết, ta dùng blankAnswer làm đáp án chính xác
    userAnswers: resultQuestion ? resultQuestion.userAnswers : [],
    selectedAnswerId: resultQuestion ? resultQuestion.selectedAnswerId : "",
    isCorrect: resultQuestion ? resultQuestion.isCorrect : false,
    // Thêm trường blankAnswer nếu có (để component hiển thị điền khuyết)
    blankAnswer: listeningExamQuestion.blankAnswer,
    questionId: listeningExamQuestion._id,
  } as QuestionAnswerResult;
};

const ChiTietKetQua: React.FC<ChiTietKetQuaProps> = ({ result }) => {
  // Tính tổng số câu
  const totalListeningQuestions =
    typeof result.examId === "object" && result.examId.listeningExams
      ? result.examId.listeningExams.reduce(
          (total: number, exam: any) =>
            total + (exam.questions ? exam.questions.length : 0),
          0
        )
      : result.listeningQuestions.length;

  // Tính số câu bỏ qua
  const skippedQuestionsCount = [
    ...(result.questions || []),
    ...(result.listeningQuestions || []),
  ].filter((q: any) => q.isSkipped).length;

  return (
    <div className="chi-tiet-ket-qua-page">
      <div className="result-header-section">
        <div className="result-score-badge">
          <div className="score-value">{result.score}</div>
          <div className="score-label">
            / {result.questions.length + totalListeningQuestions}
          </div>
        </div>
        <h1 className="result-exam-title">
          {typeof result.examId === "object"
            ? result.examId.title
            : result.examId}
        </h1>

        {/* Hiển thị thống kê */}
        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Tag
            color="success"
            style={{ fontSize: "0.875rem", padding: "4px 12px" }}
          >
            ✓ Đúng: {result.correctAnswer}
          </Tag>
          <Tag
            color="error"
            style={{ fontSize: "0.875rem", padding: "4px 12px" }}
          >
            ✗ Sai: {result.wrongAnswer}
          </Tag>
          <Tag
            color="warning"
            style={{ fontSize: "0.875rem", padding: "4px 12px" }}
          >
            ? Bỏ qua: {skippedQuestionsCount}
          </Tag>
        </div>
      </div>

      <div className="questions-container">
        {/* Hiển thị các câu hỏi trắc nghiệm, đọc, điền khuyết */}
        {result.questions &&
          (result.questions as QuestionAnswerResult[]).map(
            (item: QuestionAnswerResult, index: number) => (
              <div key={item._id}>
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "#3b82f6",
                    marginBottom: "0.5rem",
                  }}
                >
                  Câu {index + 1}
                </h3>
                <QuestionAnswerComponent question={item} />
              </div>
            )
          )}

        {/* Hiển thị câu hỏi nghe */}
        {typeof result.examId === "object" &&
        result.examId.listeningExams &&
        result.examId.listeningExams.length > 0
          ? result.examId.listeningExams.map((exam: any) => (
              <div key={exam._id} style={{ marginBottom: "2rem" }}>
                <h2
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    marginBottom: "1rem",
                    color: "#1a1a1a",
                  }}
                >
                  {exam.title}
                </h2>
                {exam.questions &&
                  exam.questions.map(
                    (listeningExamQuestion: any, index: number) => {
                      const mergedQuestion = mergeListeningQuestion(
                        listeningExamQuestion,
                        result.listeningQuestions || []
                      );
                      return (
                        <div key={mergedQuestion._id}>
                          <h3
                            style={{
                              fontSize: "1rem",
                              fontWeight: 600,
                              color: "#3b82f6",
                              marginBottom: "0.5rem",
                            }}
                          >
                            Câu {result.questions.length + index + 1}
                          </h3>
                          <QuestionAnswerComponent question={mergedQuestion} />
                        </div>
                      );
                    }
                  )}
              </div>
            ))
          : result.listeningQuestions &&
            (result.listeningQuestions as QuestionAnswerResult[]).map(
              (item: QuestionAnswerResult, index: number) => (
                <div key={item._id}>
                  <h3
                    style={{
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: "#3b82f6",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Câu {result.questions.length + index + 1}
                  </h3>
                  <QuestionAnswerComponent question={item} />
                </div>
              )
            )}
      </div>
    </div>
  );
};

export default ChiTietKetQua;
