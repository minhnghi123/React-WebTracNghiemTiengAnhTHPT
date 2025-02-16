import React, { useEffect, useState } from "react";
import { Card, Button, Radio, message } from "antd";
import { useNavigate } from "react-router-dom";
import { FlashCardSet } from "@/services/student/FlashCardAPI";
import "./index.css";
import clsx from "clsx";

interface TrueFalseQuestion {
  id: string;
  term: string;
  displayedDefinition: string;
  correctAnswer: boolean;
}

interface FlashCardExamTrueFalseProps {
  flashCardSet: FlashCardSet;
}

export const FlashCardExamTrueFalse: React.FC<FlashCardExamTrueFalseProps> = ({ flashCardSet }) => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<TrueFalseQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, boolean>>({});
  const [score, setScore] = useState<{ correct: number; wrong: number } | null>(null);

  useEffect(() => {
    if (flashCardSet && flashCardSet.vocabs) {
      const shuffeVocabs = flashCardSet.vocabs.sort(() => Math.random() - 0.5);
      const generatedQuestions: TrueFalseQuestion[] = shuffeVocabs
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
              const randomIndex = Math.floor(Math.random() * otherVocabs.length);
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
    message.success("Bài làm đã được chấm điểm!");
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-4">Làm bài: True / False</h1>
      <p className="mb-6">Flashcard Set: {flashCardSet.title}</p>

      {questions.map((q, index) => {
       
        return (
          <Card key={q.id} className={
            clsx("mb-4", {
                "correct-border": userAnswers[index] === q.correctAnswer && userAnswers[index] !== undefined && score ,
                "wrong-border": userAnswers[index] !== q.correctAnswer && userAnswers[index] !== undefined && score,
                })
          }
          >
            <h3>
              Câu {index + 1}: Từ <strong>{q.term}</strong> có định nghĩa là:{" "}
              <em>"{q.displayedDefinition}"</em>?
            </h3>
            <Radio.Group
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              value={userAnswers[index]}
            >
              <Radio value={true}>True</Radio>
              <Radio value={false}>False</Radio>
            </Radio.Group>
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

      <div className="mt-6 text-center">
        <Button onClick={() => navigate(`/flashcard/${flashCardSet._id}`)}>
          Quay lại chi tiết flashcard
        </Button>
      </div>
    </div>
  );
};
