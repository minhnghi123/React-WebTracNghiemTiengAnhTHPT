import { useEffect, useState } from "react";
import {
  ClassroomReponse,
  studentClassroomAPI,
} from "@/services/student/ClassroomAPI";
import { Card, Input, Empty } from "antd";
import {
  TeamOutlined,
  UserOutlined,
  BookOutlined,
  SearchOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import "./phongthi.css";
import AppLink from "@/components/AppLink";

export const PhongThi = () => {
  const [classrooms, setClassrooms] = useState<ClassroomReponse[]>([]);
  const [joinClassroomId, setJoinClassroomId] = useState("");
  const [searchText, setSearchText] = useState("");

  const filteredClassrooms = classrooms
    ? classrooms.filter(
        (classroom) =>
          classroom.title.toLowerCase().includes(searchText.toLowerCase()) ||
          classroom.teacherId.username
            .toLowerCase()
            .includes(searchText.toLowerCase())
      )
    : [];

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

  return (
    <div className="classroom-page">
      {/* Hero Section */}
      <div className="classroom-hero">
        <div className="classroom-hero-background"></div>
        <div className="classroom-hero-content">
          <TeamOutlined className="classroom-hero-icon" />
          <h1 className="classroom-hero-title">Phòng Thi</h1>
          <p className="classroom-hero-subtitle">
            Quản lý và tham gia các lớp học trực tuyến
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="classroom-container">
        {/* Search Bar */}
        <div className="classroom-search-bar">
          <Input
            className="classroom-search-input"
            placeholder="Tìm kiếm lớp học hoặc giáo viên..."
            prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </div>

        {/* Classroom Grid */}
        <div className="classroom-grid">
          {/* Join New Classroom Card */}
          <Card className="classroom-card join-classroom-card" bordered={false}>
            <Card.Meta
              title="Tham gia lớp mới"
              description={
                <div>
                  <Input
                    className="join-input"
                    placeholder="Nhập mã lớp học..."
                    value={joinClassroomId}
                    onChange={(e) => setJoinClassroomId(e.target.value)}
                    allowClear
                  />
                  <AppLink
                    to="/PhongThi/Detail/:classroomId"
                    params={{ classroomId: joinClassroomId }}
                  >
                    <button
                      className="join-button"
                      disabled={!joinClassroomId.trim()}
                    >
                      <BookOutlined /> Tham gia ngay
                    </button>
                  </AppLink>
                </div>
              }
            />
          </Card>

          {/* Classroom List */}
          {filteredClassrooms.length > 0 ? (
            filteredClassrooms.map((classroom) => (
              <AppLink
                key={classroom._id}
                to="/PhongThi/Detail/:classroomId"
                params={{ classroomId: classroom._id }}
              >
                <Card className="classroom-card" bordered={false}>
                  <Card.Meta
                    title={classroom.title}
                    description={
                      <div>
                        <div className="classroom-info-item">
                          <div className="classroom-info-icon">
                            <UserOutlined />
                          </div>
                          <div className="classroom-info-text">
                            <div className="classroom-info-label">
                              Giáo viên
                            </div>
                            <div className="classroom-info-value">
                              {classroom.teacherId.username}
                            </div>
                          </div>
                        </div>

                        <div className="classroom-info-item">
                          <div className="classroom-info-icon">
                            <TeamOutlined />
                          </div>
                          <div className="classroom-info-text">
                            <div className="classroom-info-label">Học sinh</div>
                            <div className="classroom-info-value">
                              {classroom.students.length} thành viên
                            </div>
                          </div>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </AppLink>
            ))
          ) : (
            <div className="empty-state-card" style={{ gridColumn: "1 / -1" }}>
              <InboxOutlined className="empty-icon" />
              <div className="empty-title">
                {searchText ? "Không tìm thấy lớp học" : "Chưa có lớp học nào"}
              </div>
              <div className="empty-subtitle">
                {searchText
                  ? "Thử tìm kiếm với từ khóa khác"
                  : "Tham gia hoặc tạo lớp học mới để bắt đầu"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
