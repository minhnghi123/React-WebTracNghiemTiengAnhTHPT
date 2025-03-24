import React, { useEffect, useState } from 'react';
import { Row, Col, Button, Table, Space, Card, Spin, Collapse } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Exam } from '@/services/teacher/Teacher';
import { ClassroomAPI } from '@/services/teacher/ClassroomAPI';

const { Panel } = Collapse;

interface ExamsTabProps {
  classroom: any;
  examColumns: any;
  openExamContent: (exam: Exam) => void;
  handleRemoveExam: (id: string) => void;
  setIsExamModalOpen: (open: boolean) => void;
}

interface ResultItem {
  _id: string;
  examId: {
    _id?: string;
    title?: string;
    questions?: any[];
  };
  score: number;
  percentage: number;
  userId?: {
    _id?: string;
    email?: string;
  };
}

interface ExamFrequency {
  examId: string;
  title: string;
  frequency: { score: string; count: number }[];
}

const ExamsTab: React.FC<ExamsTabProps> = ({
  classroom,
  examColumns,
  openExamContent,
  handleRemoveExam,
  setIsExamModalOpen,
}) => {
  const [examFrequencies, setExamFrequencies] = useState<ExamFrequency[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchExamFrequencyForExam = async (exam: any): Promise<ExamFrequency | null> => {
      try {
        // Giả sử ClassroomAPI.getStudentResultsByExam nhận vào exam._id và trả về đối tượng API với dữ liệu:
        // { success: true, message: string, data: ResultItem[] }
        const res = await ClassroomAPI.getAllStudentResultsbyExam(classroom._id,exam._id);
        if (res.success) {
          const results: ResultItem[] = res.data;
          // Tính điểm cao nhất của mỗi học sinh cho kỳ thi này
          const studentMaxScores: { [studentId: string]: number } = {};
          results.forEach((result) => {
            const studentId = result.userId && result.userId._id ? result.userId._id : "unknown";
            const score = result.score;
            if (!studentMaxScores[studentId] || score > studentMaxScores[studentId]) {
              studentMaxScores[studentId] = score;
            }
          });
          // Tạo bảng tần số cho điểm từ 0 đến 10
          const frequency: { [key: number]: number } = {};
          for (let i = 0; i <= 10; i++) {
            frequency[i] = 0;
          }
          Object.values(studentMaxScores).forEach((score) => {
            let s = Math.round(score);
            if (s < 0) s = 0;
            if (s > 10) s = 10;
            frequency[s] = (frequency[s] || 0) + 1;
          });
          const freqArray = [];
          for (let i = 0; i <= 10; i++) {
            freqArray.push({ score: i.toString(), count: frequency[i] });
          }
          return {
            examId: exam._id,
            title: exam.title || "No Title",
            frequency: freqArray,
          };
        }
      } catch (error) {
        console.error(`Error fetching results for exam ${exam._id}`, error);
      }
      return null;
    };

    const fetchAllExamFrequencies = async () => {
      setLoading(true);
      try {
        // Gọi API riêng cho mỗi kỳ thi
        const promises = classroom.exams.map((exam: any) =>
          fetchExamFrequencyForExam(exam)
        );
        const results = await Promise.all(promises);
        const frequencies = results.filter((item) => item !== null) as ExamFrequency[];
        setExamFrequencies(frequencies);
      } catch (error) {
        console.error("Error fetching exam frequencies", error);
      } finally {
        setLoading(false);
      }
    };

    if (classroom._id && Array.isArray(classroom.exams)) {
      fetchAllExamFrequencies();
    }
  }, [classroom._id, classroom.exams]);

  return (
    <Row gutter={[16, 16]}>
      <div className="detail-action-group" style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setIsExamModalOpen(true)}>
          Thêm bài kiểm tra
        </Button>
      </div>
      <Col span={24}>
        <h3 className="detail-subtitle">Danh sách bài kiểm tra của lớp</h3>
        {classroom.exams && (
          <Table
            dataSource={classroom.exams}
            rowKey="_id"
            showSorterTooltip={false}
            columns={[
              ...examColumns,
              {
                title: "",
                key: "action",
                render: (_, record: Exam) => (
                  <Space size="small">
                    <Button type="link" onClick={() => openExamContent({
                      _id: record._id,
                      title: record.title,
                      questions: record.questions,
                      duration: record.duration,
                      startTime: record.startTime,
                      isPublic: record.isPublic,
                      slug: '',
                      createdAt: new Date()
                    })}>
                      Xem chi tiết
                    </Button>
                    <Button type="link" danger onClick={() => handleRemoveExam(record._id || "")}>
                      Xóa
                    </Button>
                  </Space>
                ),
              },
            ]}
          />
        )}
      </Col>
      <Col span={24}>
        <h3 className="detail-subtitle">Biểu đồ tần số điểm cho từng bài kiểm tra</h3>
        {loading ? (
          <Spin />
        ) : examFrequencies.length > 0 ? (
          <Collapse accordion>
            {examFrequencies.map((examFreq) => (
              <Panel header={examFreq.title} key={examFreq.examId}>
                <Card bordered={false}>
                  <BarChart width={400} height={250} data={examFreq.frequency}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="score" />
                    <YAxis allowDecimals={false} />
                    <Tooltip formatter={(value: any) => `${value} học sinh`} />
                    <Legend />
                    <Bar dataKey="count" fill="#82ca9d" name="Số lượng học sinh" />
                  </BarChart>
                </Card>
              </Panel>
            ))}
          </Collapse>
        ) : (
          <p>Không có dữ liệu kết quả cho bài kiểm tra.</p>
        )}
      </Col>
    </Row>
  );
};

export default ExamsTab;
