import React, { useEffect, useState } from "react";
import { Card, Button, Input, message } from "antd";
import { FlashCardSet } from "@/services/student/FlashCardAPI";
import "./index.css";
import clsx from "clsx";

interface WrittenQuestion {
  id: string;
  term: string;
  definition?: string;
  correctAnswer: string;
}

interface FlashCardExamWrittenProps {
  flashCardSet: FlashCardSet;
}

export const FlashCardExamWritten: React.FC<FlashCardExamWrittenProps> = ({ flashCardSet }) => {
  const [questions, setQuestions] = useState<WrittenQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState<{ correct: number; wrong: number } | null>(null);

  // Sinh câu hỏi từ danh sách từ vựng có sẵn
  useEffect(() => {
    if (flashCardSet && flashCardSet.vocabs) {
        const shuffledVocabs = flashCardSet.vocabs.sort(() => Math.random() - 0.5);
      const generatedQuestions: WrittenQuestion[] = shuffledVocabs
        .filter((vocab) => typeof vocab !== "string")
        .map((vocab: any) => ({
          id: vocab._id || "",
          term: vocab.term,
          correctAnswer: vocab.term,
          definition: vocab.definition,
          
        }));
      setQuestions(generatedQuestions);
    }
  }, [flashCardSet]);

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionIndex]: value }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q, index) => {
      const userAns = userAnswers[index];
      if (
        typeof userAns === "string" &&
        userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
      ) {
        correctCount++;
      }
    });
    const total = questions.length;
    const wrongCount = total - correctCount;
    setScore({ correct: correctCount, wrong: wrongCount });
    message.success("Bài làm đã được chấm điểm!");
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-4">Làm bài: Written</h1>
      <p className="mb-6">Flashcard Set: {flashCardSet.title}</p>

      {questions.map((q, index) => {
        let borderClass = "";
        if (score !== null) {
          borderClass =
            userAnswers[index]?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
              ? "correct-border"
              : "wrong-border";
        }
        return (
          <Card key={q.id} className={clsx("mb-1", borderClass)}>
            <div className="question-row">
              <div className="question-col label-col">
               
                <p>
                Câu {index + 1}: Viết tiếng Anh của từ <strong>{q.definition}</strong>
                </p>
              </div>
              <div className="question-col input-col">
                <Input.TextArea
                  rows={3}
                  placeholder="Nhập đáp án của bạn..."
                  value={userAnswers[index] || ""}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                />
                {score !== null &&
                  userAnswers[index]?.trim().toLowerCase() !== q.correctAnswer.trim().toLowerCase() && (
                    <div className="correct-answer">
                      Đáp án đúng: {q.correctAnswer}
                    </div>
                  )}
              </div>
            </div>
          </Card>
        );
      })}

      <div className="mt-6 text-center">
        <Button type="primary" onClick={handleSubmit}>
          Nộp bài
        </Button>
      </div>

      {score && (
        <div className="mt-4 text-center">
          <h2>
            Số câu đúng: <span style={{ color: "green" }}>{score.correct}</span> / {questions.length}
          </h2>
          <h2>
            Số câu sai: <span style={{ color: "red" }}>{score.wrong}</span>
          </h2>
        </div>
      )}

      
    </div>
  );
};
