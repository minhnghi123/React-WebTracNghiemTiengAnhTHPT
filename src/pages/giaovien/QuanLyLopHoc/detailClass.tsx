import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, List, Button, Input, Row, Col, message, Modal, Pagination, Table, Space } from 'antd';
import { ClassroomAPI, Classroom, Student } from '@/services/teacher/ClassroomAPI';
import { ExamAPI, Exam } from '@/services/teacher/Teacher';
import UpdateClassModal from './updateClass';
import ViewExamDetail from '../QuanLyDeThi/DeThi/deltailExam';
import '../DetailClass.css';
import { ColumnsType } from 'antd/es/table';
const columns: ColumnsType<Exam> = [
  {
    title: "Tiêu đề",
    dataIndex: "title",
    key: "title",
  },
  {
    title: "Mô tả",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "Thời gian phút",
    dataIndex: "duration",
    sorter: (a: Exam, b: Exam) => a.duration - b.duration,
    key: "duration",
  },
  {
    title: "Thời gian bắt đầu",
    dataIndex: "startTime",
    key: "startTime",
    sorter: (a: Exam, b: Exam) =>
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    render: (text: string) => (text ? new Date(text).toLocaleString() : "N/A"),
  },
  {
    title: "Thời gian kết thúc",
    dataIndex: "endTime",
    key: "endTime",
    sorter: (a: Exam, b: Exam) =>
      new Date(a.endTime || 0).getTime() - new Date(b.endTime || 0).getTime(),
    render: (text: string) => (text ? new Date(text).toLocaleString() : "N/A"),
  },

  {
    title: "Số câu hỏi",
    dataIndex: "questions",
    key: "questions",
    sorter: (a: Exam, b: Exam) =>
      (a.questions?.length ?? 0) - (b.questions?.length ?? 0),
    render: (record: Question[]) => record.length ?? 0,
  },
];
const DetailClass: React.FC = () => {
  const { _classroom_id } = useParams<{ _classroom_id: string }>();
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string>('');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [listExam, setListExam] = useState<Exam[]>([]);
  const [isExamModalOpen, setIsExamModalOpen] = useState<boolean>(false);
  const [examToView, setExamToView] = useState<Exam | null>(null);
  const [isExamContentModalOpen, setIsExamContentModalOpen] = useState<boolean>(false);

  // State cho danh sách tất cả học sinh (để thêm từ danh sách)
  const [listAllStudents, setListAllStudents] = useState<Student[]>([]);
  const [isStudentListModalOpen, setIsStudentListModalOpen] = useState<boolean>(false);
  const [studentToView, setStudentToView] = useState<Student | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState<boolean>(false);
  const [searchStudentTerm, setSearchStudentTerm] = useState<string>('');

  // State cho modal "Chọn bài kiểm tra"
  const [searchExamTerm, setSearchExamTerm] = useState<string>('');
  const [examCurrentPage, setExamCurrentPage] = useState<number>(1);
  const examPageSize = 5;

  const fetchClassroom = async () => {
    try {
      if (_classroom_id) {
        const data = await ClassroomAPI.getClassroomById(_classroom_id);
        if (data.success) {
          setClassroom(data.classroom);
        } else {
          setError(data.message);
        }
      }
    } catch (error) {
      setError('Lỗi khi lấy thông tin lớp học');
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    try {
      let currentPage = 1;
      let totalPages = 1;
      let exams: Exam[] = [];
  
      // Vòng lặp fetch tất cả các trang
      while (currentPage <= totalPages) {
        const response = await ExamAPI.getAllExam(currentPage);
        if (response.success) {
          exams = exams.concat(response.data);
          totalPages = response.pagination.totalPages;
          currentPage++;
        } else {
          message.error('Lỗi khi lấy danh sách bài kiểm tra');
          break;
        }
      }
      setListExam(exams);
    } catch (error) {
      message.error('Lỗi khi lấy danh sách bài kiểm tra');
    }
  };

  // Lấy danh sách tất cả học sinh từ API
  const fetchAllStudents = async () => {
    try {
      const response = await ClassroomAPI.getAllStudents();
      if (response.success) {
        setListAllStudents(response.students);
      } else {
        message.error(response.message || "Lỗi khi lấy danh sách học sinh");
      }
    } catch (error) {
      message.error("Lỗi khi lấy danh sách học sinh");
    }
  };

  useEffect(() => {
    fetchClassroom();
    fetchExams();
  }, [_classroom_id]);

  const handleAddStudent = async () => {
    try {
      await ClassroomAPI.addStudentsToClassroom(
        _classroom_id || "",
        [studentId]
      );
      fetchClassroom();
      setStudentId('');
      message.success("Thêm học sinh thành công");
    } catch (err) {
      setError('Lỗi khi thêm học sinh');
      message.error("Lỗi khi thêm học sinh");
    }
  };

  const handleAddStudentItem = async (id: string) => {
    try {
      await ClassroomAPI.addStudentsToClassroom(_classroom_id || "", [id]);
      fetchClassroom();
      message.success("Thêm học sinh thành công");
    } catch (err) {
      message.error("Lỗi khi thêm học sinh");
    }
  };

  const handleRemoveStudent = async (id: string) => {
    try {
      await ClassroomAPI.removeStudentFromClassroom(
        _classroom_id || "",
        id
      );
      fetchClassroom();
      message.success("Xóa học sinh thành công");
    } catch (err) {
      setError('Lỗi khi xóa học sinh');
      message.error("Lỗi khi xóa học sinh");
    }
  };

  const handleRemoveStudents = async () => {
    try {
      await ClassroomAPI.removeStudentsFromClassroom(
        _classroom_id || "",
        classroom?.students.map((student: any) => student._id) || []
      );
      fetchClassroom();
      message.success("Xóa tất cả học sinh thành công");
    } catch (err) {
      setError('Lỗi khi xóa tất cả học sinh');
      message.error("Lỗi khi xóa tất cả học sinh");
    }
  };

  const handleAddExamItem = async (examId: string) => {
    try {
      await ClassroomAPI.addExamToClassroom(_classroom_id || "", examId);
      await fetchClassroom();
      message.success("Thêm bài kiểm tra thành công");
    } catch (err) {
      message.error("Lỗi khi thêm bài kiểm tra");
    }
  };

  const handleRemoveExam = async (id: string) => {
    try {
      await ClassroomAPI.removeExamFromClassroom(_classroom_id || "", id);
      fetchClassroom();
      message.success("Xóa bài kiểm tra thành công");
    } catch (err) {
      setError('Lỗi khi xóa bài kiểm tra');
      message.error("Lỗi khi xóa bài kiểm tra");
    }
  };

  const handleClassroomUpdated = (updatedClassroom: Classroom) => {
    fetchClassroom();
  };

  const openExamContent = (exam: Exam) => {
    setExamToView(exam);
    setIsExamContentModalOpen(true);
  };

  const openStudentContent = (student: Student) => {
    setStudentToView(student);
    setIsStudentModalOpen(true);
  };

  if (loading) {
    return <div className="detail-loading">Đang tải...</div>;
  }

  if (error) {
    return <div className="detail-error">{error}</div>;
  }

  if (!classroom) {
    return <div className="detail-error">Không tìm thấy lớp học</div>;
  }

  // Nếu teacherId là object, hiển thị tên giáo viên
  const teacherName =
    typeof classroom.teacherId === 'object'
      ? (classroom.teacherId as any).username
      : classroom.teacherId;

  // Lọc danh sách học sinh theo ô tìm kiếm
  const filteredStudents = listAllStudents.filter((student) => {
    const term = searchStudentTerm.toLowerCase();
    return (
      student._id.toLowerCase().includes(term) ||
      student.username.toLowerCase().includes(term) ||
      student.email.toLowerCase().includes(term)
    );
  });

  // Lọc danh sách bài kiểm tra theo ô tìm kiếm (nếu có)
  const filteredExams = listExam.filter((exam) => {
    const term = searchExamTerm.toLowerCase();
    return (
      exam.title?.toLowerCase().includes(term) ||
      (exam.description && exam.description.toLowerCase().includes(term))
    );
  });
  const paginatedExams = filteredExams.slice(
    (examCurrentPage - 1) * examPageSize,
    examCurrentPage * examPageSize
  );

  return (
    <div className="detail-class-container">
      <Card title="Chi tiết lớp học" bordered={false} className="detail-card">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <h3 className="detail-title">{classroom.title}</h3>
            <p className="detail-info"><strong>Giáo viên:</strong> {teacherName}</p>
            <p className="detail-info"><strong>Trạng thái:</strong> {classroom.status}</p>
            <p className="detail-info">
              <strong>Số lượng học sinh:</strong> {Array.isArray(classroom.students) ? classroom.students.length : 0}
            </p>
            <p className="detail-info">
              <strong>Số lượng bài kiểm tra:</strong> {Array.isArray(classroom.exams) ? classroom.exams.length : 0}
            </p>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="detail-row my-4" >
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
                  {student.username}
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
                Chọn từ danh sách
              </Button>
              <Button type="default" onClick={handleRemoveStudents} className="detail-btn-margin">
                Xóa tất cả
              </Button>
            </div>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="detail-row my-4">
          <Col span={24}>
            <h3 className="detail-subtitle">Danh sách bài kiểm tra của lớp</h3>
            {classroom.exams ? (
              <Table
                dataSource={classroom.exams}
                showSorterTooltip={false}
                columns={[
                  ...(columns as ColumnsType<any>),
                  {
                    title: "",
                    key: "action",
                    render: (_, record) => (
                      <Space size="small">
                        <Button type="link" onClick={() => openExamContent(record)}>
                          Xem chi tiết
                        </Button>,
                        <Button type="link" danger onClick={() => handleRemoveExam(record._id)}>
                          Xóa
                        </Button>
                      </Space>
                    ),
                  },
                ]}
           
              />
            ) : null}
            <div className="detail-action-group">
              <Button type="primary" onClick={() => setIsExamModalOpen(true)}>
                Thêm bài kiểm tra
              </Button>
            </div>
          </Col>
        </Row>

        <Row className="detail-row">
          <Col span={24} className="detail-update">
            <Button type="primary" onClick={() => setIsUpdateModalOpen(true)}>
              Cập nhật lớp học
            </Button>
          </Col>
        </Row>
      </Card>

      <UpdateClassModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        _classroom_id={classroom._id || ""}
        onClassroomUpdated={handleClassroomUpdated}
      />

      {/* Modal chọn bài kiểm tra */}
      <Modal
        title="Chọn bài kiểm tra"
        visible={isExamModalOpen}
        onCancel={() => setIsExamModalOpen(false)}
        footer={null}
        className="detail-modal"
      >
        <Input.Search
          placeholder="Tìm theo tiêu đề, mô tả"
          value={searchExamTerm}
          onChange={(e) => {
            setSearchExamTerm(e.target.value);
            setExamCurrentPage(1);
          }}
          style={{ marginBottom: 16 }}
        />
        <List
          dataSource={paginatedExams}
          renderItem={(exam: any) => (
            <List.Item
              actions={[
                <Button type="primary" onClick={() => handleAddExamItem(exam._id)}>
                  Thêm
                </Button>,
                <Button onClick={() => openExamContent(exam)}>
                  Xem nội dung
                </Button>,
              ]}
            >
              {exam.title}
            </List.Item>
          )}
        />
        <div className="detail-pagination">
          <Pagination
            current={examCurrentPage}
            pageSize={examPageSize}
            total={filteredExams.length}
            onChange={(page) => setExamCurrentPage(page)}
          />
        </div>
      </Modal>

      {/* Modal hiển thị thông tin bài kiểm tra */}
      <Modal
        title="Thông tin bài kiểm tra"
        visible={isExamContentModalOpen}
        onCancel={() => setIsExamContentModalOpen(false)}
        footer={null}
        width={800}
        className="detail-modal"
      >
        {examToView && (
          <ViewExamDetail _id={examToView.slug || ""} />
        )}
      </Modal>

      {/* Modal hiển thị thông tin học sinh */}
      <Modal
        title="Thông tin học sinh"
        visible={isStudentModalOpen}
        onCancel={() => setIsStudentModalOpen(false)}
        footer={null}
        className="detail-modal"
      >
        {studentToView && (
          <div className="detail-student-info">
            <p>
              <strong>Username: </strong>{studentToView.username}
            </p>
            <p>
              <strong>Email: </strong>{studentToView.email}
            </p>
          </div>
        )}
      </Modal>

      {/* Modal chọn học sinh từ danh sách (lấy từ API getAllStudents) */}
      <Modal
        title="Chọn học sinh"
        visible={isStudentListModalOpen}
        onCancel={() => setIsStudentListModalOpen(false)}
        footer={null}
        className="detail-modal"
      >
        <Input.Search
          placeholder="Tìm theo id, username, email"
          value={searchStudentTerm}
          onChange={(e) => setSearchStudentTerm(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <List
          dataSource={filteredStudents}
          renderItem={(student: any) => (
            <List.Item
              actions={[
                <Button type="primary" onClick={() => handleAddStudentItem(student._id)}>
                  Thêm
                </Button>,
                <Button onClick={() => openStudentContent(student)}>
                  Xem chi tiết
                </Button>,
              ]}
            >
              {student.username}
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default DetailClass;
