import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Spin, Row, Col, message, Modal } from 'antd';
import { ClassroomAPI, Classroom } from '@/services/teacher/ClassroomAPI';
import AddClassModal from './addClass';
import UpdateClassModal from './updateClass';

export const QuanLyLopHoc = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const data = await ClassroomAPI.getAllClassrooms();
        // Lấy đúng mảng classrooms từ dữ liệu trả về
        if (data.success) {
          setClassrooms(data.classrooms);
        } else {
          console.log(data.message);
        }
      } catch (err) {
        setError('Lỗi khi lấy dữ liệu lớp học');
      } finally {
        setLoading(false);
      }
    };

    fetchClassrooms();
  }, []);

  const handleClassroomAdded = (newClassroom: Classroom) => {
    setClassrooms([...classrooms, newClassroom]);
  };

  const handleClassroomUpdated = (updatedClassroom: Classroom) => {
    setClassrooms(
      classrooms.map(classroom =>
        classroom._id === updatedClassroom._id ? updatedClassroom : classroom
      )
    );
  };

  const handleEditClick = (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteClick = (classroomId: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa lớp học này không?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await ClassroomAPI.deleteClassroom(classroomId);
          setClassrooms(classrooms.filter(classroom => classroom._id !== classroomId));
          message.success('Xóa lớp học thành công');
        } catch (err) {
          setError('Lỗi khi xóa lớp học');
          message.error('Lỗi khi xóa lớp học');
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-danger mt-5">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Quản Lý Lớp Học</h1>
     
        <button 
        style={{backgroundColor: "#4CAF50", color: "white", border: "none", padding: "10px 20px", textAlign: "center", textDecoration: "none", display: "inline-block", fontSize: "16px", margin: "4px 2px", cursor: "pointer"}}  
        className="btn my-3" 
        onClick={() => setIsAddModalOpen(true)}>
       Thêm Lớp Học  
        </button>
     
      {classrooms.length === 0 ? (
        <div className="text-center">Không có lớp học nào</div>
      ) : (
        <Row gutter={[16, 16]}>
          {classrooms.map((classroom) => (
            <Col xs={24} sm={12} md={8} key={classroom._id}>
              <Card title={classroom.title} bordered={false}>
                <p>
                  <strong>Giáo viên:</strong>{' '}
                  {classroom.teacherId && (classroom.teacherId as any).username}
                </p>
                <p>
                  <strong>Trạng thái:</strong> {classroom.status}
                </p>
                <p>
                  <strong>Số lượng học sinh:</strong> {classroom.students.length}
                </p>
                <p>
                  <strong>Số lượng bài kiểm tra:</strong> {classroom.exams.length}
                </p>
                <div className="d-flex justify-content-between mt-3">
                  <Link to={`/giaovien/QuanLyLopHoc/${classroom._id}`}>
                    <Button type="default">Xem chi tiết</Button>
                  </Link>
                  <Button type="primary" onClick={() => handleEditClick(classroom)}>
                    Chỉnh sửa
                  </Button>
                  <Button type="default" danger onClick={() => handleDeleteClick(classroom._id!)}>
                    Xóa
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
      <AddClassModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onClassroomAdded={handleClassroomAdded}
      />
      <UpdateClassModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        _classroom_id={selectedClassroom?._id || ''}
        onClassroomUpdated={handleClassroomUpdated}
      />
    </div>
  );
};
