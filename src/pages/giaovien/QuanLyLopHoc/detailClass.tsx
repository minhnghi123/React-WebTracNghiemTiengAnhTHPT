import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  List,
  Button,
  Input,
  Row,
  Col,
  message,
  Modal,
  Pagination,
  Table,
  Space,
  Tabs,
  Upload,
  Avatar,
} from 'antd';
import * as XLSX from 'xlsx';
import { ClassroomAPI, Classroom, Student } from '@/services/teacher/ClassroomAPI';
import { ExamAPI, Exam } from '@/services/teacher/Teacher';
import UpdateClassModal from './updateClass';
import ViewExamDetail from '../QuanLyDeThi/DeThi/deltailExam';
import '../DetailClass.css';
import { ColumnsType } from 'antd/es/table';
import { ClassCodeCopy } from './copyClassID';

const { TabPane } = Tabs;

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
    title: "Thời gian (phút)",
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
    render: (record: any) => record?.length ?? 0,
  },
];

const DetailClass: React.FC = () => {
  const { _classroom_id } = useParams<{ _classroom_id: string }>();
  const navigate = useNavigate();
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

  // State cho việc upload Excel
  const [failedStudents, setFailedStudents] = useState<Student[]>([]);

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

  // const handleAddStudent = async () => {
  //   try {
  //     await ClassroomAPI.addStudentsToClassroom(_classroom_id || "", [studentId]);
  //     fetchClassroom();
  //     setStudentId('');
  //     message.success("Thêm học sinh thành công");
  //   } catch (err) {
  //     setError('Lỗi khi thêm học sinh');
  //     message.error("Lỗi khi thêm học sinh");
  //   }
  // };

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
      await ClassroomAPI.removeStudentFromClassroom(_classroom_id || "", id);
      fetchClassroom();
      message.success("Xóa học sinh thành công");
    } catch (err) {
      setError('Lỗi khi xóa học sinh');
      message.error("Lỗi khi xóa học sinh");
    }
  };

  // const handleRemoveStudents = async () => {
  //   try {
  //     await ClassroomAPI.removeStudentsFromClassroom(
  //       _classroom_id || "",
  //       classroom?.students.map((student: any) => student._id) || []
  //     );
  //     fetchClassroom();
  //     message.success("Xóa tất cả học sinh thành công");
  //   } catch (err) {
  //     setError('Lỗi khi xóa tất cả học sinh');
  //     message.error("Lỗi khi xóa tất cả học sinh");
  //   }
  // };

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

  const handleExcelUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (evt: any) => {
      try {
        const binaryStr = evt.target.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // Chuyển sheet thành JSON với header là hàng đầu tiên
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (jsonData.length <= 1) {
          message.error("File không có dữ liệu");
          return;
        }
        const headers = jsonData[0].map((header: any) => header.toString().toLowerCase());
        const idIndex = headers.indexOf('id');
        const usernameIndex = headers.indexOf('username');
        const emailIndex = headers.indexOf('email');
  
        if (idIndex === -1 && usernameIndex === -1 && emailIndex === -1) {
          message.error("Không tìm thấy cột 'id', 'username' hoặc 'email' trong file Excel");
          return;
        }
  
        const failed: Student[] = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          const studentId = row[idIndex];
          const username = row[usernameIndex];
          const email = row[emailIndex];
  
          if (!studentId && !username && !email) continue;
  
          try {
            if (studentId) {
              await ClassroomAPI.addStudentsToClassroom(_classroom_id || "", [studentId]);
            } else if (username) {
              const newid = listAllStudents.find((student) => student.username === username);
              if (newid) {
                await ClassroomAPI.addStudentsToClassroom(_classroom_id || "", [newid._id]);
              } else {
                failed.push({
                  _id: '',
                  username: username || '',
                  email: email || '',
                  password: '',
                  avatar: '',
                  role: '',
                  deleted: false,
                  status: '',
                  __v: 0
                });
              }
            } else if (email) {
              const newid = listAllStudents.find((student) => student.email === email);
              if (newid) {
                await ClassroomAPI.addStudentsToClassroom(_classroom_id || "", [newid._id]);
              } else {
                failed.push({
                  _id: '',
                  username: username || '',
                  email: email || '',
                  password: '',
                  avatar: '',
                  role: '',
                  deleted: false,
                  status: '',
                  __v: 0
                });
              }
            }
          } catch (err) {
            failed.push({
              _id: studentId || '',
              username: username || '',
              email: email || '',
              password: '',
              avatar: '',
              role: '',
              deleted: false,
              status: '',
              __v: 0
            });
          }
        }
        setFailedStudents(failed);
        if (failed.length > 0) {
          message.error("Một số học sinh không được thêm thành công");
        } else {
          message.success("Thêm học sinh từ file Excel thành công");
        }
        fetchClassroom();
      } catch (error) {
        message.error("Có lỗi xảy ra khi xử lý file Excel");
      }
    };
    reader.readAsBinaryString(file);
    // Trả về false để ngăn việc upload file theo cách mặc định của Ant Design
    return false;
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
      {/* Nút Back quay lại danh sách lớp học */}
      <Row style={{ marginBottom: 16 }}>
        <Col>
          <Button onClick={() => navigate('/giaovien/quanlylophoc')}>quay lại danh sách lớp học</Button>
        </Col>
      </Row>

      <Row style={{ marginBottom: 16 }}>
        <Col span={24}>
        <h3>   <center> {classroom.title}</center></h3>
        <ClassCodeCopy classCode={classroom._id || 'N/A'} />
          <p><strong>Giáo viên: </strong>{teacherName}</p>
          <p><strong>Trạng thái: </strong>{classroom.status}</p>
          <p><strong>Mật khẩu lớp: </strong>{classroom.password}</p>
        </Col>
      </Row>

      <Card bordered={false} className="detail-card">
        <Tabs defaultActiveKey="1">
          {/* Tab Tổng quan */}
          <TabPane tab="Tổng quan" key="1">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <p className="detail-info">
                  <strong>Số lượng học sinh: </strong>{Array.isArray(classroom.students) ? classroom.students.length : 0}
                </p>
                <p className="detail-info">
                  <strong>Số lượng bài kiểm tra: </strong>{Array.isArray(classroom.exams) ? classroom.exams.length : 0}
                </p>
              </Col>
            </Row>
            <Row className="detail-row">
              <Col span={24} className="detail-update">
                <Button type="primary" onClick={() => setIsUpdateModalOpen(true)}>
                  Cập nhật lớp học
                </Button>
              </Col>
            </Row>
          </TabPane>

          {/* Tab Kỳ thi */}
          <TabPane tab="Kỳ thi" key="2">
            <Row gutter={[16, 16]}>
            <div className="detail-action-group">
                  <Button type="primary" onClick={() => setIsExamModalOpen(true)}>
                    Thêm bài kiểm tra
                  </Button>
                </div>
              <Col span={24}>
                <h3 className="detail-subtitle">Danh sách bài kiểm tra của lớp</h3>
                {classroom.exams && (
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
                            </Button>
                            <Button type="link" danger onClick={() => handleRemoveExam(record._id)}>
                              Xóa
                            </Button>
                          </Space>
                        ),
                      },
                    ]}
                  />
                )}
                
              </Col>
            </Row>
          </TabPane>

          {/* Tab Học sinh */}
          <TabPane tab="Học sinh" key="3">
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
                  {/* <Button type="default" onClick={handleRemoveStudents} className="detail-btn-margin">
                    Xóa tất cả
                  </Button> */}
                </div>
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
              <Col span={24}>
                <h3 className="detail-subtitle">Thêm học sinh từ file Excel</h3>
                <h3> Lưu ý: File Excel phải 1 trong các cột: ID, Username, Email</h3>
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
          </TabPane>
        </Tabs>
      </Card>

      {/* Modal cập nhật lớp học */}
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

      {/* Modal chọn học sinh từ danh sách */}
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
              <List.Item.Meta
                avatar={<Avatar src={student.avatar} alt={student.username} />}
                title={student.username}
                description={student.email}
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default DetailClass;
