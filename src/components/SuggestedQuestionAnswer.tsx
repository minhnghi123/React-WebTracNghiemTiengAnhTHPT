import React from "react";
import { Question } from "@/types/interface";
import { cleanString } from "@/utils/cn";
import { Card, Tag, Typography, Radio } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";

const { Title, Text: AntText } = Typography;

type SuggestedQuestionAnswerProps = {
  question: Question;
};

const SuggestedQuestionAnswer: React.FC<SuggestedQuestionAnswerProps> = ({
  question,
}) => {
  const isFillInTheBlank =
    question.answers?.length === 0 ||
    question.answers?.some(
      (ans) =>
        ans.correctAnswerForBlank && ans.correctAnswerForBlank.trim() !== ""
    );

  const isTrueFalseNotGiven =
    question.correctAnswerForTrueFalseNGV !== undefined &&
    question.correctAnswerForTrueFalseNGV !== null;

  // Function to clean HTML and extract text
  const getCleanText = (htmlString: string) => {
    if (!htmlString) return "";
    // Remove HTML tags
    const text = htmlString.replace(/<[^>]*>/g, "");
    // Decode HTML entities
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
  };

  return (
    <Card
      className="suggested-question-answer-card"
      style={{
        background: "white",
        borderRadius: "12px",
        marginBottom: "1rem",
      }}
    >
      {/* Question Content */}
      <Title
        level={5}
        style={{
          fontSize: "1rem",
          fontWeight: 600,
          marginBottom: "1.5rem",
          color: "#1f2937",
          lineHeight: 1.6,
        }}
      >
        <span
          dangerouslySetInnerHTML={{
            __html: cleanString(question.content || ""),
          }}
        />
      </Title>

      {/* Answer Section */}
      <div style={{ marginBottom: "1.5rem" }}>
        <AntText
          strong
          style={{
            display: "block",
            marginBottom: "1rem",
            color: "#059669",
            fontSize: "0.9375rem",
          }}
        >
          <CheckCircleOutlined style={{ marginRight: "0.5rem" }} />
          Đáp án đúng:
        </AntText>

        {isTrueFalseNotGiven ? (
          // True/False/Not Given Questions
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {["true", "false", "not given"].map((choice) => {
              const isCorrect =
                question.correctAnswerForTrueFalseNGV?.includes(choice);
              return (
                <div
                  key={choice}
                  style={{
                    padding: "0.875rem 1rem",
                    borderRadius: "8px",
                    border: `2px solid ${isCorrect ? "#10b981" : "#e5e7eb"}`,
                    background: isCorrect ? "#d1fae5" : "#f9fafb",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <AntText
                    strong
                    style={{ color: isCorrect ? "#059669" : "#6b7280" }}
                  >
                    {choice.toUpperCase()}
                  </AntText>
                  {isCorrect && (
                    <Tag color="success" style={{ margin: 0 }}>
                      Đáp án đúng
                    </Tag>
                  )}
                </div>
              );
            })}
          </div>
        ) : isFillInTheBlank ? (
          // Fill in the Blank Questions
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {(question.answers || []).map((answer, index) => {
              if (
                !answer.correctAnswerForBlank ||
                !answer.correctAnswerForBlank.trim()
              ) {
                return null;
              }
              return (
                <div
                  key={answer._id || index}
                  style={{
                    background: "#d1fae5",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: "1px solid #10b981",
                  }}
                >
                  <AntText
                    strong
                    style={{
                      display: "block",
                      marginBottom: "0.375rem",
                      color: "#059669",
                    }}
                  >
                    Đáp án {index + 1}:
                  </AntText>
                  <AntText style={{ color: "#047857", fontWeight: 600 }}>
                    {getCleanText(answer.correctAnswerForBlank)}
                  </AntText>
                </div>
              );
            })}
          </div>
        ) : (
          // Multiple Choice Questions
          <Radio.Group
            value={question.answers?.find((ans) => ans.isCorrect)?._id || null}
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            {(question.answers || []).map((answer) => (
              <div
                key={answer._id}
                style={{
                  padding: "0.875rem 1rem",
                  borderRadius: "8px",
                  border: `2px solid ${
                    answer.isCorrect ? "#10b981" : "#e5e7eb"
                  }`,
                  background: answer.isCorrect ? "#d1fae5" : "#f9fafb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Radio
                  value={answer._id}
                  disabled
                  style={{
                    width: "100%",
                    color: answer.isCorrect ? "#059669" : "#6b7280",
                  }}
                >
                  <span
                    dangerouslySetInnerHTML={{
                      __html: cleanString(answer.text || ""),
                    }}
                  />
                </Radio>
                {answer.isCorrect && (
                  <Tag
                    color="success"
                    style={{ margin: 0, marginLeft: "0.5rem" }}
                  >
                    Đáp án đúng
                  </Tag>
                )}
              </div>
            ))}
          </Radio.Group>
        )}
      </div>

      {/* Explanation Section */}
      {question.explanation && (
        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            background: "#eff6ff",
            borderRadius: "8px",
            border: "1px solid #bfdbfe",
          }}
        >
          <AntText
            strong
            style={{
              display: "block",
              marginBottom: "0.75rem",
              color: "#1e40af",
              fontSize: "0.9375rem",
            }}
          >
            💡 Giải thích:
          </AntText>
          <div
            style={{
              fontSize: "0.9375rem",
              lineHeight: 1.7,
              color: "#1f2937",
            }}
            dangerouslySetInnerHTML={{
              __html: cleanString(question.explanation),
            }}
          />
        </div>
      )}

      {/* Audio Section */}
      {question.audio && (
        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            background: "#f0fdf4",
            borderRadius: "8px",
            border: "1px solid #bbf7d0",
          }}
        >
          <AntText
            strong
            style={{
              display: "block",
              marginBottom: "0.75rem",
              color: "#15803d",
              fontSize: "0.9375rem",
            }}
          >
            🎧 Phần nghe:
          </AntText>
          <audio
            controls
            style={{
              width: "100%",
              marginBottom: "0.75rem",
              borderRadius: "8px",
            }}
          >
            <source
              src={
                typeof question.audio === "string"
                  ? question.audio
                  : (question.audio as any)?.filePath
              }
              type="audio/mpeg"
            />
          </audio>
          {(question.audio as any)?.description && (
            <div style={{ marginBottom: "0.5rem" }}>
              <AntText strong style={{ color: "#15803d" }}>
                Giải thích:{" "}
              </AntText>
              <AntText style={{ color: "#166534" }}>
                {getCleanText((question.audio as any).description)}
              </AntText>
            </div>
          )}
          {(question.audio as any)?.transcription && (
            <div>
              <AntText strong style={{ color: "#15803d" }}>
                Dịch:{" "}
              </AntText>
              <AntText style={{ color: "#166534" }}>
                {getCleanText((question.audio as any).transcription)}
              </AntText>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default SuggestedQuestionAnswer;
