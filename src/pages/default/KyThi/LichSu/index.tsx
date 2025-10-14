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
  QuestionCircleOutlined,
} from "@ant-design/icons";
import ChiTietKetQua from "../KetQua/ChiTietKetQua";
import "./LichSu.css";

const { Title, Text: AntText } = Typography;

export const LichSuLamBai = () => {
  const { _id } = useParams<{ _id: string }>();
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
        if (_id) {
          filtered = filtered.filter(
            (item: { examId: { _id: string } }) => item.examId?._id === _id
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
    window.scrollTo(0, 0);
    fetchResults();
  }, [_id]);

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
        <AntText>Đang tải lịch sử...</AntText>
      </div>
    );
  }

  if (isDetail && detail) {
    return (
      <div className="history-page">
        <div className="history-container detail-view">
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
          <AntText className="hero-subtitle">
            Xem lại kết quả và đáp án các lần làm bài trước
          </AntText>
        </div>
      </div>

      <div className="history-container">
        <div className="history-header">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            className="back-button"
            size="large"
          >
            Quay về đề thi
          </Button>
          {results.length > 0 && (
            <div className="history-summary">
              <div className="summary-item">
                <TrophyOutlined className="summary-icon" />
                <span className="summary-text">
                  {results.length} lần làm bài
                </span>
              </div>
            </div>
          )}
        </div>

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
                  <div className="result-info-grid">
                    <div className="result-info-item">
                      <div className="info-icon-wrapper">
                        <CalendarOutlined className="info-icon" />
                      </div>
                      <div className="info-content">
                        <div className="info-label">Ngày làm bài</div>
                        <div className="info-value">
                          {new Date(result.createdAt).toLocaleString("vi-VN")}
                        </div>
                      </div>
                    </div>

                    <div className="result-info-item">
                      <div className="info-icon-wrapper">
                        <ClockCircleOutlined className="info-icon" />
                      </div>
                      <div className="info-content">
                        <div className="info-label">Thời gian làm</div>
                        <div className="info-value">
                          {formatDuration(result.createdAt, result.endTime)}
                        </div>
                      </div>
                    </div>

                    <div className="result-info-item">
                      <div className="info-icon-wrapper">
                        <CheckCircleOutlined className="info-icon" />
                      </div>
                      <div className="info-content">
                        <div className="info-label">Số câu đúng</div>
                        <div className="info-value">
                          {result.correctAnswer}/{result.questions.length} câu
                        </div>
                      </div>
                    </div>

                    <div className="result-info-item">
                      <div className="info-icon-wrapper">
                        <QuestionCircleOutlined className="info-icon" />
                      </div>
                      <div className="info-content">
                        <div className="info-label">Tổng số câu</div>
                        <div className="info-value">
                          {result.questions.length} câu hỏi
                        </div>
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
                  <AntText className="empty-title">
                    Chưa có lịch sử làm bài
                  </AntText>
                  <AntText className="empty-subtitle">
                    Bạn chưa làm đề thi này lần nào. Hãy bắt đầu làm bài để xem
                    kết quả!
                  </AntText>
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
