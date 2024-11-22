import { Question, Teacher } from "@/services/teacher";
import { useEffect, useState } from "react";
import { Pagination } from "antd";
import QuestionComponent from "./Question";

export const QuanLyCauHoi = () => {
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [data, setData] = useState<Question[]>();
  const getAllQuestions = async (page: number) => {
    try {
      const rq = await Teacher.getAllQuestions(page);
      setData(rq?.questions);

      if (rq?.code === 200) {
        setData(rq?.questions);
        console.log(rq?.questions);
        setTotal(rq?.totalPage);
        setPage(rq?.currentPage);
      }
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  };
  const onPageChange = (page: number) => {
    getAllQuestions(page);
  };
  useEffect(() => {
    getAllQuestions(page);
  }, []);
  return (
    <div className="">
      <h1 className="text-3xl font-bold text-center">Ngân hàng cua hỏi</h1>
      {data
        ? data.map((item) => (
            <div key={item._id}>
              {data?.map((item) => (
                <QuestionComponent
                  key={item._id}
                  _id={item._id}
                  content={item.content}
                  level={item.level}
                  answers={item.answers}
                  subject={item.subject}
                  knowledge={item.knowledge}
                  translation={item.translation}
                  explanation={item.explanation}
                  deleted={item.deleted}
                  createdAt={item.createdAt}
                />
              ))}
            </div>
          ))
        : null}
      <Pagination
        align="center"
        onChange={(page) => onPageChange(page)}
        defaultCurrent={page}
        total={total}
      />
    </div>
  );
};
