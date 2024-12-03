import { QuestionAnswerResult, Result } from "@/services/student";
import QuestionAnserComponent from "./QuestionAnswer";

interface ChiTietKetQuaProps {
  result: Result;
}

const ChiTietKetQua = ({ result }: ChiTietKetQuaProps) => {
  return (
    <div className="container mx-auto p-4">
      <center>
        <h1 className="text-3xl font-bold ">
          Chi tiết kết quả{" "}
          {typeof result.examId === "object"
            ? result.examId.title
            : result.examId}
        </h1>
      </center>
      <div>
        {" "}
        {result.score} / {result.questions.length}
      </div>
      {result.questions
        ? (result.questions as unknown as QuestionAnswerResult[]).map(
            (item: QuestionAnswerResult) => (
              <QuestionAnserComponent question={item} key={item._id} />
            )
          )
        : null}
    </div>
  );
};

export default ChiTietKetQua;
