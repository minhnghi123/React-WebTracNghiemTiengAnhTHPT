import { useState, useEffect } from "react";
import { Button } from "antd";
import { ListeningQuestion, listenQuestionAPI } from "@/services/teacher/ListeningQuestion";
import { ListeningQuestionComponent } from "./ListeningQuestion";
import CreateListeningQuestionModal from "./CreateQuestion/CreateListeningQuestion";

export const ListListening = () => {
  const [data, setData] = useState<ListeningQuestion[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);

  const getAllQuestions = async () => {
    try {
      const rq = await listenQuestionAPI.getAllListeningQuestions();
      console.log("listening", rq);
      // Giả sử API trả về { message: string, data: ListeningQuestion[] }
      if (rq.data) {
        // Chuyển _id thành id cho phù hợp với interface ListeningQuestion
        const questions = rq.data.map((q: any) => ({ ...q, id: q._id ? q._id : "" }));
        setData(questions);
        // Nếu có thông tin phân trang từ API thì setTotal, setPage tương ứng
      } else {
        setData([]);
      }
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.message);
      }
    }
  };

  useEffect(() => {
    getAllQuestions();
  }, []);

  const handleUpdateSuccess = () => {
    // Refresh danh sách sau khi cập nhật hoặc xóa câu hỏi
    getAllQuestions();
  };

  return (
    <div className="container mx-auto p-4">
      <div>
        <Button type="primary" className="my-3" onClick={() => setShowModal(true)}>
          Thêm câu hỏi
        </Button>
      </div>
      {data && data.map((item) => (
        <ListeningQuestionComponent
          key={item.id}
          question={item}
          onUpdateSuccess={handleUpdateSuccess}
        />
      ))}
      {/* Bạn có thể triển khai CreateQuestionModal cho chức năng thêm câu hỏi */}
      <CreateListeningQuestionModal
        visible={showModal}
        handleClose={() => {
          setShowModal(false);
          getAllQuestions();
          }}
          onCreateSuccess={getAllQuestions}
        />
    </div>
  );
};

export default ListListening;
