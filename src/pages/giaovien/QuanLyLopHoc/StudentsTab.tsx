import React, { useState } from 'react';
import { Row, Col, Button, List, Avatar, Upload, Table, Modal, Spin } from 'antd';
import { Student, ClassroomAPI } from '@/services/teacher/ClassroomAPI';
import ChiTietKetQua from '@/pages/default/KyThi/KetQua/ChiTietKetQua';

interface StudentsTabProps {
  classroom: any;
  failedStudents: Student[];
  handleExcelUpload: (file: File) => boolean;
  openStudentContent: (student: Student) => void;
  handleRemoveStudent: (id: string) => void;
  fetchAllStudents: () => void;
  setIsStudentListModalOpen: (open: boolean) => void;
}

const StudentsTab: React.FC<StudentsTabProps> = ({
  classroom,
  failedStudents,
  handleExcelUpload,
  openStudentContent,
  handleRemoveStudent,
  fetchAllStudents,
  setIsStudentListModalOpen,
}) => {
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [studentResults, setStudentResults] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailedResult, setDetailedResult] = useState<any | null>(null);

  const fetchStudentResults = async (student: Student) => {
    setSelectedStudent(student);
    setIsResultsModalOpen(true);
    setLoadingResults(true);
    try {
      const response = await ClassroomAPI.getStudentResultsForAllExamsInClassroom(
        classroom._id,
        student._id
      );
      if (response.success) {
        setStudentResults(response.data);
      } else {
        setStudentResults([]);
      }
    } catch (error) {
      setStudentResults([]);
    } finally {
      setLoadingResults(false);
    }
  };

  const fetchDetailedResult = async (examId: string) => {
    setLoadingResults(true);
    try {
      const response = await ClassroomAPI.getStudentResultForSpecificExam(
        classroom._id,
        selectedStudent!._id,
        examId
      );
      if (response.success) {
        setDetailedResult(response.data);
        setIsDetailModalOpen(true);
      }
    } catch (error) {
      console.error("Failed to fetch detailed results:", error);
    } finally {
      setLoadingResults(false);
    }
  };

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <h3 className="detail-subtitle">Danh sách học sinh</h3>
          <List
            className="detail-list"
            bordered
            dataSource={Array.isArray(classroom.students) ? classroom.students : []}
            renderItem={(student: any) => (
              <List.Item
                actions={[
                  <Button type="link" onClick={() => openStudentContent(student)}>
                    Xem chi tiết
                  </Button>,
                  <Button type="link" danger onClick={() => handleRemoveStudent(student._id)}>
                    Xóa
                  </Button>,
                  <Button type="link" onClick={() => fetchStudentResults(student)}>
                    Xem kết quả
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar src={student.avatar} alt={student.username} />}
                  title={student.username}
                  description={student.email}
                />
              </List.Item>
            )}
          />
          <div className="detail-action-group">
            <Button
              type="primary"
              onClick={() => {
                fetchAllStudents();
                setIsStudentListModalOpen(true);
              }}
            >
              Thêm học sinh mới
            </Button>
          </div>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <h3 className="detail-subtitle">Thêm học sinh từ file Excel</h3>
          <h3>Lưu ý: File Excel phải có 1 trong các cột: ID, Username, Email</h3>
          <Upload beforeUpload={handleExcelUpload} accept=".xlsx,.xls" showUploadList={false}>
            <Button type="primary">Upload Excel</Button>
          </Upload>
        </Col>
      </Row>
      {failedStudents.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <h4>Các học sinh không được thêm thành công:</h4>
            <Table
              dataSource={failedStudents}
              rowKey="_id"
              pagination={false}
              columns={[
                {
                  title: "ID",
                  dataIndex: "_id",
                  key: "_id",
                },
                {
                  title: "Username",
                  dataIndex: "username",
                  key: "username",
                },
                {
                  title: "Email",
                  dataIndex: "email",
                  key: "email",
                },
              ]}
            />
          </Col>
        </Row>
      )}

      {/* Modal hiển thị kết quả học sinh */}
      <Modal
        title={`Kết quả của học sinh: ${selectedStudent?.username || ''}`}
        visible={isResultsModalOpen}
        onCancel={() => setIsResultsModalOpen(false)}
        footer={null}
        width={800}
      >
        {loadingResults ? (
          <Spin tip="Đang tải kết quả..." />
        ) : studentResults.length > 0 ? (
          <Table
            dataSource={studentResults}
            rowKey="_id"
            columns={[
              {
                title: 'Bài kiểm tra',
                dataIndex: ['examId', 'title'],
                key: 'examTitle',
              },
              {
                title: 'Điểm',
                dataIndex: 'score',
                key: 'score',
              },
              {
                title: 'Số câu đúng',
                dataIndex: 'correctAnswers',
                key: 'correctAnswers',
              },
              {
                title: 'Thời gian làm',
                dataIndex: 'duration',
                key: 'duration',
                render: (text: number) => `${text} phút`,
              },
              {
                title: 'Ngày làm bài',
                dataIndex: 'createdAt',
                key: 'createdAt',
                render: (text: string) => new Date(text).toLocaleString(),
              },
              {
                title: 'Xem chi tiết kết quả',
                key: 'viewDetails',
                render: (_: any, record: any) => (
                  <button
                    className="btn btn-primary"
                    onClick={() => fetchDetailedResult(record.examId._id)}
                  >
                    Xem
                  </button>
                ),
              },
            ]}
            pagination={false}
          />
        ) : (
          <p>Không có kết quả nào.</p>
        )}
      </Modal>

      {/* Modal hiển thị chi tiết kết quả */}
      <Modal
        title={`Chi tiết kết quả của học sinh: ${selectedStudent?.username || ''}`}
        visible={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={800}
      >
        {loadingResults ? (
          <Spin tip="Đang tải chi tiết kết quả..." />
        ) : detailedResult ? (
          <ChiTietKetQua result={detailedResult} />
        ) : (
          <p>Không có dữ liệu chi tiết kết quả.</p>
        )}
      </Modal>
    </>
  );
};

export default StudentsTab;