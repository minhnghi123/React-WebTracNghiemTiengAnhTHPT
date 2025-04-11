import React, { useEffect, useState } from "react";
import { Spin, Button, Modal,  Table, Card } from "antd";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FlashCardAPI,
  FlashCardSet,
  Vocab,
} from "@/services/student/FlashCardAPI";

export const FlashCardDetail: React.FC = () => {
  const { _id } = useParams<{ _id: string }>(); // Lấy id từ URL
  const [flashCardSet, setFlashCardSet] = useState<FlashCardSet | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [examModalVisible, setExamModalVisible] = useState<boolean>(false);
  const [examType, setExamType] = useState<string>("true false");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await FlashCardAPI.getFlashCardSetDetail(_id!);
        setFlashCardSet(res.flashCardSet);
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết flashcard set:", error);
      } finally {
        setLoading(false);
      }
    };

    if (_id) {
      fetchDetail();
    }
  }, [_id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!flashCardSet) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h2 className="text-center text-xl text-red-500">
          Flashcard set không tồn tại
        </h2>
        <div className="mt-4 text-center">
          <Link
            to="/flashcards"
            className="text-blue-500 btn underline"
            style={{ fontSize: "1.25rem" }}
          >
            Quay lại danh sách flashcard
          </Link>
        </div>
      </div>
    );
  }

  // Mở modal chọn hình thức làm bài
  const openExamModal = () => {
    setExamModalVisible(true);
  };

  // Đóng modal
  const handleExamModalCancel = () => {
    setExamModalVisible(false);
  };

  // Khi nhấn "Bắt đầu" trong modal, điều hướng đến trang làm bài
  const handleExamStart = () => {
    navigate(
      `/flashcard/exam/${flashCardSet._id}?examType=${encodeURIComponent(
        examType
      )}`
    );
  };
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-4"><center>{flashCardSet.title}</center></h1>
      <p className="mb-6 text-lg">Mô tả: {flashCardSet.description}</p>


      <Table
        dataSource={flashCardSet.vocabs as Vocab[]}
        showSorterTooltip={false}
        columns={[
          {
            title: "Từ vựng",
            dataIndex: "term",
            key: "term",
            width: "50%",
          },
          {
            title: "Định nghĩa",
            dataIndex: "definition",
            key: "definition",
            width: "50%",
          },
        ]}
      />

      <div className="mt-6 text-center" style={{ marginTop: "6px" }}>
        <Button type="primary" onClick={openExamModal}>
          Làm bài
        </Button>
      </div>

      <Modal
        visible={examModalVisible}
        title="Chọn hình thức làm bài"
        onCancel={handleExamModalCancel}
        onOk={handleExamStart}
        okText="Bắt đầu"
      >
        <div className="grid grid-cols-2 gap-4">
          <Card
            hoverable
            onClick={() => setExamType("true false")}
            style={{
              backgroundColor: examType === "true false" ? "#e6f7ff" : "#fff",
            }}
          >
            <h3>True / False</h3>
            <p>Chọn đúng hoặc sai cho mỗi câu hỏi.</p>
          </Card>
          <Card
            hoverable
            onClick={() => setExamType("multiple choices")}
            style={{
              backgroundColor:
                examType === "multiple choices" ? "#e6f7ff" : "#fff",
            }}
          >
            <h3>Multiple Choices</h3>
            <p>Chọn một đáp án đúng từ nhiều lựa chọn.</p>
          </Card>
          <Card
            hoverable
            onClick={() => setExamType("written")}
            style={{
              backgroundColor: examType === "written" ? "#e6f7ff" : "#fff",
            }}
          >
            <h3>Written</h3>
            <p>Viết từ vựng tiếng Anh cho mỗi câu hỏi.</p>
          </Card>
          <Card
            hoverable
            onClick={() => setExamType("match")}
            style={{
              backgroundColor: examType === "match" ? "#e6f7ff" : "#fff",
            }}
          >
            <h3>Match</h3>
            <p>Ghép các từ hoặc cụm từ tương ứng.</p>
          </Card>
        </div>
      </Modal>

      <div className="mt-6">
        <Button> 
        <Link to="/Ontap" className="btn text-blue-500 underline">
          Quay lại danh sách flashcard
        </Link>
        </Button>
      </div>
    </div>
  );
};
