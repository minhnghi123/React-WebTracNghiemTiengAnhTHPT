import React from "react";
import { QuestionAnswerResult, Result } from "@/services/student";
import QuestionAnswerComponent from "./QuestionAnswer";


interface ChiTietKetQuaProps {
  result: Result;
}

const ChiTietKetQua: React.FC<ChiTietKetQuaProps> = ({ result }) => {
  return (
    <div className="container mx-auto p-4">
      <center>
        <h1 className="text-3xl font-bold">
          Chi tiết kết quả{" "}
          {typeof result.examId === "object"
            ? result.examId.title
            : result.examId}
        </h1>
      </center>
      <div>
        {result.score} / {result.questions.length}
      </div>
      {result.questions &&
        (result.questions as unknown as QuestionAnswerResult[]).map(
          (item: QuestionAnswerResult) => (
            <QuestionAnswerComponent question={item} key={item._id} />
          )
        )}
    </div>
  );
};

export default ChiTietKetQua;
