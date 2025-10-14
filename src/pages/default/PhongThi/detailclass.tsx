import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  Tabs,
  Table,
  List,
  Avatar,
  Button,
  Input,
  message,
  Spin,
} from "antd";
import { studentClassroomAPI } from "@/services/student/ClassroomAPI";
import { ColumnsType } from "antd/es/table";
import { Exam, Question } from "@/services/teacher/Teacher";
import {
  ArrowLeftOutlined,
  UserOutlined,
  LockOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  BookOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import AppLink from "@/components/AppLink";
import "./detailclass.css";

const { TabPane } = Tabs;

const examColumns: ColumnsType<Exam> = [
  {
    title: "Tiêu đề",
    dataIndex: "title",
    key: "title",
    render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
  },
  {
    title: "Mô tả",
    dataIndex: "description",
    key: "description",
    responsive: ["md"],
  },
  {
    title: "Thời gian",
    dataIndex: "duration",
    key: "duration",
    sorter: (a: Exam, b: Exam) => a.duration - b.duration,
    render: (duration) => <span>{duration} phút</span>,
    responsive: ["lg"],
  },
  {
    title: "Bắt đầu",
    dataIndex: "startTime",
    key: "startTime",
    sorter: (a: Exam, b: Exam) =>
      new Date(a.startTime || 0).getTime() -
      new Date(b.startTime || 0).getTime(),
    render: (text: string) =>
      text ? new Date(text).toLocaleDateString("vi-VN") : "N/A",
    responsive: ["lg"],
  },
  {
    title: "Kết thúc",
    dataIndex: "endTime",
    key: "endTime",
    sorter: (a: Exam, b: Exam) =>
      new Date(a.endTime || 0).getTime() - new Date(b.endTime || 0).getTime(),
    render: (text: string) =>
      text ? new Date(text).toLocaleDateString("vi-VN") : "N/A",
    responsive: ["lg"],
  },
  {
    title: "Câu hỏi",
    dataIndex: "questions",
    key: "questions",
    sorter: (a: Exam, b: Exam) =>
      (a.questions?.length ?? 0) - (b.questions?.length ?? 0),
    render: (record: Question[]) => <span>{record.length ?? 0} câu</span>,
    responsive: ["md"],
  },
];

export const ClassroomDetail = () => {
  const navagiteToDetail = (id: string) => {
    window.location.href = `/KyThi/ChiTiet/${id}`;
  };

  const { classroomId } = useParams<{ classroomId: string }>();
  const [classroom, setClassroom] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [joinPassword, setJoinPassword] = useState<string>("");

  const fetchClassroom = async () => {
    setLoading(true);
    try {
      const response = await studentClassroomAPI.getClassroomById(classroomId!);
      if (response.success) {
        setClassroom(response.classroom);
      } else {
        setError(response.message || "Có lỗi xảy ra");
      }
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    }
    setLoading(false);
  };

  const handleJoinClassroom = async () => {
    try {
      const joinResponse = await studentClassroomAPI.joinClassroom(
        classroomId!,
        joinPassword
      );
      if (joinResponse.success) {
        message.success("Tham gia lớp học thành công!");
        fetchClassroom();
      } else {
        message.error("Tham gia lớp thất bại: " + joinResponse.message);
      }
    } catch (error: any) {
      message.error("Có lỗi khi tham gia lớp");
    }
  };

  useEffect(() => {
    fetchClassroom();
  }, [classroomId]);

  if (loading) {
    return (
      <div className="classroom-detail-page">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <Spin size="large" />
          <p style={{ color: "white", fontSize: "1rem", fontWeight: 500 }}>
            Đang tải thông tin lớp...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="classroom-detail-page">
        <div className="classroom-detail-container">
          <Card
            style={{
              textAlign: "center",
              padding: "3rem",
              borderRadius: "20px",
            }}
          >
            <p style={{ color: "#ef4444", fontSize: "1.125rem" }}>
              Lỗi: {error}
            </p>
            <AppLink to="/PhongThi">
              <Button type="primary" icon={<ArrowLeftOutlined />}>
                Quay về danh sách
              </Button>
            </AppLink>
          </Card>
        </div>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="classroom-detail-page">
        <div className="classroom-detail-container">
          <Card
            style={{
              textAlign: "center",
              padding: "3rem",
              borderRadius: "20px",
            }}
          >
            <p style={{ fontSize: "1.125rem" }}>Không tìm thấy lớp học</p>
            <AppLink to="/PhongThi">
              <Button type="primary" icon={<ArrowLeftOutlined />}>
                Quay về danh sách
              </Button>
            </AppLink>
          </Card>
        </div>
      </div>
    );
  }

  const joined = classroom.students && Array.isArray(classroom.students);

  return (
    <div className="classroom-detail-page">
      <div className="classroom-detail-container">
        <AppLink to="/PhongThi">
          <Button className="back-btn-classroom" icon={<ArrowLeftOutlined />}>
            Quay về danh sách
          </Button>
        </AppLink>

        {/* Header Card - ✅ FIX: Removed password display */}
        <Card className="classroom-header-card" bordered={false}>
          <Card.Meta
            title={classroom.title}
            description={
              <div className="classroom-info-grid">
                <div className="classroom-info-row">
                  <div className="classroom-info-icon-wrapper">
                    <UserOutlined />
                  </div>
                  <div className="classroom-info-content">
                    <div className="classroom-info-label-detail">Giáo viên</div>
                    <div className="classroom-info-value-detail">
                      {classroom.teacherId.username}
                    </div>
                  </div>
                </div>

                <div className="classroom-info-row">
                  <div className="classroom-info-icon-wrapper">
                    <CheckCircleOutlined />
                  </div>
                  <div className="classroom-info-content">
                    <div className="classroom-info-label-detail">
                      Trạng thái
                    </div>
                    <div className="classroom-info-value-detail">
                      {classroom.status}
                    </div>
                  </div>
                </div>

                {/* ✅ REMOVED: Password display section */}
              </div>
            }
          />
        </Card>

        {/* Join Section */}
        {!joined && (
          <Card className="join-classroom-section" bordered={false}>
            <Card.Meta
              title="Tham gia lớp học"
              description={
                <div>
                  <p className="join-description">
                    Để tham gia lớp học này, vui lòng nhập mật khẩu lớp.
                  </p>
                  <Input.Password
                    className="join-password-input"
                    placeholder="Nhập mật khẩu lớp..."
                    prefix={<LockOutlined />}
                    value={joinPassword}
                    onChange={(e) => setJoinPassword(e.target.value)}
                  />
                  <Button
                    className="join-submit-btn"
                    onClick={handleJoinClassroom}
                    icon={<CheckCircleOutlined />}
                  >
                    Tham gia lớp
                  </Button>
                </div>
              }
            />
          </Card>
        )}

        {/* Tabs Section */}
        {joined && (
          <Card className="classroom-tabs-card" bordered={false}>
            <Tabs defaultActiveKey="1" className="classroom-tabs">
              <TabPane
                tab={
                  <span>
                    <FileTextOutlined />
                    Đề Thi
                  </span>
                }
                key="1"
              >
                <Table
                  className="classroom-table"
                  dataSource={classroom.exams || []}
                  columns={[
                    ...examColumns,
                    {
                      title: "",
                      key: "action",
                      render: (_, record) => (
                        <Button
                          type="primary"
                          onClick={() => navagiteToDetail(record.slug)}
                        >
                          Chi tiết
                        </Button>
                      ),
                    },
                  ]}
                  rowKey="_id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} đề thi`,
                  }}
                />
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <BookOutlined />
                    Tổng quan
                  </span>
                }
                key="2"
              >
                <div className="overview-stats">
                  <div className="stat-item-detail">
                    <div className="stat-icon-detail">
                      <TeamOutlined />
                    </div>
                    <div className="stat-content-detail">
                      <div className="stat-label-detail">Học sinh</div>
                      <div className="stat-value-detail">
                        {classroom.students.length}
                      </div>
                    </div>
                  </div>

                  <div className="stat-item-detail">
                    <div className="stat-icon-detail">
                      <FileTextOutlined />
                    </div>
                    <div className="stat-content-detail">
                      <div className="stat-label-detail">Đề thi</div>
                      <div className="stat-value-detail">
                        {classroom.exams ? classroom.exams.length : 0}
                      </div>
                    </div>
                  </div>
                </div>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    Thành viên
                  </span>
                }
                key="3"
              >
                <List
                  className="member-list"
                  itemLayout="horizontal"
                  dataSource={classroom.students || []}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} thành viên`,
                  }}
                  renderItem={(student: any) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            src={student.avatar}
                            icon={<UserOutlined />}
                          />
                        }
                        title={student.username}
                        description={student.email}
                      />
                    </List.Item>
                  )}
                />
              </TabPane>
            </Tabs>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClassroomDetail;
