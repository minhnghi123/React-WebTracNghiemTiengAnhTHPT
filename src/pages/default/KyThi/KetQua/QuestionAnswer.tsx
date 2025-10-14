import React from "react";
import { QuestionAnswerResult } from "@/services/student";
import { cleanString } from "@/utils/cn";
import { Card, Tag, Typography } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import "./question.css";

const { Title, Text: AntText } = Typography;

type QuestionComponentProps = {
  question: QuestionAnswerResult;
};

const QuestionAnswerComponent: React.FC<QuestionComponentProps> = ({
  question,
}) => {
  const isFillInTheBlank =
    question.answers.length === 0 ||
    question.answers.some(
      (ans) =>
        ans.correctAnswerForBlank && ans.correctAnswerForBlank.trim() !== ""
    ) ||
    (question as any).blankAnswer;

  const isTrueFalseNotGiven =
    question.correctAnswerForTrueFalseNGV !== undefined;

  return (
    <Card className="question-answer-card">
      <div style={{ marginBottom: "1rem" }}>
        {question.isCorrect ? (
          <Tag
            icon={<CheckCircleOutlined />}
            color="success"
            style={{ fontSize: "0.875rem", padding: "4px 12px" }}
          >
            Đáp án đúng
          </Tag>
        ) : (
          <Tag
            icon={<CloseCircleOutlined />}
            color="error"
            style={{ fontSize: "0.875rem", padding: "4px 12px" }}
          >
            Đáp án sai
          </Tag>
        )}
      </div>

      <Title
        level={5}
        style={{
          fontSize: "1rem",
          fontWeight: 600,
          marginBottom: "1rem",
          color: "#1a1a1a",
        }}
      >
        <span
          dangerouslySetInnerHTML={{
            __html: cleanString(
              question.content || (question as any).questionText
            ),
          }}
        />
      </Title>

      {isTrueFalseNotGiven ? (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          {["true", "false", "not given"].map((choice) => (
            <div
              key={choice}
              className={`answer-option ${
                question.correctAnswerForTrueFalseNGV === choice
                  ? "bg-green-100"
                  : question.selectedAnswerId === choice
                  ? "bg-red-100"
                  : ""
              }`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <AntText strong>{choice.toUpperCase()}</AntText>
              {question.correctAnswerForTrueFalseNGV === choice && (
                <Tag color="success" style={{ margin: 0 }}>
                  Đúng
                </Tag>
              )}
              {question.selectedAnswerId === choice &&
                question.correctAnswerForTrueFalseNGV !== choice && (
                  <Tag color="error" style={{ margin: 0 }}>
                    Sai
                  </Tag>
                )}
            </div>
          ))}
        </div>
      ) : isFillInTheBlank ? (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {question.answers && question.answers.length > 0
            ? question.answers.map((answer, index) => {
                const userAnsObj =
                  question.userAnswers && question.userAnswers[index];
                return (
                  <div
                    key={answer._id}
                    style={{
                      background: "#fafafa",
                      padding: "0.75rem",
                      borderRadius: "6px",
                    }}
                  >
                    <AntText
                      strong
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Đáp án {index + 1}:
                    </AntText>
                    <div style={{ marginLeft: "1rem" }}>
                      <AntText
                        type="secondary"
                        style={{
                          display: "block",
                          marginBottom: "0.25rem",
                        }}
                      >
                        Câu trả lời của bạn:{" "}
                        <span
                          dangerouslySetInnerHTML={{
                            __html: cleanString(
                              userAnsObj?.userAnswer || "Không có"
                            ),
                          }}
                        />
                      </AntText>
                      <AntText style={{ display: "block" }}>
                        Đáp án đúng:{" "}
                        <AntText strong style={{ color: "#52c41a" }}>
                          <span
                            dangerouslySetInnerHTML={{
                              __html: cleanString(
                                answer.correctAnswerForBlank ||
                                  (question as any).blankAnswer ||
                                  ""
                              ),
                            }}
                          />
                        </AntText>
                      </AntText>
                    </div>
                  </div>
                );
              })
            : question.userAnswers.map((userAns, index) => (
                <div
                  key={userAns._id}
                  style={{
                    background: "#fafafa",
                    padding: "0.75rem",
                    borderRadius: "6px",
                  }}
                >
                  <AntText strong>Đáp án {index + 1}:</AntText>
                  <AntText type="secondary" style={{ marginLeft: "0.5rem" }}>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: cleanString(userAns.userAnswer),
                      }}
                    />
                  </AntText>
                </div>
              ))}
        </div>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          {question.answers.map((answer) => (
            <div
              key={answer._id}
              className={`answer-option ${
                question.selectedAnswerId === answer._id
                  ? "boder-dap-an-chon"
                  : ""
              } ${answer.isCorrect ? "bg-green-100" : ""} ${
                question.selectedAnswerId === answer._id && !answer.isCorrect
                  ? "bg-red-100"
                  : ""
              }`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                dangerouslySetInnerHTML={{
                  __html: cleanString(answer.text),
                }}
              />
              {question.selectedAnswerId === answer._id && (
                <Tag
                  color={answer.isCorrect ? "success" : "error"}
                  style={{ margin: 0 }}
                >
                  {answer.isCorrect ? "Đúng" : "Đã chọn"}
                </Tag>
              )}
              {answer.isCorrect && question.selectedAnswerId !== answer._id && (
                <Tag color="success" style={{ margin: 0 }}>
                  Đáp án đúng
                </Tag>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default QuestionAnswerComponent;
