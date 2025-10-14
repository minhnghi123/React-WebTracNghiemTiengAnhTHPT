import { Result, ResultAPI } from "@/services/student";
import { Button, Card, Typography, Empty } from "antd";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftOutlined,
  TrophyOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import ChiTietKetQua from "../KetQua/ChiTietKetQua";
import "./LichSu.css";

const { Title, Text } = Typography;

export const LichSuLamBai = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<Result>();
  const [isDetail, setIsDetail] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await ResultAPI.getAllResult(1);
      if (res.code === 200) {
        let filtered = res.data;
        if (examId) {
          filtered = filtered.filter(
            (item: { examId: { _id: string } }) => item.examId?._id === examId
          );
        }
        setResults(filtered.reverse());
      }
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [examId]);

  const handleBack = () => {
    if (isDetail) {
      setIsDetail(false);
      setDetail(undefined);
    } else {
      navigate(-1);
    }
  };

  const handleViewDetail = (result: Result) => {
    setDetail(result);
    setIsDetail(true);
  };

  const formatDuration = (start: string, end: string) => {
    const duration = Math.round(
      (new Date(end).getTime() - new Date(start).getTime()) / 60000
    );
    return `${duration} phút`;
  };

  if (loading) {
    return (
      <div className="history-loading">
        <div className="loading-spinner"></div>
        <Text>Đang tải lịch sử...</Text>
      </div>
    );
  }

  if (isDetail && detail) {
    return (
      <div className="history-page">
        <div className="history-container">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            className="back-button"
            size="large"
          >
            Quay lại danh sách
          </Button>
          <ChiTietKetQua result={detail} />
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="history-hero">
        <div className="hero-background"></div>
        <div className="hero-content">
          <TrophyOutlined className="hero-icon" />
          <Title level={1} className="hero-title">
            Lịch sử làm bài
          </Title>
          <Text className="hero-subtitle">
            Xem lại kết quả và đáp án các lần làm bài trước
          </Text>
        </div>
      </div>

      <div className="history-container">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          className="back-button"
          size="large"
        >
          Quay về đề thi
        </Button>

        {results.length > 0 ? (
          <div className="results-grid">
            {results.map((result, index) => (
              <Card key={result._id} className="result-card" bordered={false}>
                <div className="result-header">
                  <div className="result-number">
                    Lần {results.length - index}
                  </div>
                  <div
                    className={`result-score ${
                      result.score >= 5 ? "pass" : "fail"
                    }`}
                  >
                    {result.score}/10
                  </div>
                </div>

                <div className="result-body">
                  <div className="result-info-item">
                    <CalendarOutlined className="info-icon" />
                    <div className="info-content">
                      <div className="info-label">Ngày làm bài</div>
                      <div className="info-value">
                        {new Date(result.createdAt).toLocaleString("vi-VN")}
                      </div>
                    </div>
                  </div>

                  <div className="result-info-item">
                    <ClockCircleOutlined className="info-icon" />
                    <div className="info-content">
                      <div className="info-label">Thời gian làm</div>
                      <div className="info-value">
                        {formatDuration(result.createdAt, result.endTime)}
                      </div>
                    </div>
                  </div>

                  <div className="result-info-item">
                    <CheckCircleOutlined className="info-icon" />
                    <div className="info-content">
                      <div className="info-label">Số câu đúng</div>
                      <div className="info-value">
                        {result.correctAnswer}/{result.questions.length} câu
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewDetail(result)}
                  className="view-detail-button"
                  block
                  size="large"
                >
                  Xem chi tiết đáp án
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="empty-card" bordered={false}>
            <Empty
              description={
                <div className="empty-description">
                  <Text className="empty-title">Chưa có lịch sử làm bài</Text>
                  <Text className="empty-subtitle">
                    Bạn chưa làm đề thi này lần nào. Hãy bắt đầu làm bài để xem
                    kết quả!
                  </Text>
                </div>
              }
            />
          </Card>
        )}
      </div>
    </div>
  );
};

export default LichSuLamBai;
