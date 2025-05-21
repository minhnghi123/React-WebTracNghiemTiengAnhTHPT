import React, { useEffect, useState } from "react";
import { Button, Card, Space, Spin, message } from "antd";
import { FlashCardAPI, FlashCardSet } from "@/services/student/FlashCardAPI";
import { useAuthContext } from "@/contexts/AuthProvider";
import "./FlashCardcss.css";
import AppLink from "@/components/AppLink";

export const FlashCardIndex: React.FC = () => {
  const [, setFlashCardSets] = useState<FlashCardSet[]>([]);
  const [myFlashCardSets, setMyFlashCardSets] = useState<FlashCardSet[]>([]);
  const [otherFlashCardSets, setOtherFlashCardSets] = useState<FlashCardSet[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchFlashcardSets = async () => {
      try {
        const res = await FlashCardAPI.getAllFlashCardSets();
        const allSets = res.flashCardSets ? res.flashCardSets : res;

        // Phân loại bộ từ vựng
        const mySets = allSets.filter(
          (set: FlashCardSet) => set.createdBy === user?._id
        );
        const otherSets = allSets.filter(
          (set: FlashCardSet) => set.createdBy !== user?._id
        );

        setFlashCardSets(allSets);
        setMyFlashCardSets(mySets);
        setOtherFlashCardSets(otherSets);
      } catch (error) {
        console.error("Lỗi khi lấy flashcard sets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcardSets();
  }, [user?._id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const handleExam = (id: string) => {
    window.location.href = `/flashcard/${id}`;
  };

  const handleEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `/flashcard/edit/${id}`;
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc muốn xóa flashcard này không?")) {
      try {
        const rq = await FlashCardAPI.deleteFlashCardSet(id);
        if (rq.code === 200) {
          message.success("Flashcard đã được xóa");
          setMyFlashCardSets((prev) => prev.filter((set) => set._id !== id));
        } else {
          message.error(rq.message);
        }
      } catch (error) {
        console.error("Xóa flashcard thất bại", error);
        message.error("Xóa flashcard thất bại");
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Ôn tập theo bộ từ vựng</h1>
      <p className="text-center text-gray-600 mb-4">
        Trang này cho phép bạn quản lý và sử dụng các bộ từ vựng. Bạn có thể tạo mới, chỉnh sửa, hoặc xóa các bộ từ vựng của mình. Ngoài ra, bạn cũng có thể truy cập các bộ từ vựng công khai khác để ôn tập.
      </p>
      <AppLink
        to="/flashcard/create"
        className="btn btn-primary my-3 mx-3"
      >
        Tạo bộ từ vựng mới
      </AppLink>
      <hr />
      <h2>
        <center>Bộ từ vựng của tôi</center>
      </h2>
      <div className="flash-card-grid" style={{ margin: "1rem" }}>
        {myFlashCardSets.map((set) => (
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
      <hr />
      <h2>
        <center>Bộ từ vựng có sẵn</center>
      </h2>
      <div className="flash-card-grid" style={{ margin: "1rem" }}>
        {otherFlashCardSets.map(
          (set) =>
            set.public && (
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
                  </div>
                </Card>
              </div>
            )
        )}
      </div>
    </div>
  );
};
