import React, { useEffect, useState } from "react";
import { Card, Button, Radio, message } from "antd";
import { FlashCardSet } from "@/services/student/FlashCardAPI";
import "./index.css"; 
import clsx from "clsx";
import AppLink from "@/components/AppLink";

interface MultipleChoiceQuestion {
  id: string;
  term: string;
  options: string[];
  correctAnswer: string;
}

interface FlashCardExamMultipleChoiceProps {
  flashCardSet: FlashCardSet;
}

export const FlashCardExamMultipleChoice: React.FC<FlashCardExamMultipleChoiceProps> = ({ flashCardSet }) => {
  const [questions, setQuestions] = useState<MultipleChoiceQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState<{ correct: number; wrong: number } | null>(null);

  // Hàm xáo trộn mảng
  const shuffleArray = (array: any[]) => {
    return array.sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    if (flashCardSet && flashCardSet.vocabs) {
        const shuffeVocabs = flashCardSet.vocabs.sort(() => Math.random() - 0.5);
      const generatedQuestions: MultipleChoiceQuestion[] = shuffeVocabs
        .filter((vocab) => typeof vocab !== "string")
        .map((vocab: any) => {
          const correct = vocab.definition;
          let options = [correct];
          const otherVocabs = flashCardSet.vocabs.filter(
            (v: any) => typeof v !== "string" && v._id !== vocab._id
          ) as any[];
          while (options.length < 4 && otherVocabs.length > 0) {
            const randomIndex = Math.floor(Math.random() * otherVocabs.length);
            const candidate = otherVocabs.splice(randomIndex, 1)[0].definition;
            if (!options.includes(candidate)) {
              options.push(candidate);
            }
          }
          options = shuffleArray(options);
          return {
            id: vocab._id || "",
            term: vocab.term,
            options,
            correctAnswer: correct,
          };
        });
      setQuestions(generatedQuestions);
    }
  }, [flashCardSet]);

  const handleAnswerChange = (questionIndex: number, value: string) => {
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
      <h1 className="text-3xl font-bold mb-4">Làm bài: Multiple Choices</h1>
      <p className="mb-6">Flashcard Set: {flashCardSet.title}</p>

      {questions.map((q, index) => {
        let borderClass = "";
        if (score !== null) {
          borderClass = userAnswers[index] === q.correctAnswer ? "correct-border" : "wrong-border";
        }
        return (
          <Card key={q.id} className={clsx("mb-4", borderClass)}>
            <h3>
              Câu {index + 1}: Định nghĩa của từ <strong>{q.term}</strong> là gì?
            </h3>
            <Radio.Group
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              value={userAnswers[index]}
            >
              {q.options.map((opt, i) => (
                <Radio key={i} value={opt}
                style={{ gap: "10px" }}
                >
                 <h4>{opt}</h4> 
                </Radio>
              ))}
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
        <AppLink to="/FlashCard/:_id" params={{ _id: flashCardSet._id ?? "" }}>
          <Button>
            Quay lại chi tiết flashcard
          </Button>
        </AppLink>
      </div>
    </div>
  );
};
