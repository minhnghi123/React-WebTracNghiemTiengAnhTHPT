import { QuestionAnswerResult } from "@/services/student";
import { cleanString } from "@/utils/cn";
import { Divider } from "antd";
import "./question.css";
type QuestionComponentProps = {
  question: QuestionAnswerResult;
};

const QuestionAnserComponent: React.FC<QuestionComponentProps> = ({
  question,
}) => {
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
          dangerouslySetInnerHTML={{ __html: cleanString(question.content) }}
        />
      </h3>{" "}
      {question.answers.map((answer) => (
        <div>
          <div
            key={answer._id}
            className={`ml-2 rounded my-2 d-flex justify-content-between align-items-center ${`${
              question.selectedAnswerId === answer._id
                ? "boder-dap-an-chon"
                : ""
            } 
              ${answer.isCorrect ? "bg-green-100" : "bg-red-100"}`}`}
            style={{ whiteSpace: "pre-wrap" }}
          >
            <span>{cleanString(answer.text)} </span>
            <span>
              <strong>
                {question.selectedAnswerId === answer._id && "Đáp án chọn"}
              </strong>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuestionAnserComponent;
