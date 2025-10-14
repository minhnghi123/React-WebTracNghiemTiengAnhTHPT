import { Exam } from "@/services/teacher/Teacher";
import { Card, Col, Row, Tag, Typography, Input, Select, Empty } from "antd";
import {
  ClockCircleOutlined,
  QuestionCircleOutlined,
  CalendarOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";

import { useEffect, useState } from "react";
import { ExamAPIStudent } from "@/services/student";
import AppLink from "@/components/AppLink";
import "./KyThi.css";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

export const KyThi = () => {
  const [data, setData] = useState<Exam[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [searchText, setSearchText] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string | undefined>();

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleClassFilter = (value: string | undefined) => {
    setSelectedClass(value);
  };

  const getAllExam = async (page: number) => {
    try {
      const rq = await ExamAPIStudent.getAllExam1000(page);
      if (rq?.code === 200) {
        setData((prev) => {
          const merged = [...(prev || []), ...rq.exams];
          const unique = Array.from(
            new Map(merged.map((i) => [i.slug, i])).values()
          );
          return unique;
        });
        setTotal(rq?.total);
      }
    } catch (error: any) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    getAllExam(1);
  }, []);

  useEffect(() => {
    if (total > 1) {
      Promise.all(
        Array.from({ length: total - 1 }, (_, i) => getAllExam(i + 2))
      );
    }
  }, [total]);

  const formatDate = (date?: string | Date) => {
    if (!date) return "Không có";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("vi-VN");
  };

  const filteredData = data.filter((exam) => {
    const matchesSearch = ((exam.title ?? "") + " ")
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesClass = selectedClass ? exam.class === selectedClass : true;
    return matchesSearch && matchesClass;
  });

  const now = new Date().getTime();
  const ongoing = filteredData.filter((exam) => {
    const start = new Date(exam.startTime).getTime();
    const end = exam.endTime ? new Date(exam.endTime).getTime() : Infinity;
    return start <= now && now <= end;
  });

  const ended = filteredData.filter((exam) => {
    const end = exam.endTime ? new Date(exam.endTime).getTime() : 0;
    return now > end;
  });

  const renderExamList = (exams: Exam[], status: "ongoing" | "ended") => (
    <Row gutter={[24, 24]}>
      {exams.map((exam) => (
        <Col
          xs={24}
          sm={12}
          lg={8}
          xl={6}
          key={exam._id}
          style={{ display: "flex" }}
        >
          <Card
            className={`exam-card ${status}-exam`}
            hoverable
            style={{ width: "100%" }}
          >
            <div className="exam-card-header">
              <Tag
                color={status === "ongoing" ? "green" : "default"}
                className="exam-status-tag"
              >
                {status === "ongoing" ? "🟢 Đang diễn ra" : "⚪ Đã kết thúc"}
              </Tag>
            </div>

            <Title level={5} className="exam-title" title={exam.title}>
              {exam.title}
            </Title>

            {exam.description && (
              <Text
                type="secondary"
                className="exam-description"
                title={exam.description}
              >
                {exam.description}
              </Text>
            )}

            <div className="exam-date-section">
              <CalendarOutlined className="date-icon" />
              <Text type="secondary" className="exam-date-text">
                {formatDate(exam.startTime as unknown as string)}
              </Text>
            </div>

            <div className="exam-info-row">
              <div className="info-item-inline">
                <ClockCircleOutlined />
                <span>{exam.duration}p</span>
              </div>
              <div className="info-item-inline">
                <QuestionCircleOutlined />
                <span>{exam.questions?.length ?? 0} câu</span>
              </div>
              <div className="info-item-inline">
                <span>Lớp {exam.class}</span>
              </div>
            </div>

            {exam.topic && exam.topic.length > 0 && (
              <div className="exam-topics">
                {exam.topic.slice(0, 2).map((topic, index) => (
                  <Tag color="cyan" key={index} className="topic-tag">
                    {topic}
                  </Tag>
                ))}
                {exam.topic.length > 2 && (
                  <Tag className="topic-tag">+{exam.topic.length - 2}</Tag>
                )}
              </div>
            )}

            <AppLink
              to={`/KyThi/ChiTiet/${exam.slug}`}
              style={{ textDecoration: "none" }}
            >
              <button className="exam-action-button">Làm bài</button>
            </AppLink>
          </Card>
        </Col>
      ))}
    </Row>
  );

  return (
    <div className="exam-list-container">
      <div className="exam-list-header">
        <div className="header-content">
          <Title level={2} className="page-title">
            Kho Đề Thi Online
          </Title>
          <Text type="secondary" className="page-description">
            Nâng cao kỹ năng với hệ thống đề thi chuẩn hóa, đa dạng và được cập
            nhật liên tục
          </Text>
        </div>
      </div>

      <div className="filter-section">
        <Search
          placeholder="Tìm kiếm đề thi..."
          allowClear
          enterButton="Tìm kiếm"
          size="large"
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          className="search-input"
          prefix={<SearchOutlined />}
        />
        <Select
          placeholder="Chọn lớp"
          allowClear
          size="large"
          onChange={handleClassFilter}
          className="filter-select"
          suffixIcon={<FilterOutlined />}
          options={[
            { value: "10", label: "Lớp 10" },
            { value: "11", label: "Lớp 11" },
            { value: "12", label: "Lớp 12" },
          ]}
        />
      </div>

      <div className="exam-sections">
        {ongoing.length > 0 && (
          <div className="exam-section">
            <div className="section-header">
              <Title level={3} className="section-title ongoing">
                🟢 Đang diễn ra ({ongoing.length})
              </Title>
            </div>
            {renderExamList(ongoing, "ongoing")}
          </div>
        )}

        {ended.length > 0 && (
          <div className="exam-section">
            <div className="section-header">
              <Title level={3} className="section-title ended">
                ⚪ Đã kết thúc ({ended.length})
              </Title>
            </div>
            {renderExamList(ended, "ended")}
          </div>
        )}

        {filteredData.length === 0 && (
          <Empty
            description="Không tìm thấy đề thi nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </div>
    </div>
  );
};
