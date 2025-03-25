import React, { useState, useEffect } from "react";
import { cleanString } from "@/utils/cn";
import { Divider, Input, Radio } from "antd";
import { Question } from "@/types/interface";

export type UserAnswer = {
  questionId: string;
  selectedAnswerId?: string;
  userAnswer?: string[];
};

type QuestionComponentProps = {
  question: Question;
  questionType: string;
  onAnswerChange: (newAnswer: UserAnswer) => void;
  currentAnswer?: UserAnswer;
};

const QuestionSubmit: React.FC<QuestionComponentProps> = ({
  question,
  questionType,
  onAnswerChange,
  currentAnswer,
}) => {
  const [localAnswer, setLocalAnswer] = useState<UserAnswer>(
    currentAnswer || { questionId: question._id || "", userAnswer: [] }
  );

  useEffect(() => {
    if (currentAnswer) {
      setLocalAnswer(currentAnswer);
    }
  }, [currentAnswer]);

  // Xử lý cho câu hỏi Yes/No
  const handleCheckboxChange = (questionId: string, selectedAnswerId: string) => {
    const newAnswer: UserAnswer = { questionId, selectedAnswerId };
    setLocalAnswer(newAnswer);
    onAnswerChange(newAnswer);
  };

  // Xử lý cho câu hỏi điền khuyết
  const handleFillBlankInputChange = (questionId: string, index: number, value: string) => {
    let currentUserAnswers: string[] = localAnswer.userAnswer
      ? [...localAnswer.userAnswer]
      : new Array(question.answers ? question.answers.length : 0).fill("");
    currentUserAnswers[index] = value;
    const newAnswer: UserAnswer = { questionId, userAnswer: currentUserAnswers };
    setLocalAnswer(newAnswer);
    onAnswerChange(newAnswer);
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h5 className="text-xl font-bold mb-2" style={{ whiteSpace: "pre-wrap" }}>
        {questionType === "6742fb3bd56a2e75dbd817ec" ? (
          (() => {
            const placeholderRegex = /_+\d+_+/g;
            const matchedPlaceholders = question.content.match(placeholderRegex);
            if (matchedPlaceholders && question.answers && matchedPlaceholders.length === question.answers.length) {
              const parts = question.content.split(placeholderRegex);
              return (
                <span>
                  {parts.map((part, index) => (
                    <React.Fragment key={index}>
                      <span>{part}</span>
                      {index < matchedPlaceholders.length && (
                        <Input
                          style={{ width: "150px", display: "inline-block", margin: "0 4px" }}
                          value={localAnswer.userAnswer?.[index] || ""}
                          onChange={(e) => handleFillBlankInputChange(question._id || "", index, e.target.value)}
                          placeholder={`Blank ${index + 1}`}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </span>
              );
            }
            return <span dangerouslySetInnerHTML={{ __html: cleanString(question.content) }} />;
          })()
        ) : (
          <span dangerouslySetInnerHTML={{ __html: cleanString(question.content) }} />
        )}
      </h5>
      <div className="mt-1">
        {questionType === "6742fb1cd56a2e75dbd817ea" ? (
          <Radio.Group
            onChange={(e) => handleCheckboxChange(question._id || "", e.target.value)}
            value={localAnswer.selectedAnswerId}
          >
            {question.answers && question.answers.map((answer) => (
              <div key={answer._id}>
                <Radio value={answer._id}>
                  <span dangerouslySetInnerHTML={{ __html: cleanString(answer.text || "") }} />
                </Radio>
              </div>
            ))}
          </Radio.Group>
        ) : (
          (() => {
            const placeholderRegex = /_+\d+_+/g;
            const matchedPlaceholders = question.content.match(placeholderRegex);
            if (matchedPlaceholders && question.answers && matchedPlaceholders.length === question.answers.length) {
              return null;
            } else {
              return (
                <div className="fill-blank-separate">
                  {question.answers && question.answers.map((_, index) => {
                    const value = localAnswer.userAnswer?.[index] || "";
                    return (
                      <div key={index} className="mb-2">
                        <Input
                          value={value}
                          onChange={(e) => handleFillBlankInputChange(question._id || "", index, e.target.value)}
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
            <source src={typeof question.audioInfo.filePath === "string" ? question.audioInfo.filePath : ""} type="audio/mpeg" />
          </audio>
          <p className="text-sm text-gray-600 mb-2" style={{ whiteSpace: "pre-wrap" }}>
            <strong>Giải thích: </strong>{cleanString(question.audioInfo.description)}
          </p>
          <p className="text-sm text-gray-600 mb-2" style={{ whiteSpace: "pre-wrap" }}>
            <strong>Dịch: </strong>{cleanString(question.audioInfo.transcription)}
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionSubmit;
