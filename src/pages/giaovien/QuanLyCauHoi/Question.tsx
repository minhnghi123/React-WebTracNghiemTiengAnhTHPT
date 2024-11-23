import type { Question } from "@/services/teacher";
import { cleanString } from "@/utils/cn";
import { Divider, Flex, Tag } from "antd";
import clsx from "clsx";
import "./cauhoi.css";
import { useState } from "react";
import UpdateQuestionModal from "./CreateQuestion/UpdateQuestion";
type QuestionComponentProps = {
  question: Question;
  onUpdateSuccess: () => void;
};

const QuestionComponent: React.FC<QuestionComponentProps> = ({
  onUpdateSuccess,
  question,
}) => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h3 className="text-xl font-bold mb-2" style={{ whiteSpace: "pre-wrap" }}>
        {cleanString(question.content)}
      </h3>{" "}
      <div className="mt-1">
        {question.answers.map((answer) => (
          <div
            key={answer._id}
            className={`ml-2 rounded mb-2 ${
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
            question.level === "easy" && "green",
            question.level === "medium" && "yellow",
            question.level === "hard" && "red"
          )}
          className="type-question"
        >
          {question.level}
        </Tag>
        <Tag color="blue">{question.subject}</Tag>
        <Tag color="cyan">{question.knowledge}</Tag>
      </Flex>
      <hr />
      <p
        className="text-sm text-gray-600 mb-2"
        style={{ whiteSpace: "pre-wrap" }}
      >
        <span style={{ fontWeight: "bold" }}>Giải thích: </span>
        {cleanString(question.explanation)}
      </p>
      <p
        className="text-sm text-gray-600 mb-2"
        style={{ whiteSpace: "pre-wrap" }}
      >
        <span style={{ fontWeight: "bold" }}>Dịch: </span>
        {cleanString(question.translation)}
      </p>
      <hr />
      <button className="btn btn-primary" onClick={() => setOpenModal(true)}>
        Sửa câu hỏi
      </button>
      <UpdateQuestionModal
        onUpdateSuccess={onUpdateSuccess}
        visible={openModal}
        handleClose={() => setOpenModal(false)}
        question2={question}
      />
    </div>
  );
};

export default QuestionComponent;
