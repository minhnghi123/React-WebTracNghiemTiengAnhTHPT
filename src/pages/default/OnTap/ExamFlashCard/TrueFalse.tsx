import React, { useEffect, useState } from "react";
import { Button, Radio, Modal, Card } from "antd";
import { FlashCardSet } from "@/services/student/FlashCardAPI";
import {
  CheckCircleOutlined,
  BookOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./index.css";

interface TrueFalseQuestion {
  id: string;
  term: string;
  displayedDefinition: string;
  correctAnswer: boolean;
}

interface FlashCardExamTrueFalseProps {
  flashCardSet: FlashCardSet;
}

export const FlashCardExamTrueFalse: React.FC<FlashCardExamTrueFalseProps> = ({
  flashCardSet,
}) => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<TrueFalseQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, boolean>>({});
  const [score, setScore] = useState<{ correct: number; wrong: number } | null>(
    null
  );
  const [showResultModal, setShowResultModal] = useState(false); // ✅ Thêm state

  useEffect(() => {
    if (flashCardSet && flashCardSet.vocabs) {
      const shuffleVocabs = flashCardSet.vocabs.sort(() => Math.random() - 0.5);
      const generatedQuestions: TrueFalseQuestion[] = shuffleVocabs
        .filter((vocab) => typeof vocab !== "string")
        .map((vocab: any) => {
          const isShowCorrect = Math.random() > 0.5;
          let displayedDefinition = "";
          let correctAnswer: boolean;
          if (isShowCorrect) {
            displayedDefinition = vocab.definition;
            correctAnswer = true;
          } else {
            const otherVocabs = flashCardSet.vocabs.filter(
              (v: any) => typeof v !== "string" && v._id !== vocab._id
            ) as any[];
            if (otherVocabs.length > 0) {
              const randomIndex = Math.floor(
                Math.random() * otherVocabs.length
              );
              displayedDefinition = otherVocabs[randomIndex].definition;
            }
            correctAnswer = false;
          }
          return {
            id: vocab._id || "",
            term: vocab.term,
            displayedDefinition,
            correctAnswer,
          };
        });
      setQuestions(generatedQuestions);
    }
  }, [flashCardSet]);

  const handleAnswerChange = (questionIndex: number, value: boolean) => {
    setUserAnswers((prev) => ({ ...prev, [questionIndex]: value }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q, index) => {
      if (userAnswers[index] === q.correctAnswer) {
        correctCount++;
      }
    });
    const total = questions.length;
    const wrongCount = total - correctCount;
    setScore({ correct: correctCount, wrong: wrongCount });
    setShowResultModal(true); // ✅ Show modal
  };

  const handleCloseModal = () => {
    setShowResultModal(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isAnswered = (index: number) => userAnswers[index] !== undefined;
  const isCorrect = (index: number) =>
    userAnswers[index] === questions[index].correctAnswer;

  return (
    <div className="flashcard-exam-page">
      {/* Hero Section */}
      <div className="exam-hero-compact">
        <div className="hero-background"></div>
        <div className="hero-content">
          <BookOutlined className="hero-icon" />
          <h1 className="hero-title">True / False</h1>
          <p className="hero-subtitle">{flashCardSet.title}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flashcard-exam-container">
        {questions.map((q, index) => (
          <div
            key={q.id}
            className={`exam-question-card ${
              score && isAnswered(index)
                ? isCorrect(index)
                  ? "correct-border"
                  : "wrong-border"
                : ""
            }`}
          >
            <div className="question-header">
              <span className="question-number-badge">Câu {index + 1}</span>
              <div className="question-text">
                Từ <span className="question-term">{q.term}</span> có định nghĩa
                là:{" "}
                <span className="question-definition">
                  "{q.displayedDefinition}"
                </span>
                ?
              </div>
            </div>

            <Radio.Group
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              value={userAnswers[index]}
              className="answer-options-group"
              disabled={!!score}
            >
              <div className="answer-option-item">
                <Radio value={true}>True (Đúng)</Radio>
              </div>
              <div className="answer-option-item">
                <Radio value={false}>False (Sai)</Radio>
              </div>
            </Radio.Group>
          </div>
        ))}

        {/* Submit Section */}
        <div className="exam-submit-section">
          {!score ? (
            <Button
              type="primary"
              onClick={handleSubmit}
              className="submit-button"
              icon={<CheckCircleOutlined />}
            >
              Nộp bài
            </Button>
          ) : (
            <div className="score-display-card">
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "#1f2937",
                  marginBottom: "1rem",
                }}
              >
                Kết quả làm bài
              </h2>
              <div className="score-stats">
                <div className="score-stat-item">
                  <div className="score-value correct">{score.correct}</div>
                  <div className="score-label">Câu đúng</div>
                </div>
                <div className="score-stat-item">
                  <div className="score-value wrong">{score.wrong}</div>
                  <div className="score-label">Câu sai</div>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={() => navigate(`/flashcard/${flashCardSet._id}`)}
            className="back-button"
            icon={<ArrowLeftOutlined />}
          >
            Quay lại chi tiết
          </Button>
        </div>
      </div>

      {/* ✅ Result Modal */}
      <Modal
        visible={showResultModal}
        onCancel={handleCloseModal}
        footer={null}
        width={800}
        className="result-detail-modal"
        centered
      >
        <div className="modal-result-content">
          <div className="modal-result-header">
            <BookOutlined className="modal-icon" />
            <h2>Kết quả chi tiết</h2>
          </div>

          <div className="modal-score-summary">
            <div className="score-item correct">
              <div className="score-number">{score?.correct || 0}</div>
              <div className="score-text">Câu đúng</div>
            </div>
            <div className="score-divider">/</div>
            <div className="score-item total">
              <div className="score-number">{questions.length}</div>
              <div className="score-text">Tổng câu</div>
            </div>
          </div>

          <div className="modal-questions-list">
            {questions.map((q, index) => {
              const isAnswered = userAnswers[index] !== undefined;
              const isCorrect = userAnswers[index] === q.correctAnswer;

              return (
                <Card
                  key={q.id}
                  className={`result-question-card ${
                    isAnswered
                      ? isCorrect
                        ? "correct"
                        : "wrong"
                      : "unanswered"
                  }`}
                >
                  <div className="question-result-header">
                    <span className="question-index">Câu {index + 1}</span>
                    <span
                      className={`result-badge ${
                        isCorrect ? "correct" : "wrong"
                      }`}
                    >
                      {isCorrect ? "✓ Đúng" : "✗ Sai"}
                    </span>
                  </div>
                  <div className="question-content-modal">
                    <p>
                      <strong>Câu hỏi:</strong> Từ "{q.term}" có định nghĩa là "
                      {q.displayedDefinition}"?
                    </p>
                    <p>
                      <strong>Đáp án của bạn:</strong>{" "}
                      {userAnswers[index] ? "True" : "False"}
                    </p>
                    <p>
                      <strong>Đáp án đúng:</strong>{" "}
                      {q.correctAnswer ? "True" : "False"}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>

          <Button
            type="primary"
            size="large"
            onClick={handleCloseModal}
            className="modal-close-btn"
            block
          >
            Đóng
          </Button>
        </div>
      </Modal>
    </div>
  );
};
