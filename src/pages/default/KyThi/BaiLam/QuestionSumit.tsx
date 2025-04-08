import React, { useState, useEffect } from "react";
import { Divider, Input, Radio, Card, Typography, Space } from "antd";
import { Question } from "@/types/interface";
import { cleanString } from "@/utils/cn";

const { Title, Text, Paragraph } = Typography;

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
  index: number;
};

const QuestionSubmit: React.FC<QuestionComponentProps> = ({
  question,
  questionType,
  onAnswerChange,
  currentAnswer,
  index,
}) => {
  const [localAnswer, setLocalAnswer] = useState<UserAnswer>(
    currentAnswer || { questionId: question._id || "", userAnswer: [] }
  );

  useEffect(() => {
    if (currentAnswer) {
      setLocalAnswer(currentAnswer);
    }
  }, [currentAnswer]);

  const handleCheckboxChange = (
    questionId: string,
    selectedAnswerId: string
  ) => {
    const newAnswer: UserAnswer = { questionId, selectedAnswerId };
    setLocalAnswer(newAnswer);
    onAnswerChange(newAnswer);
  };

  const handleFillBlankInputChange = (
    questionId: string,
    index: number,
    value: string
  ) => {
    let currentUserAnswers: string[] = localAnswer.userAnswer
      ? [...localAnswer.userAnswer]
      : new Array(question.answers ? question.answers.length : 0).fill("");
    currentUserAnswers[index] = value;
    const newAnswer: UserAnswer = {
      questionId,
      userAnswer: currentUserAnswers,
    };
    setLocalAnswer(newAnswer);
    onAnswerChange(newAnswer);
  };

  const renderFillInBlankContent = () => {
    const placeholderRegex = /_+\d+_+/g;
    const matchedPlaceholders = question.content.match(placeholderRegex);

    if (
      matchedPlaceholders &&
      question.answers &&
      matchedPlaceholders.length === question.answers.length
    ) {
      const parts = question.content.split(placeholderRegex);
      return (
        <Paragraph>
          {parts.map((part, idx) => (
            <React.Fragment key={idx}>
              <span>{part}</span>
              {idx < matchedPlaceholders.length && (
                <Input
                  size="middle"
                  style={{ width: 160, margin: "0 6px" }}
                  value={localAnswer.userAnswer?.[idx] || ""}
                  onChange={(e) =>
                    handleFillBlankInputChange(
                      question._id || "",
                      idx,
                      e.target.value
                    )
                  }
                  placeholder={`Blank ${idx + 1}`}
                />
              )}
            </React.Fragment>
          ))}
        </Paragraph>
      );
    }

    return (
      <Paragraph
        dangerouslySetInnerHTML={{ __html: cleanString(question.content) }}
      />
    );
  };

  return (
    <Card className="mb-4 shadow" bodyStyle={{ padding: "24px" }}>
      <Title
        level={5}
        style={{
          whiteSpace: "normal",
          wordBreak: "break-word", // đảm bảo nội dung không tràn
          fontSize: "16px",
          lineHeight: "1.5",
          marginBottom: 16,
        }}
      >
        {questionType === "6742fb3bd56a2e75dbd817ec" ? (
          renderFillInBlankContent()
        ) : (
          <span
            dangerouslySetInnerHTML={{
              __html: cleanString(question.content),
            }}
          />
        )}
      </Title>

      <div className="mt-2">
        {questionType === "6742fb1cd56a2e75dbd817ea" ? (
          <Radio.Group
            onChange={(e) =>
              handleCheckboxChange(question._id || "", e.target.value)
            }
            value={localAnswer.selectedAnswerId}
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {question.answers?.map((answer) => (
              <Radio key={answer._id} value={answer._id}>
                <span
                  dangerouslySetInnerHTML={{
                    __html: cleanString(answer.text || ""),
                  }}
                />
              </Radio>
            ))}
          </Radio.Group>
        ) : (
          (() => {
            const placeholderRegex = /_+\d+_+/g;
            const matched = question.content.match(placeholderRegex);
            if (matched && matched.length === (question.answers?.length || 0))
              return null;

            return (
              <div className="fill-blank-separate">
                {question.answers?.map((_, idx) => (
                  <div key={idx} className="mb-2">
                    <Input
                      value={localAnswer.userAnswer?.[idx] || ""}
                      onChange={(e) =>
                        handleFillBlankInputChange(
                          question._id || "",
                          idx,
                          e.target.value
                        )
                      }
                      placeholder={`Blank ${idx + 1}`}
                    />
                  </div>
                ))}
              </div>
            );
          })()
        )}
      </div>

      {question.audioInfo && (
        <Card
          size="small"
          className="mt-4"
          title="Phần nghe"
          headStyle={{ backgroundColor: "#f6ffed", borderColor: "#b7eb8f" }}
        >
          <audio controls className="mb-3">
            <source
              src={
                typeof question.audioInfo.filePath === "string"
                  ? question.audioInfo.filePath
                  : ""
              }
              type="audio/mpeg"
            />
          </audio>
          <Paragraph>
            <Text strong>Giải thích:</Text>{" "}
            {cleanString(question.audioInfo.description || "")}
          </Paragraph>
          <Paragraph>
            <Text strong>Dịch:</Text>{" "}
            {cleanString(question.audioInfo.transcription || "")}
          </Paragraph>
        </Card>
      )}
    </Card>
  );
};

export default QuestionSubmit;
