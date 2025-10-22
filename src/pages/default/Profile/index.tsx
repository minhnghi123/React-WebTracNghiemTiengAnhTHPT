import { useEffect, useState } from "react";
import { Tabs, List, Card, Typography, Avatar } from "antd";
import { useAuthContext } from "@/contexts/AuthProvider";
import { HistoryPage } from "./history";
import {
  ClassroomReponse,
  studentClassroomAPI,
} from "@/services/student/ClassroomAPI";
import "./prolife.css";
import AppLink from "@/components/AppLink";
import { UserOutlined, TrophyOutlined, BookOutlined } from "@ant-design/icons";

const { Title, Text: AntText } = Typography;

export const Profile = () => {
  const { user } = useAuthContext();
  const [classrooms, setClassrooms] = useState<ClassroomReponse[]>([]);

  const getAllClassrooms = async () => {
    try {
      const response = await studentClassroomAPI.getStudentClassrooms();
      if (response.success) {
        setClassrooms(response.classrooms);
      } else {
        console.error("Lỗi khi lấy danh sách lớp:", response.message);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API lấy danh sách lớp:", error);
    }
  };

  useEffect(() => {
    getAllClassrooms();
  }, []);

  // ✅ Tabs items với icon
  const tabItems = [
    {
      key: "1",
      label: (
        <span className="tab-label">
          <TrophyOutlined />
          Kết quả ôn tập
        </span>
      ),
      children: <HistoryPage />,
    },
    {
      key: "2",
      label: (
        <span className="tab-label">
          <BookOutlined />
          Lớp học ({classrooms.length})
        </span>
      ),
      children:
        classrooms.length > 0 ? (
          <List
            grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 3 }}
            dataSource={classrooms}
            renderItem={(item) => (
              <List.Item>
                <AppLink
                  to="/PhongThi/Detail/:classroomId"
                  params={{ classroomId: item._id }}
                >
                  <Card hoverable className="classroom-card">
                    <Card.Meta
                      title={item.title}
                      description={`Mã lớp: ${item._id.slice(0, 8)}`}
                    />
                  </Card>
                </AppLink>
              </List.Item>
            )}
          />
        ) : (
          <div className="empty-classroom">
            <BookOutlined className="empty-icon" />
            <AntText className="empty-text">Chưa có lớp học nào</AntText>
          </div>
        ),
    },
  ];

  return (
    <div className="profile-page">
      {/* Hero Section */}
      <div className="profile-hero">
        <div className="hero-background"></div>
        <div className="hero-content">
          <UserOutlined className="hero-icon" />
          <Title level={1} className="hero-title">
            Hồ sơ của tôi
          </Title>
          <AntText className="hero-subtitle">
            Quản lý thông tin cá nhân và theo dõi tiến độ học tập
          </AntText>
        </div>
      </div>

      {/* Main Content */}
      <div className="profile-container">
        {/* ✅ User Info Card */}
        {user && (
          <Card className="user-info-card" bordered={false}>
            <div className="user-info-content">
              <Avatar
                size={80}
                icon={<UserOutlined />}
                className="user-avatar"
              />
              <div className="user-details">
                <div className="user-detail-item">
                  <span className="detail-label">Tên người dùng:</span>
                  <span className="detail-value">{user.username}</span>
                </div>
                <div className="user-detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{user.email}</span>
                </div>
                <div className="user-detail-item">
                  <span className="detail-label">Vai trò:</span>
                  <span className="detail-value">{user.role}</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        <Tabs
          defaultActiveKey="1"
          className="profile-tabs"
          size="large"
          items={tabItems}
        />
      </div>
    </div>
  );
};
