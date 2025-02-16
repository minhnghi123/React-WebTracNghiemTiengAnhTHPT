import React, { useEffect, useState } from "react";
import { Button, Card, Space, Spin, message } from "antd";
import { useNavigate } from "react-router-dom";
import { FlashCardAPI, FlashCardSet } from "@/services/student/FlashCardAPI";
import "./FlashCardcss.css";

export const FlashCardIndex: React.FC = () => {
  const [flashCardSets, setFlashCardSets] = useState<FlashCardSet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlashcardSets = async () => {
      try {
        const res = await FlashCardAPI.getAllFlashCardSets();
        setFlashCardSets(res.flashCardSets ? res.flashCardSets : res);
      } catch (error) {
        console.error("Lỗi khi lấy flashcard sets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcardSets();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const handleExam = (id: string) => {
    navigate(`/flashcard/${id}`);
  };

  const handleEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    navigate(`/flashcard/edit/${id}`);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc muốn xóa flashcard này không?")) {
      try {
       const rq=  await FlashCardAPI.deleteFlashCardSet(id);
       console.log(rq);
        if(rq.code===200){ 
       message.success("Flashcard đã được xóa");
        }
        else message.error(rq.message);
        setFlashCardSets((prev) => prev.filter((set) => set._id !== id));
      } catch (error) {
        console.error("Xóa flashcard thất bại", error);
        message.error("Xóa flashcard thất bại");
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Trang Ôn Tập</h1>
      <button
        className="btn btn-primary my-3 mx-3"
        onClick={() => {
          navigate("/flashcard/create");
        }}
      >
        Tạo FlashCard mới
      </button>
      <hr />
      <h2>
        <center>Bộ từ vựng có sẵn</center>
      </h2>
      <div
        className="flash-card-grid"
        style={{ margin: "1rem", }}
      >
        {flashCardSets.map((set) => (
          <div
            key={set._id}
            className="flash-card-link cursor-pointer"
            onClick={() => set._id && handleExam(set._id)}
          >
            <Card
              hoverable
              title={set.title}
              className="shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              <p>{set.description}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-500 text-sm">
                  Số lượng từ vựng: {set.vocabs.length}
                </span>
                <div className="flex space-x-2">
                  <Space size={"small"}>
                <Button
                    color="default"
                    variant="outlined"
                    style={{ backgroundColor: "orange" }}
                    onClick={(e) => handleEdit(set._id || "", e)}
                  >
                    Sửa 
                  </Button>
                  <Button
                    color="danger"
                    variant="solid"
                    onClick={(e) => handleDelete(set._id || "", e)}
                  >
                    Xóa
                  </Button>
                  </Space>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};
