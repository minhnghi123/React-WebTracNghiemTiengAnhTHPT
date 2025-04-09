import React, { useEffect, useState } from "react";
import { Spin, Button, Modal, Radio, Table } from "antd";
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
            className="text-blue-500 underline"
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
        <Radio.Group
          onChange={(e) => setExamType(e.target.value)}
          value={examType}
        >
          <Radio value="true false">True / False</Radio>
          <Radio value="multiple choices">Multiple Choices</Radio>
          <Radio value="written">Written</Radio>
          <Radio value="match">Match</Radio>
        </Radio.Group>
      </Modal>

      <div className="mt-6">
        <Link to="/Ontap" className="text-blue-500 underline">
          Quay lại danh sách flashcard
        </Link>
      </div>
    </div>
  );
};
