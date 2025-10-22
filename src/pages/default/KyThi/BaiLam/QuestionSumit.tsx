import React, { useState, useEffect } from "react";
import { Input, Radio, Card, Typography } from "antd";
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
  viewOnly?: boolean; // Add viewOnly prop
  questionIndex: number; // Add questionIndex prop
};

const QuestionSubmit: React.FC<QuestionComponentProps> = ({
  question,
  questionType,
  onAnswerChange,
  currentAnswer,
  index,
  viewOnly = false,
  questionIndex,
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
    if (viewOnly) return;
    const newAnswer: UserAnswer = { questionId, selectedAnswerId };
    setLocalAnswer(newAnswer);
    onAnswerChange(newAnswer); // ✅ KHÔNG gửi questionType
  };

  const handleFillBlankInputChange = (
    questionId: string,
    index: number,
    value: string
  ) => {
    if (viewOnly) return;
    let currentUserAnswers: string[] = localAnswer.userAnswer
      ? [...localAnswer.userAnswer]
      : new Array(question.answers ? question.answers.length : 0).fill("");
    currentUserAnswers[index] = value;
    const newAnswer: UserAnswer = {
      questionId,
      userAnswer: currentUserAnswers,
    };
    setLocalAnswer(newAnswer);
    onAnswerChange(newAnswer); // ✅ KHÔNG gửi questionType
  };

  const handleTrueFalseChange = (questionId: string, value: string) => {
    if (viewOnly) return;
    const newAnswer: UserAnswer = { questionId, userAnswer: [value] };
    setLocalAnswer(newAnswer);
    onAnswerChange(newAnswer); // ✅ KHÔNG gửi questionType
  };

  const renderFillInBlankContent = () => {
    const placeholderRegex = /_+\d+_+/g;
    // console.log(question);
    const matchedPlaceholders =
      typeof question.content === "string"
        ? question.content.match(placeholderRegex)
        : null;

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
                  placeholder={`Điền khuyết ${idx + 1}`}
                  disabled={viewOnly} // Disable Input if viewOnly
                />
              )}
            </React.Fragment>
          ))}
        </Paragraph>
      );
    }

    return (
      <span
        dangerouslySetInnerHTML={{
          __html: cleanString(question.content),
        }}
      />
    );
  };

  return (
    <Card
      className="mb-4 shadow question-submit-card"
      styles={{ body: { padding: "24px" } }}
    >
      <Title
        level={5}
        className="question-title-submit"
        style={{
          whiteSpace: "normal",
          wordBreak: "break-word",
          fontSize: "16px",
          lineHeight: "1.6",
          marginBottom: 16,
          color: "#1f2937",
          fontWeight: 600,
        }}
      >
        <span className="question-number-badge">Câu {questionIndex}.</span>
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

      <div className="mt-2 question-options-container">
        {questionType === "6742fb1cd56a2e75dbd817ea" ? (
          <Radio.Group
            onChange={(e) =>
              handleCheckboxChange(question._id || "", e.target.value)
            }
            value={localAnswer.selectedAnswerId}
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            disabled={viewOnly}
          >
            {/* HIỂN THỊ ĐỦ SỐ ĐÁP ÁN THỰC TẾ - không giới hạn 4 */}
            {(question.answers || []).map((answer) => (
              <Radio key={answer._id} value={answer._id}>
                <span
                  dangerouslySetInnerHTML={{
                    __html: cleanString(answer.text || ""),
                  }}
                />
              </Radio>
            ))}
          </Radio.Group>
        ) : questionType === "6742fb5dd56a2e75dbd817ee" ? (
          <Radio.Group
            onChange={(e) =>
              handleTrueFalseChange(question._id || "", e.target.value)
            }
            value={localAnswer.userAnswer?.[0]}
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            disabled={viewOnly}
          >
            <Radio value="true">True</Radio>
            <Radio value="false">False</Radio>
            <Radio value="not_given">Not Given</Radio>
          </Radio.Group>
        ) : (
          (() => {
            const placeholderRegex = /_+\d+_+/g;
            const matched =
              typeof question.content === "string"
                ? question.content.match(placeholderRegex)
                : null;
            if (matched && matched.length === (question.answers?.length || 0))
              return null;

            return (
              <div className="fill-blank-separate">
                {(question.answers || []).map((_, idx) => (
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
                      placeholder={`Điền ${idx + 1}`}
                      disabled={viewOnly}
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
