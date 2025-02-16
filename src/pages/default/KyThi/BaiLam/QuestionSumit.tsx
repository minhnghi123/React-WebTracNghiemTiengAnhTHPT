import React, { useState, useEffect } from "react";
import { Question } from "@/services/teacher/Teacher"; 
import { cleanString } from "@/utils/cn";
import { Divider, Input, Radio } from "antd";

// Định nghĩa kiểu dữ liệu cho đáp án của người dùng
type UserAnswer = {
  questionId: string;
  selectedAnswerId?: string;
  userAnswer?: string[];
};

// Hàm cập nhật đáp án vào localStorage (hỗ trợ cả hai kiểu dữ liệu)
const updateAnswersInLocalStorage = (key: string, newAnswer: UserAnswer) => {
  try {
    const storedAnswers = localStorage.getItem(key);
    let answers: UserAnswer[] = [];

    if (storedAnswers) {
      answers = JSON.parse(storedAnswers);
    }

    const index = answers.findIndex(
      (answer) => answer.questionId === newAnswer.questionId
    );

    if (index !== -1) {
      answers[index] = newAnswer;
    } else {
      answers.push(newAnswer);
    }

    localStorage.setItem(key, JSON.stringify(answers));
  } catch (error) {
    console.error("Error updating localStorage:", error);
  }
};

type QuestionComponentProps = {
  question: Question;
  // questionType truyền từ bên ngoài: Yes/No là "6742fb1cd56a2e75dbd817ea"
  // và Điền khuyết là "6742fb3bd56a2e75dbd817ec"
  questionType: string;
};

const QuestionSubmit: React.FC<QuestionComponentProps> = ({
  question,
  questionType,
}) => {
  const [answers, setAnswers] = useState<UserAnswer[]>([]);

  // Lấy dữ liệu đã lưu trong localStorage khi component mount
  useEffect(() => {
    const storedAnswers = localStorage.getItem("answers");
    if (storedAnswers) {
      setAnswers(JSON.parse(storedAnswers));
    }
  }, []);

  // Lấy đối tượng đáp án người dùng hiện tại cho câu hỏi này
  const currentUserAnswerObj = answers.find(
    (ans) => ans.questionId === question._id
  );

  // Xử lý cho câu hỏi Yes/No
  const handleCheckboxChange = (
    questionId: string,
    selectedAnswerId: string
  ) => {
    const newAnswer: UserAnswer = { questionId, selectedAnswerId };

    updateAnswersInLocalStorage("answers", newAnswer);

    setAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      const index = newAnswers.findIndex((ans) => ans.questionId === questionId);
      if (index !== -1) {
        newAnswers[index].selectedAnswerId = selectedAnswerId;
      } else {
        newAnswers.push(newAnswer);
      }
      return newAnswers;
    });
  };

  // Xử lý cho câu hỏi điền khuyết: cập nhật từng ô Input theo vị trí (blank)
  const handleFillBlankInputChange = (
    questionId: string,
    index: number,
    value: string
  ) => {
    let currentUserAnswers: string[] = [];
    if (currentUserAnswerObj && currentUserAnswerObj.userAnswer) {
      currentUserAnswers = [...currentUserAnswerObj.userAnswer];
    } else {
      // Khởi tạo mảng với số phần tử bằng số blank cần điền
      currentUserAnswers = new Array(question.answers.length).fill("");
    }
    currentUserAnswers[index] = value;

    const newAnswer: UserAnswer = { questionId, userAnswer: currentUserAnswers };

    updateAnswersInLocalStorage("answers", newAnswer);

    setAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      const answerIndex = newAnswers.findIndex(
        (ans) => ans.questionId === questionId
      );
      if (answerIndex !== -1) {
        newAnswers[answerIndex] = newAnswer;
      } else {
        newAnswers.push(newAnswer);
      }
      return newAnswers;
    });
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      {/* Tiêu đề/câu hỏi */}
      <h5 className="text-xl font-bold mb-2" style={{ whiteSpace: "pre-wrap" }}>
        {questionType === "6742fb3bd56a2e75dbd817ec" ? (
          (() => {
            // Regex mới: _+ số _+ (ít nhất 1 dấu gạch dưới bên trái và bên phải)
            const placeholderRegex = /_+\d+_+/g;
            const matchedPlaceholders = question.content.match(placeholderRegex);
            if (
              matchedPlaceholders &&
              matchedPlaceholders.length === question.answers.length
            ) {
              // Nếu đủ placeholder, tách nội dung theo placeholder và chèn input inline
              const parts = question.content.split(placeholderRegex);
              return (
                <span>
                  {parts.map((part, index) => (
                    <React.Fragment key={index}>
                      <span>{part}</span>
                      {index < matchedPlaceholders.length && (
                        <Input
                          style={{
                            width: "150px",
                            display: "inline-block",
                            margin: "0 4px",
                          }}
                          value={
                            currentUserAnswerObj?.userAnswer &&
                            currentUserAnswerObj.userAnswer[index]
                              ? currentUserAnswerObj.userAnswer[index]
                              : ""
                          }
                          onChange={(e) =>
                            handleFillBlankInputChange(
                              question._id ?? "",
                              index,
                              e.target.value
                            )
                          }
                          placeholder={`Blank ${index + 1}`}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </span>
              );
            }
            // Nếu không đủ placeholder, render nội dung gốc
            return (
              <span
                dangerouslySetInnerHTML={{
                  __html: cleanString(question.content),
                }}
              />
            );
          })()
        ) : (
          // Với Yes/No, render nội dung gốc
          <span
            dangerouslySetInnerHTML={{ __html: cleanString(question.content) }}
          />
        )}
      </h5>

      <div className="mt-1">
        {questionType === "6742fb1cd56a2e75dbd817ea" ? (
          // Nếu là Yes/No, hiển thị Radio.Group
          <Radio.Group
            onChange={(e) =>
              handleCheckboxChange(question._id ?? "", e.target.value)
            }
            value={currentUserAnswerObj?.selectedAnswerId}
          >
            {question.answers.map((answer) => (
              <div key={answer._id}>
                <Radio value={answer._id}>
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
          // Với câu hỏi điền khuyết: Nếu nội dung không chứa đủ placeholder,
          // hiển thị các ô input riêng bên dưới.
          (() => {
            const placeholderRegex = /_+\d+_+/g;
            const matchedPlaceholders = question.content.match(placeholderRegex);
            if (
              matchedPlaceholders &&
              matchedPlaceholders.length === question.answers.length
            ) {
              // Đã render inline trong tiêu đề -> không cần hiển thị thêm
              return null;
            } else {
              return (
                <div className="fill-blank-separate">
                  {question.answers.map((_, index) => {
                    const value =
                      currentUserAnswerObj?.userAnswer &&
                      currentUserAnswerObj.userAnswer[index]
                        ? currentUserAnswerObj.userAnswer[index]
                        : "";
                    return (
                      <div key={index} className="mb-2">
                        <Input
                          value={value}
                          onChange={(e) =>
                            handleFillBlankInputChange(
                              question._id ?? "",
                              index,
                              e.target.value
                            )
                          }
                          placeholder={`Blank ${index + 1}`}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            }
          })()
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

export default QuestionSubmit;
