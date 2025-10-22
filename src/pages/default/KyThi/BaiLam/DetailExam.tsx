import { ExamAPIStudent } from "@/services/student";
import { Exam } from "@/services/teacher/Teacher";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Typography, Row, Col, Space, Badge, Tag, Divider } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  QuestionCircleOutlined,
  CheckCircleTwoTone,
  PlayCircleOutlined,
  BookOutlined,
  TeamOutlined,
  HistoryOutlined,
  TrophyOutlined,
  SoundOutlined,
} from "@ant-design/icons";
import "./Detail.css";

const { Title, Text: AntText } = Typography;

export const DetailExam = () => {
  const { _id } = useParams<{ _id: string }>();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [isPracticed, setIsPracticed] = useState(false);
  const [readingCount, setReadingCount] = useState<number>(0); // ✅ Thêm state
  const [listeningCount, setListeningCount] = useState<number>(0); // ✅ Thêm state
  const navigate = useNavigate();

  const fetchExam = async () => {
    const response = await ExamAPIStudent.getDetailExam(_id ?? "");
    if (response.code === 200) {
      setExam(response.exam);

      // ✅ Backend đã tính sẵn
      setQuestionCount(response.exam.totalQuestions);
      setReadingCount(response.exam.readingCount || 0);
      setListeningCount(response.exam.listeningCount || 0);
      setIsPracticed(response.exam.hasDone);
    }
  };

  const handleJoinExam = async () => {
    if (exam?._id) {
      try {
        console.log("📌 Joining exam with _id:", exam._id);

        // ✅ FIX: Clear localStorage trước khi join
        localStorage.removeItem("ongoingExamId");
        localStorage.removeItem("ongoingResultId");

        const response = await ExamAPIStudent.joinExam(exam._id);

        console.log("✅ Join response:", response);

        if (response.code === 200) {
          // ✅ Lưu exam mới vào localStorage
          localStorage.setItem("ongoingExamId", exam._id);
          localStorage.setItem("ongoingResultId", response.resultId);

          navigate("/KyThi/BaiLam/");
        }
      } catch (error: any) {
        console.error("❌ Error joining exam:", error);
        console.error("Error response:", error.response);

        const errorMessage = error.response?.data?.message || "Lỗi khi tham gia đề thi.";

        if (error.response?.status === 500) {
          alert(`Lỗi server: ${errorMessage}`);
        } else if (error.response?.status === 404) {
          alert("Đề thi không tồn tại hoặc đã bị xóa.");
        } else {
          alert(errorMessage);
        }
      }
    }
  };

  const handleViewHistory = () => {
    navigate(`/KyThi/LichSu/${_id}`);
  };

  const formatDate = (dateStr?: string) =>
    dateStr ? new Date(dateStr).toLocaleString("vi-VN") : "Không giới hạn";

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchExam();
  }, [_id]);

  if (!exam) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <AntText className="loading-text">Đang tải thông tin đề thi...</AntText>
      </div>
    );
  }

  return (
    <div className="detail-exam-page">
      {/* Hero Section */}
      <div className="exam-hero-section">
        <div className="hero-background"></div>
        <div className="hero-content">
          {isPracticed && (
            <div className="status-badge">
              <Badge status="success" text="Đã hoàn thành" />
            </div>
          )}
          <Title level={1} className="hero-title">
            {exam.title}
          </Title>
          <AntText className="hero-subtitle">
            Đề thi trắc nghiệm tiếng Anh THPT
          </AntText>

          {/* ✅ Thêm tags ngay dưới subtitle */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "16px",
              justifyContent: "center",
            }}
          >
            {readingCount > 0 && (
              <Tag
                icon={<BookOutlined />}
                color="blue"
                style={{ fontSize: "14px", padding: "6px 12px" }}
              >
                Reading: {readingCount} câu
              </Tag>
            )}
            {listeningCount > 0 && (
              <Tag
                icon={<SoundOutlined />}
                color="green"
                style={{ fontSize: "14px", padding: "6px 12px" }}
              >
                Listening: {listeningCount} câu
              </Tag>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="exam-main-content">
        {/* Stats Cards */}
        <Row gutter={[16, 16]} className="stats-row">
          <Col xs={12} sm={12} md={6}>
            <div className="stat-card stat-primary">
              <div className="stat-icon">
                <QuestionCircleOutlined />
              </div>
              <div className="stat-content">
                <div className="stat-value">{questionCount}</div>
                <div className="stat-label">Tổng câu hỏi</div>
              </div>
            </div>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <div className="stat-card stat-success">
              <div className="stat-icon">
                <ClockCircleOutlined />
              </div>
              <div className="stat-content">
                <div className="stat-value">{exam.duration}</div>
                <div className="stat-label">Phút</div>
              </div>
            </div>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <div className="stat-card stat-warning">
              <div className="stat-icon">
                <TeamOutlined />
              </div>
              <div className="stat-content">
                <div className="stat-value">Lớp {exam.class}</div>
                <div className="stat-label">Cấp độ</div>
              </div>
            </div>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <div className="stat-card stat-info">
              <div className="stat-icon">
                <BookOutlined />
              </div>
              <div className="stat-content">
                <div className="stat-value">{exam.topic?.length || 0}</div>
                <div className="stat-label">Chủ đề</div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Exam Details Card */}
        <Card className="exam-details-card" bordered={false}>
          <div className="card-title">
            <BookOutlined className="title-icon" />
            <span>Thông tin chi tiết</span>
          </div>

          <div className="details-grid">
            <div className="detail-item">
              <div className="detail-icon">
                <CalendarOutlined />
              </div>
              <div className="detail-content">
                <div className="detail-label">Thời gian bắt đầu</div>
                <div className="detail-value">
                  {formatDate(exam.startTime as unknown as string)}
                </div>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <CalendarOutlined />
              </div>
              <div className="detail-content">
                <div className="detail-label">Thời gian kết thúc</div>
                <div className="detail-value">
                  {formatDate(exam.endTime as unknown as string)}
                </div>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <ClockCircleOutlined />
              </div>
              <div className="detail-content">
                <div className="detail-label">Thời lượng</div>
                <div className="detail-value">{exam.duration} phút</div>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <TeamOutlined />
              </div>
              <div className="detail-content">
                <div className="detail-label">Lớp học</div>
                <div className="detail-value">Lớp {exam.class}</div>
              </div>
            </div>
          </div>

          {exam.topic && exam.topic.length > 0 && (
            <>
              <Divider style={{ margin: "24px 0" }} />
              <div className="topics-section">
                <div className="topics-label">
                  <BookOutlined /> Chủ đề
                </div>
                <div className="topics-tags">
                  {exam.topic.map((topic, idx) => (
                    <Tag key={idx} color="blue" className="topic-tag">
                      {topic}
                    </Tag>
                  ))}
                </div>
              </div>
            </>
          )}

          {exam.knowledge && exam.knowledge.length > 0 && (
            <>
              <Divider style={{ margin: "24px 0" }} />
              <div className="topics-section">
                <div className="topics-label">
                  <TrophyOutlined /> Kiến thức
                </div>
                <div className="topics-tags">
                  {exam.knowledge.map((item, idx) => (
                    <Tag key={idx} color="cyan" className="topic-tag">
                      {item}
                    </Tag>
                  ))}
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="btn-primary" onClick={handleJoinExam}>
            <PlayCircleOutlined />
            <span>Bắt đầu làm bài</span>
          </button>
          <button className="btn-secondary" onClick={handleViewHistory}>
            <HistoryOutlined />
            <span>Xem lịch sử làm bài</span>
          </button>
        </div>

        {/* Completion Badge */}
        {isPracticed && (
          <div className="completion-badge">
            <CheckCircleTwoTone twoToneColor="#52c41a" />
            <span>Bạn đã hoàn thành đề thi này</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailExam;
