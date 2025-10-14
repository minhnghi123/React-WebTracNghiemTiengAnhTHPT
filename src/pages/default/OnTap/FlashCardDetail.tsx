import React, { useEffect, useState } from "react";
import { Spin, Button, Modal, Card, Typography, Tag } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { FlashCardAPI, FlashCardSet } from "@/services/student/FlashCardAPI";
import {
  BookOutlined,
  ArrowLeftOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import "./FlashCardcss.css";

const { Title, Text: AntText } = Typography;

export const FlashCardDetail: React.FC = () => {
  const { _id } = useParams<{ _id: string }>();
  const navigate = useNavigate();
  const [flashCardSet, setFlashCardSet] = useState<FlashCardSet | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [examModalVisible, setExamModalVisible] = useState<boolean>(false);
  const [examType, setExamType] = useState<string>("true false");
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

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

  const handleFlipCard = (index: number) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const openExamModal = () => {
    setExamModalVisible(true);
  };

  const handleExamModalCancel = () => {
    setExamModalVisible(false);
  };

  const handleExamStart = () => {
    navigate(
      `/flashcard/exam/${flashCardSet?._id}?examType=${encodeURIComponent(
        examType
      )}`
    );
  };

  if (loading) {
    return (
      <div className="flashcard-loading">
        <Spin size="large" />
        <p>Đang tải chi tiết flashcard...</p>
      </div>
    );
  }

  if (!flashCardSet) {
    return (
      <div className="flashcard-index-page">
        <div className="flashcard-hero compact">
          <div className="hero-background"></div>
          <div className="hero-content">
            <BookOutlined className="hero-icon" />
            <h1 className="hero-title">Không tìm thấy</h1>
            <p className="hero-subtitle">Flashcard set không tồn tại</p>
            <Button
              type="primary"
              size="large"
              className="create-btn"
              onClick={() => navigate("/OnTap")}
            >
              Quay lại danh sách
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const examOptions = [
    {
      key: "true false",
      title: "True / False",
      description: "Chọn đúng hoặc sai cho mỗi câu hỏi",
      icon: "✓/✗",
      color: "#3b82f6",
    },
    {
      key: "multiple choices",
      title: "Multiple Choices",
      description: "Chọn một đáp án đúng từ nhiều lựa chọn",
      icon: "◉",
      color: "#10b981",
    },
    {
      key: "written",
      title: "Written",
      description: "Viết từ vựng tiếng Anh cho mỗi câu hỏi",
      icon: "✍",
      color: "#f59e0b",
    },
    {
      key: "match",
      title: "Match",
      description: "Ghép các từ hoặc cụm từ tương ứng",
      icon: "⇄",
      color: "#8b5cf6",
    },
  ];

  return (
    <div className="flashcard-detail-page">
      {/* Hero Section */}
      <div className="flashcard-hero compact">
        <div className="hero-background"></div>
        <div className="hero-content">
          <BookOutlined className="hero-icon" />
          <Title level={1} className="hero-title">
            {flashCardSet.title}
          </Title>
          <AntText className="hero-subtitle">
            {flashCardSet.description}
          </AntText>
          <div className="hero-stats">
            <Tag color="blue" className="stat-tag">
              {flashCardSet.vocabs.length} từ vựng
            </Tag>
            {flashCardSet.public && (
              <Tag color="green" className="stat-tag">
                Công khai
              </Tag>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flashcard-detail-container">
        <div className="detail-actions">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/OnTap")}
            className="back-btn-detail"
            size="large"
          >
            Quay lại
          </Button>
          <div className="action-buttons-group">
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={openExamModal}
              className="start-exam-btn"
              size="large"
            >
              Làm bài
            </Button>
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(`/flashcard/edit/${_id}`)}
              className="edit-btn-detail"
              size="large"
            >
              Chỉnh sửa
            </Button>
          </div>
        </div>

        {/* Vocabulary Cards Grid */}
        <div className="vocab-cards-grid">
          {flashCardSet.vocabs.map((vocab, index) => (
            <div
              key={index}
              className={`vocab-flip-card ${
                flippedCards.has(index) ? "flipped" : ""
              }`}
              onClick={() => handleFlipCard(index)}
            >
              <div className="vocab-flip-card-inner">
                <div className="vocab-flip-card-front">
                  <div className="flip-card-number">{index + 1}</div>
                  <div className="flip-card-content">
                    <div className="flip-card-label">Term</div>
                    <div className="flip-card-text">{vocab.term}</div>
                  </div>
                  <div className="flip-card-hint">Click để xem định nghĩa</div>
                </div>
                <div className="vocab-flip-card-back">
                  <div className="flip-card-number">{index + 1}</div>
                  <div className="flip-card-content">
                    <div className="flip-card-label">Definition</div>
                    <div className="flip-card-text">{vocab.definition}</div>
                  </div>
                  <div className="flip-card-hint">Click để xem từ vựng</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exam Type Modal */}
      <Modal
        visible={examModalVisible}
        title={
          <div className="modal-title-custom">
            <PlayCircleOutlined />
            <span>Chọn hình thức làm bài</span>
          </div>
        }
        onCancel={handleExamModalCancel}
        footer={null}
        width={700}
        className="exam-type-modal"
      >
        <div className="exam-options-grid">
          {examOptions.map((option) => (
            <Card
              key={option.key}
              hoverable
              className={`exam-option-card ${
                examType === option.key ? "selected" : ""
              }`}
              onClick={() => setExamType(option.key)}
            >
              <div className="exam-option-icon" style={{ color: option.color }}>
                {option.icon}
              </div>
              <Title level={4} className="exam-option-title">
                {option.title}
              </Title>
              <AntText className="exam-option-desc">
                {option.description}
              </AntText>
              {examType === option.key && (
                <div className="exam-option-check">
                  <CheckCircleOutlined />
                </div>
              )}
            </Card>
          ))}
        </div>
        <div className="modal-actions">
          <Button size="large" onClick={handleExamModalCancel}>
            Hủy
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<PlayCircleOutlined />}
            onClick={handleExamStart}
          >
            Bắt đầu làm bài
          </Button>
        </div>
      </Modal>
    </div>
  );
};
