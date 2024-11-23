import { useState, useEffect } from "react";
import { Pagination } from "antd";
import QuestionComponent from "./Question";
import CreateQuestionModal from "./CreateQuestion/CreateQuestion"; // Import the modal component
import { Question, Teacher } from "@/services/teacher";

export const QuanLyCauHoi = () => {
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [data, setData] = useState<Question[]>();
  const [showModal, setShowModal] = useState<boolean>(false);

  const getAllQuestions = async (page: number) => {
    try {
      const rq = await Teacher.getAllQuestions(page);
      console.log(rq);
      if (rq?.code === 200) {
        setData(rq?.questions);
        setTotal(rq?.totalPage);
        setPage(rq?.currentPage);
      }
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  };

  useEffect(() => {
    getAllQuestions(page);
  }, [page]);

  const onPageChange = (page: number) => {
    setPage(page);
  };
  const handleUpdateSuccess = () => {
    getAllQuestions(page);
  };
  return (
    <div className="container mx-auto p-4">
      <center>
        <h1 className="text-3xl font-bold ">Ngân hàng câu hỏi</h1>
      </center>
      <div>
        <button
          className="btn btn-primary  my-3"
          onClick={() => setShowModal(true)}
        >
          Thêm câu hỏi
        </button>
      </div>
      {data
        ? data.map((item) => (
            <QuestionComponent
              onUpdateSuccess={handleUpdateSuccess}
              question={item}
            />
          ))
        : null}
      <div className="flex justify-center mt-4">
        <Pagination
          current={page}
          total={total}
          onChange={onPageChange}
          pageSize={10}
        />
      </div>
      <CreateQuestionModal
        visible={showModal}
        handleClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default QuanLyCauHoi;
