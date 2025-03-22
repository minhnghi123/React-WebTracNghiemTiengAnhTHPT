import React, { useEffect, useState } from "react";
import { Row, Col, Card, Spin, Button } from "antd";
import { PieChart, Pie, Tooltip, Cell, Legend } from "recharts";
import { ClassroomAPI } from "@/services/teacher/ClassroomAPI";

interface OverviewTabProps {
  classroom: any;
  handleDownloadExcel: () => void;
}

interface CategorizedCounts {
  excellent: number;
  good: number;
  average: number;
  poor: number;
  totalStudents: number;
}

interface GetCategorizedResultsResponse {
  success: boolean;
  message: string;
  data: CategorizedCounts;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const OverviewTab: React.FC<OverviewTabProps> = ({
  classroom,
  handleDownloadExcel,
}) => {
  const teacherName =
    typeof classroom.teacherId === "object"
      ? (classroom.teacherId as any).username
      : classroom.teacherId;

  const [categorizedCounts, setCategorizedCounts] = useState<CategorizedCounts>(
    {
      excellent: 0,
      good: 0,
      average: 0,
      poor: 0,
      totalStudents: 0,
    }
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [pieData, setPieData] = useState<any[]>([]);

  useEffect(() => {
    const fetchStudentResults = async () => {
      setLoading(true);
      try {
        // Gọi API lấy kết quả phân loại học sinh theo điểm trung bình
        const res = (await ClassroomAPI.getAllStudentResults(
          classroom._id
        )) as GetCategorizedResultsResponse;
        if (res.success) {
          setCategorizedCounts(res.data);
          setPieData([
            { name: "Giỏi", value: res.data.excellent },
            { name: "Khá", value: res.data.good },
            { name: "Trung Bình", value: res.data.average },
            { name: "Yếu", value: res.data.poor },
          ]);
        }
      } catch (error) {
        console.error("Error fetching student categorized results", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentResults();
  }, [classroom._id]);

  return (
    <>
      <p className="detail-info">
        <strong>Số lượng học sinh: </strong>
        {Array.isArray(classroom.students) ? classroom.students.length : 0}
      </p>
      <p className="detail-info">
        <strong>Số lượng bài kiểm tra: </strong>
        {Array.isArray(classroom.exams) ? classroom.exams.length : 0}
      </p>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <h3 className="detail-subtitle">Tải xuống kết quả học sinh</h3>
          <Button type="primary" onClick={handleDownloadExcel}>
            Tải xuống Excel
          </Button>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card title="Thống kê học sinh theo điểm" bordered={false}>
            {loading ? (
              <Spin />
            ) : (
              <PieChart width={300} height={250}>
                <Pie
                  data={pieData}
                  cx={150}
                  cy={120}
                  innerRadius={40}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `${value} học sinh`} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card title="Tóm tắt kết quả" bordered={false}>
            {loading ? (
              <Spin />
            ) : (
              <>
                <p>
                  <strong>Giỏi:</strong> {categorizedCounts.excellent} học sinh
                </p>
                <p>
                  <strong>Khá:</strong> {categorizedCounts.good} học sinh
                </p>
                <p>
                  <strong>Trung Bình:</strong> {categorizedCounts.average} học
                  sinh
                </p>
                <p>
                  <strong>Yếu:</strong> {categorizedCounts.poor} học sinh
                </p>
                <p>
                  <strong>Tổng số:</strong> {categorizedCounts.totalStudents}{" "}
                  học sinh
                </p>
              </>
            )}
          </Card>
        </Col>
      </Row>

    </>
  );
};

export default OverviewTab;
