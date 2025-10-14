import React, { useEffect, useState } from "react";
import { Button, Card, Space, Spin, message, Empty, Tabs } from "antd";
import { FlashCardAPI, FlashCardSet } from "@/services/student/FlashCardAPI";
import { useAuthContext } from "@/contexts/AuthProvider";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  UserOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import "./FlashCardcss.css";
import AppLink from "@/components/AppLink";

const { TabPane } = Tabs;

export const FlashCardIndex: React.FC = () => {
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

        const mySets = allSets.filter(
          (set: FlashCardSet) => set.createdBy === user?._id
        );
        const otherSets = allSets.filter(
          (set: FlashCardSet) => set.createdBy !== user?._id && set.public
        );

        setMyFlashCardSets(mySets);
        setOtherFlashCardSets(otherSets);
      } catch (error) {
        console.error("Lỗi khi lấy flashcard sets:", error);
        message.error("Không thể tải danh sách flashcard");
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcardSets();
  }, [user?._id]);

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

  if (loading) {
    return (
      <div className="flashcard-loading">
        <Spin size="large" />
        <p>Đang tải danh sách flashcard...</p>
      </div>
    );
  }

  const renderFlashcardGrid = (sets: FlashCardSet[], isMy: boolean) =>
    sets.length > 0 ? (
      <div className="flashcard-grid">
        {sets.map((set) => (
          <Card
            key={set._id}
            className={`flashcard-card ${isMy ? "my-card" : "public-card"}`}
            hoverable
            onClick={() => set._id && handleExam(set._id)}
          >
            <div className="card-header">
              <div className={`card-badge ${!isMy ? "public" : ""}`}>
                {isMy ? <UserOutlined /> : <GlobalOutlined />}
                <span>{isMy ? "Của tôi" : "Công khai"}</span>
              </div>
              <div className="card-badge">
                <BookOutlined />
                <span>{set.vocabs.length} từ</span>
              </div>
            </div>

            <h3 className="card-title">{set.title}</h3>
            <p className="card-description">{set.description}</p>

            <div className="card-footer">
              {isMy ? (
                <Space size="small">
                  <Button
                    type="primary"
                    ghost
                    size="small"
                    icon={<EditOutlined />}
                    onClick={(e) => handleEdit(set._id || "", e)}
                  >
                    Sửa
                  </Button>
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={(e) => handleDelete(set._id || "", e)}
                  >
                    Xóa
                  </Button>
                </Space>
              ) : (
                <Button type="primary" ghost size="small">
                  Xem chi tiết
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    ) : (
      <Empty
        description={
          isMy ? "Bạn chưa có bộ từ vựng nào" : "Chưa có bộ từ vựng công khai"
        }
        className="empty-state"
      >
        {isMy && (
          <AppLink to="/flashcard/create">
            <Button type="primary" icon={<PlusOutlined />}>
              Tạo bộ từ vựng đầu tiên
            </Button>
          </AppLink>
        )}
      </Empty>
    );

  return (
    <div className="flashcard-index-page">
      {/* Hero Section */}
      <div className="flashcard-hero">
        <div className="hero-background"></div>
        <div className="hero-content">
          <BookOutlined className="hero-icon" />
          <h1 className="hero-title">Ôn tập với Flashcard</h1>
          <p className="hero-subtitle">
            Tạo và học tập với các bộ từ vựng cá nhân hóa
          </p>
          <AppLink to="/flashcard/create">
            <Button
              type="primary"
              size="large"
              className="create-btn"
              icon={<PlusOutlined />}
            >
              Tạo bộ từ vựng mới
            </Button>
          </AppLink>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="flashcard-container">
        <Tabs defaultActiveKey="my" className="flashcard-tabs" size="large">
          <TabPane
            tab={
              <span className="tab-title">
                <UserOutlined />
                Bộ từ vựng của tôi
                <span className="tab-count">{myFlashCardSets.length}</span>
              </span>
            }
            key="my"
          >
            {renderFlashcardGrid(myFlashCardSets, true)}
          </TabPane>

          <TabPane
            tab={
              <span className="tab-title">
                <GlobalOutlined />
                Bộ từ vựng công khai
                <span className="tab-count">{otherFlashCardSets.length}</span>
              </span>
            }
            key="public"
          >
            {renderFlashcardGrid(otherFlashCardSets, false)}
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};
