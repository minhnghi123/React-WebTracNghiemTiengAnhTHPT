import { Question } from "@/services/teacher/Teacher";
import { cleanString } from "@/utils/cn";
import { Divider, Input, Radio } from "antd";

import { useState, useEffect } from "react";
const updateAnswersInLocalStorage = (
  key: string,
  newAnswer: { questionId: string; selectedAnswerId: string }
) => {
  try {
    // Lấy dữ liệu cũ từ localStorage
    const storedAnswers = localStorage.getItem(key);
    let answers: { questionId: string; selectedAnswerId: string }[] = [];

    if (storedAnswers) {
      answers = JSON.parse(storedAnswers);
    }

    // Kiểm tra nếu câu hỏi đã tồn tại trong mảng
    const index = answers.findIndex(
      (answer) => answer.questionId === newAnswer.questionId
    );

    if (index !== -1) {
      // Cập nhật giá trị nếu đã tồn tại
      answers[index].selectedAnswerId = newAnswer.selectedAnswerId;
    } else {
      // Thêm mới nếu chưa tồn tại
      answers.push(newAnswer);
    }

    // Lưu lại vào localStorage
    localStorage.setItem(key, JSON.stringify(answers));
  } catch (error) {
    console.error("Error updating localStorage:", error);
  }
};

type QuestionComponentProps = {
  question: Question;

  questionType: string;
};

const QuestionSumit: React.FC<QuestionComponentProps> = ({
  question,
  questionType,
}) => {
  const [answers, setAnswers] = useState<
    { questionId: string; selectedAnswerId: string }[]
  >([]);

  useEffect(() => {
    const storedAnswers = localStorage.getItem("answers");
    if (storedAnswers) {
      setAnswers(JSON.parse(storedAnswers));
    }
  }, []);

  const handleCheckboxChange = (
    questionId: string,
    selectedAnswerId: string
  ) => {
    const newAnswer = { questionId, selectedAnswerId };

    // Cập nhật vào localStorage
    updateAnswersInLocalStorage("answers", newAnswer);

    // Cập nhật state
    setAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      const index = newAnswers.findIndex(
        (answer) => answer.questionId === questionId
      );
      if (index !== -1) {
        newAnswers[index].selectedAnswerId = selectedAnswerId;
      } else {
        newAnswers.push(newAnswer);
      }
      return newAnswers;
    });
  };

  const handleInputChange = (questionId: string, value: string) => {
    const newAnswer = { questionId, selectedAnswerId: value };

    // Cập nhật vào localStorage
    updateAnswersInLocalStorage("answers", newAnswer);

    // Cập nhật state
    setAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      const index = newAnswers.findIndex(
        (answer) => answer.questionId === questionId
      );
      if (index !== -1) {
        newAnswers[index].selectedAnswerId = value;
      } else {
        newAnswers.push(newAnswer);
      }
      return newAnswers;
    });
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h5 className="text-xl font-bold mb-2" style={{ whiteSpace: "pre-wrap" }}>
        <span
          dangerouslySetInnerHTML={{ __html: cleanString(question.content) }}
        />
      </h5>
      <div className="mt-1">
        {questionType === "6742fb1cd56a2e75dbd817ea" ? (
          <Radio.Group
            onChange={(e) =>
              handleCheckboxChange(question._id ?? "", e.target.value)
            }
            value={
              answers.find((answer) => answer.questionId === question._id)
                ?.selectedAnswerId
            }
          >
            {question.answers.map((answer) => (
              <div>
                <Radio key={answer._id} value={answer._id}>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: cleanString(answer.text),
                    }}
                  />
                </Radio>
              </div>
            ))}
          </Radio.Group>
        ) : (
          <Input
            value={
              answers.find((answer) => answer.questionId === question._id)
                ?.selectedAnswerId
            }
            onChange={(e) =>
              handleInputChange(question._id ?? "", e.target.value)
            }
            placeholder="Enter your answer"
          />
        )}
      </div>

      {question.audioInfo && (
        <div>
          <Divider orientation="left" style={{ borderColor: "#7cb305" }}>
            Phần nghe
          </Divider>
          <audio controls>
            <source src={question.audioInfo.filePath} type="audio/mpeg" />
          </audio>
          <p
            className="text-sm text-gray-600 mb-2"
            style={{ whiteSpace: "pre-wrap" }}
          >
            <span style={{ fontWeight: "bold" }}>Giải thích: </span>
            {cleanString(question.audioInfo.description)}
          </p>
          <p
            className="text-sm text-gray-600 mb-2"
            style={{ whiteSpace: "pre-wrap" }}
          >
            <span style={{ fontWeight: "bold" }}>Dịch: </span>
            {cleanString(question.audioInfo.transcription)}
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionSumit;
