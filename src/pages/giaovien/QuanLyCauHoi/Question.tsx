import type { Question } from "@/services/teacher";
import { cleanString } from "@/utils/cn";
import { Divider, Flex, Tag } from "antd";
import clsx from "clsx";

const QuestionComponent: React.FC<Question> = ({
  content,
  level,
  answers,
  subject,
  knowledge,
  translation,
  explanation,
}) => {
  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h3 className="text-xl font-bold mb-2" style={{ whiteSpace: "pre-wrap" }}>
        {cleanString(content)}
      </h3>{" "}
      <div className="mt-4">
        {answers.map((answer) => (
          <div
            key={answer._id}
            className={`p-2 rounded mb-2 ${
              answer.isCorrect ? "bg-green-100" : "bg-red-100"
            }`}
            style={{ whiteSpace: "pre-wrap" }}
          >
            {cleanString(answer.text)}
          </div>
        ))}
      </div>
      <Divider orientation="left" style={{ borderColor: "#7cb305" }}>
        Loại câu hỏi
      </Divider>
      <Flex gap="10px 0" wrap>
        <Tag
          color={clsx(
            level === "easy" && "green",
            level === "medium" && "yellow",
            level === "hard" && "red"
          )}
          className="type-question"
        >
          {level}
        </Tag>
        <Tag color="blue">{subject}</Tag>
        <Tag color="cyan">{knowledge}</Tag>
      </Flex>
      <hr />
      <p
        className="text-sm text-gray-600 mb-2"
        style={{ whiteSpace: "pre-wrap" }}
      >
        <span style={{ fontWeight: "bold" }}>Giải thích: </span>
        {cleanString(explanation)}
      </p>
      <p
        className="text-sm text-gray-600 mb-2"
        style={{ whiteSpace: "pre-wrap" }}
      >
        <span style={{ fontWeight: "bold" }}>Dịch: </span>
        {cleanString(translation)}
      </p>
    </div>
  );
};

export default QuestionComponent;
