import React from "react";
import { QuestionAnswerResult } from "@/services/student";
import { cleanString } from "@/utils/cn";
import { Divider } from "antd";
import "./question.css";

type QuestionComponentProps = {
  question: QuestionAnswerResult;
};

const QuestionAnswerComponent: React.FC<QuestionComponentProps> = ({ question }) => {
  // Xác định loại câu hỏi:
  // - Nếu mảng answers rỗng (điền khuyết chỉ có userAnswers) 
  // - Hoặc có ít nhất 1 phần tử trong answers có trường correctAnswerForBlank khác rỗng
  // - Hoặc trường blankAnswer có tồn tại (đối với một số câu hỏi nghe)
  const isFillInTheBlank =
    question.answers.length === 0 ||
    question.answers.some(
      (ans) => ans.correctAnswerForBlank && ans.correctAnswerForBlank.trim() !== ""
    ) ||
    // Nếu có trường blankAnswer thì cũng coi là dạng điền khuyết
    (question as any).blankAnswer;

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      {question.isCorrect ? (
        <Divider orientation="left" style={{ borderColor: "#7cb305" }}>
          Đáp án chọn đúng
        </Divider>
      ) : (
        <Divider orientation="left" style={{ borderColor: "#ff0000" }}>
          Đáp án chọn sai
        </Divider>
      )}

      <h3 className="text-xl font-bold mb-2" style={{ whiteSpace: "pre-wrap" }}>
        <span
          dangerouslySetInnerHTML={{ __html: cleanString(question.content || (question as any).questionText) }}
        />
      </h3>

      {isFillInTheBlank ? (
        // Hiển thị cho câu hỏi điền khuyết
        <>
          {question.answers && question.answers.length > 0 ? (
            question.answers.map((answer, index) => {
              const userAnsObj = question.userAnswers && question.userAnswers[index];
              return (
                <div
                  key={answer._id}
                  className="ml-2 rounded my-2 p-2 border flex flex-col"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  <div>
                    <strong>Đáp án {index + 1}:</strong>
                  </div>
                  <div>
                    <span>
                      <em>Đáp án của bạn:</em>{" "}
                      {userAnsObj ? userAnsObj.userAnswer : ""}
                    </span>
                  </div>
                  <div>
                    <span>
                      <em>Đáp án chính xác:</em>{" "}
                      {answer.correctAnswerForBlank || (question as any).blankAnswer || ""}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            // Nếu không có đáp án trong answers, hiển thị từ userAnswers
            question.userAnswers.map((userAns, index) => (
              <div
                key={userAns._id}
                className="ml-2 rounded my-2 p-2 border flex flex-col"
                style={{ whiteSpace: "pre-wrap" }}
              >
                <div>
                  <strong>Đáp án {index + 1}:</strong>
                </div>
                <div>
                  <span>
                    <em>Đáp án của bạn:</em> {userAns.userAnswer}
                  </span>
                </div>
              </div>
            ))
          )}
        </>
      ) : (
        // Hiển thị cho câu hỏi trắc nghiệm hoặc Yes/No
        <>
          {question.answers.map((answer) => (
            <div key={answer._id}>
              <div
                className={`ml-2 rounded my-2 d-flex justify-content-between align-items-center 
                ${question.selectedAnswerId === answer._id ? "boder-dap-an-chon" : ""} 
                ${answer.isCorrect ? "bg-green-100" : "bg-red-100"}`}
                style={{ whiteSpace: "pre-wrap" }}
              >
                <span>{cleanString(answer.text)}</span>
                <span>
                  <strong>
                    {question.selectedAnswerId === answer._id && "Đáp án chọn"}
                  </strong>
                </span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default QuestionAnswerComponent;
