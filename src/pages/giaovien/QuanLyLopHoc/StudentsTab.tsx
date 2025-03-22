import React from 'react';
import { Row, Col, Button, List, Avatar, Upload, Table } from 'antd';
import { Student } from '@/services/teacher/ClassroomAPI';

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
      
    </>
  );
};

export default StudentsTab;