import React from "react";
import { QuestionAnswerResult } from "@/services/student";
import { cleanString } from "@/utils/cn";
import { Card, Tag, Typography } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
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
    (question as any).blankAnswer ||
    (question as any).correctAnswerForBlank;

  const isTrueFalseNotGiven =
    question.correctAnswerForTrueFalseNGV !== undefined &&
    question.correctAnswerForTrueFalseNGV !== null;

  const isSkipped = (question as any).isSkipped === true;

  // Function to clean HTML and extract text
  const getCleanText = (htmlString: string) => {
    if (!htmlString) return "";
    const text = htmlString.replace(/<[^>]*>/g, "");
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
  };

  return (
    <Card className="question-answer-card">
      <div style={{ marginBottom: "1rem" }}>
        {isSkipped ? (
          <Tag
            icon={<QuestionCircleOutlined />}
            color="warning"
            style={{ fontSize: "0.875rem", padding: "4px 12px" }}
          >
            Câu bỏ qua
          </Tag>
        ) : question.isCorrect ? (
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

      {isSkipped ? (
        <div>
          <div
            style={{
              padding: "1rem",
              background: "#fff7e6",
              borderRadius: "8px",
              border: "1px solid #ffc53d",
              marginBottom: "1rem",
            }}
          >
            <AntText
              type="warning"
              style={{ fontWeight: 600, fontSize: "0.9375rem" }}
            >
              ⚠️ Bạn đã bỏ qua câu hỏi này
            </AntText>
          </div>

          {/* Hiển thị đáp án đúng cho câu bỏ qua */}
          <div style={{ marginTop: "1rem" }}>
            <AntText
              strong
              style={{
                display: "block",
                marginBottom: "0.75rem",
                color: "#1f2937",
              }}
            >
              Đáp án đúng:
            </AntText>

            {isTrueFalseNotGiven ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {["true", "false", "not given"].map((choice) => {
                  const isCorrectChoice =
                    question.correctAnswerForTrueFalseNGV?.includes(choice);
                  return (
                    <div
                      key={choice}
                      className={`answer-option ${
                        isCorrectChoice ? "correct" : "neutral"
                      }`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <AntText strong>{choice.toUpperCase()}</AntText>
                      {isCorrectChoice && (
                        <Tag color="success" style={{ margin: 0 }}>
                          Đáp án đúng
                        </Tag>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : isFillInTheBlank ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {(question.correctAnswerForBlank ||
                (question as any).blankAnswer
                  ? Array.isArray(question.correctAnswerForBlank)
                    ? question.correctAnswerForBlank
                    : [
                        question.correctAnswerForBlank ||
                          (question as any).blankAnswer,
                      ]
                  : []
                ).map((correctAns: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      background: "#d1fae5",
                      padding: "0.75rem",
                      borderRadius: "6px",
                      border: "1px solid #10b981",
                    }}
                  >
                    <AntText
                      strong
                      style={{ display: "block", marginBottom: "0.25rem" }}
                    >
                      Đáp án {index + 1}:
                    </AntText>
                    <AntText style={{ color: "#059669", fontWeight: 600 }}>
                      {getCleanText(correctAns)}
                    </AntText>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {/* HIỂN THỊ ĐỦ TẤT CẢ ĐÁP ÁN - không giới hạn 4 */}
                {(question.answers || []).map((answer) => (
                  <div
                    key={answer._id}
                    className={`answer-option ${
                      answer.isCorrect ? "correct" : "neutral"
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
                    {answer.isCorrect && (
                      <Tag color="success" style={{ margin: 0 }}>
                        Đáp án đúng
                      </Tag>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : isTrueFalseNotGiven ? (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          {["true", "false", "not given"].map((choice) => (
            <div
              key={choice}
              className={`answer-option ${
                question.correctAnswerForTrueFalseNGV?.includes(choice)
                  ? "correct"
                  : question.selectedAnswerId === choice ||
                    question.userAnswers?.some(
                      (ua: any) => ua.userAnswer === choice
                    )
                  ? "incorrect"
                  : "neutral"
              }`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <AntText strong>{choice.toUpperCase()}</AntText>
              {question.correctAnswerForTrueFalseNGV?.includes(choice) && (
                <Tag color="success" style={{ margin: 0 }}>
                  Đúng
                </Tag>
              )}
              {(question.selectedAnswerId === choice ||
                question.userAnswers?.some(
                  (ua: any) => ua.userAnswer === choice
                )) &&
                !question.correctAnswerForTrueFalseNGV?.includes(choice) && (
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
                        <span>
                          {getCleanText(userAnsObj?.userAnswer || "Không có")}
                        </span>
                      </AntText>
                      <AntText style={{ display: "block" }}>
                        Đáp án đúng:{" "}
                        <AntText strong style={{ color: "#52c41a" }}>
                          <span>
                            {getCleanText(
                              answer.correctAnswerForBlank ||
                                (question as any).blankAnswer ||
                                ""
                            )}
                          </span>
                        </AntText>
                      </AntText>
                    </div>
                  </div>
                );
              })
            : question.userAnswers?.map((userAns: any, index: number) => (
                <div
                  key={userAns._id || index}
                  style={{
                    background: "#fafafa",
                    padding: "0.75rem",
                    borderRadius: "6px",
                  }}
                >
                  <AntText strong>Đáp án {index + 1}:</AntText>
                  <AntText type="secondary" style={{ marginLeft: "0.5rem" }}>
                    <span>{getCleanText(userAns.userAnswer)}</span>
                  </AntText>
                </div>
              ))}
        </div>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          {/* HIỂN THỊ ĐỦ TẤT CẢ ĐÁP ÁN - không giới hạn 4 */}
          {(question.answers || []).map((answer) => (
            <div
              key={answer._id}
              className={`answer-option ${
                question.selectedAnswerId === answer._id
                  ? "boder-dap-an-chon"
                  : ""
              } ${answer.isCorrect ? "correct" : ""} ${
                question.selectedAnswerId === answer._id && !answer.isCorrect
                  ? "incorrect"
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
