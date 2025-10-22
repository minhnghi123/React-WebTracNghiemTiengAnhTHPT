import React, { useEffect, useState } from "react";
import { ExamAPIStudent } from "@/services/student";
import { Card, Row, Col, Tag, Pagination, Select, Spin, Empty, Button } from "antd";
import { BookOutlined, SoundOutlined, QuestionCircleOutlined, PlayCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./KyThi.css";

const { Option } = Select;

const KyThi: React.FC = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filterType, setFilterType] = useState<string>("all");
  const navigate = useNavigate();

  const fetchExams = async (page: number, type: string) => {
    setLoading(true);
    try {
      const response = await ExamAPIStudent.getExams(page, 8, type);
      if (response.code === 200) {
        setExams(response.exams);
        setTotalItems(response.totalItems);
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams(currentPage, filterType);
  }, [currentPage, filterType]);

  const handleFilterChange = (value: string) => {
    setFilterType(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewDetail = (slug: string) => {
    navigate(`/KyThi/detail/${slug}`);
  };

  return (
    <div className="ky-thi-container">
      <div className="ky-thi-header">
        <h1>Danh sách đề thi</h1>
        <p>Chọn đề thi phù hợp để bắt đầu luyện tập</p>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <span className="filter-label">Lọc theo loại:</span>
        <Select
          value={filterType}
          onChange={handleFilterChange}
          style={{ width: 200 }}
          placeholder="Chọn loại bài thi"
        >
          <Option value="all">
            <QuestionCircleOutlined /> Tất cả
          </Option>
          <Option value="reading">
            <BookOutlined /> Chỉ Reading
          </Option>
          <Option value="listening">
            <SoundOutlined /> Chỉ Listening
          </Option>
          <Option value="both">
            <BookOutlined /> <SoundOutlined /> Reading + Listening
          </Option>
        </Select>
      </div>

      {/* Exam List */}
      {loading ? (
        <div className="loading-wrapper">
          <Spin size="large" />
          <p>Đang tải danh sách đề thi...</p>
        </div>
      ) : exams.length === 0 ? (
        <Empty description="Không có đề thi nào phù hợp" />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {exams.map((exam) => (
              <Col xs={24} sm={12} md={8} lg={6} key={exam._id}>
                <Card
                  hoverable
                  className="exam-card"
                  cover={
                    <div className="exam-card-cover">
                      <h3>{exam.title}</h3>
                    </div>
                  }
                  actions={[
                    <Button
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      onClick={() => handleViewDetail(exam.slug)}
                    >
                      Xem chi tiết
                    </Button>,
                  ]}
                >
                  <div className="exam-card-body">
                    {/* Tags */}
                    <div className="exam-tags">
                      {exam.hasReading && (
                        <Tag icon={<BookOutlined />} color="blue">
                          Reading ({exam.readingCount})
                        </Tag>
                      )}
                      {exam.hasListening && (
                        <Tag icon={<SoundOutlined />} color="green">
                          Listening ({exam.listeningCount})
                        </Tag>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="exam-stats">
                      <div className="stat-item">
                        <QuestionCircleOutlined />
                        <span>{exam.totalQuestions} câu</span>
                      </div>
                      <div className="stat-item">
                        <ClockCircleOutlined />
                        <span>{exam.duration} phút</span>
                      </div>
                    </div>

                    {/* Description */}
                    {exam.description && (
                      <p className="exam-description">{exam.description}</p>
                    )}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          <div className="pagination-wrapper">
            <Pagination
              current={currentPage}
              total={totalItems}
              pageSize={8}
              onChange={handlePageChange}
              showSizeChanger={false}
              showTotal={(total) => `Tổng ${total} đề thi`}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default KyThi;
