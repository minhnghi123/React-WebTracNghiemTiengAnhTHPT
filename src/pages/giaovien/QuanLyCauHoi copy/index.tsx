import { useState } from "react";
import ListYesNo from "./listYesNo";
import { ListBlank } from "./listBlank";

export const QuanLyCauHoi = () => {
  const [questionType, setQuestionType] = useState<string>(
    "6742fb1cd56a2e75dbd817ea"
  );

  return (
    <div className="container mx-auto p-4">
      <center>
        <h1 className="text-3xl font-bold ">Ngân hàng câu hỏi</h1>
      </center>
      <div>
        <button
          className="btn btn-primary  my-3 mx-3"
          onClick={() => {
            setQuestionType("6742fb1cd56a2e75dbd817ea");
          }}
        >
          Câu hỏi trắc nghiệm đáp án
        </button>
        <button
          className="btn btn-primary  my-3"
          onClick={() => {
            setQuestionType("6742fb1cd56a2e75dbd817ec");
          }}
        >
          Câu hỏi điền khuyết
        </button>
      </div>
      {questionType === "6742fb1cd56a2e75dbd817ea" ? (
        <ListYesNo />
      ) : (
        <ListBlank />
      )}
    </div>
  );
};

export default QuanLyCauHoi;
