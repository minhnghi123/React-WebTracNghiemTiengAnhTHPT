import React, { useEffect, useState } from 'react';
import { Row, Col, Button, Table, Space, Card, Spin, Collapse, Modal } from 'antd';
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
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  useEffect(() => {
    const fetchExamFrequencyForExam = async (exam: any): Promise<ExamFrequency | null> => {
      try {
        const res = await ClassroomAPI.getAllStudentResultsbyExam(classroom._id, exam._id);
        if (res.success) {
          const results: ResultItem[] = res.data;
          const studentMaxScores: { [studentId: string]: number } = {};
          results.forEach((result) => {
            const studentId = result.userId && result.userId._id ? result.userId._id : "unknown";
            const score = result.score;
            if (!studentMaxScores[studentId] || score > studentMaxScores[studentId]) {
              studentMaxScores[studentId] = score;
            }
          });
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

  const fetchSpecificExamResult = async (examId: string) => {
    setIsResultModalOpen(true);
    setLoadingResults(true);
    try {
      const response = await ClassroomAPI.getSpecificExamResult(examId, classroom._id);
      if (response.success) {
        setExamResults([response.data]);
      } else {
        setExamResults([]);
      }
    } catch (error) {
      setExamResults([]);
    } finally {
      setLoadingResults(false);
    }
  };

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
                    <Button
                      type="link"
                      onClick={() => openExamContent({
                        _id: record._id,
                        title: record.title,
                        questions: record.questions,
                        duration: record.duration,
                        startTime: record.startTime,
                        isPublic: record.isPublic,
                        slug: '',
                        createdAt: new Date(),
                        listeningExams: []
                      })}
                    >
                      Xem chi tiết
                    </Button>
                    <Button
                      type="link"
                      onClick={() => {
                        setSelectedExam(record);
                        fetchSpecificExamResult(record._id || "");
                      }}
                    >
                      Xem kết quả
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

      <Modal
        title={`Kết quả bài kiểm tra: ${selectedExam?.title || ''}`}
        visible={isResultModalOpen}
        onCancel={() => setIsResultModalOpen(false)}
        footer={null}
        width={800}
      >
        {loadingResults ? (
          <Spin tip="Đang tải kết quả..." />
        ) : examResults.length > 0 ? (
          <Table
            dataSource={examResults}
            rowKey="_id"
            columns={[
              {
                title: 'Học sinh',
                dataIndex: ['userId', 'email'],
                key: 'email',
              },
              {
                title: 'Điểm',
                dataIndex: 'score',
                key: 'score',
              },
              {
                title: 'Ngày làm bài',
                dataIndex: 'createdAt',
                key: 'createdAt',
                render: (text: string) => new Date(text).toLocaleString(),
              },
            ]}
            pagination={false}
          />
        ) : (
          <p>Không có kết quả nào.</p>
        )}
      </Modal>
    </Row>
  );
};

export default ExamsTab;
