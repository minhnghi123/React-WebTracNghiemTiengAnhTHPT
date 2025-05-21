import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
  Tabs,
  Avatar,
  Form,
} from "antd";
import * as XLSX from "xlsx";
import {
  ClassroomAPI,
  Classroom,
  Student,
} from "@/services/teacher/ClassroomAPI";
import { ExamAPI, Exam } from "@/services/teacher/Teacher";
import ViewExamDetail from "../QuanLyDeThi/DeThi/deltailExam";
import "../DetailClass.css";
import { ColumnsType } from "antd/es/table";
import { ClassCodeCopy } from "./copyClassID";
import OverviewTab from "./OverviewTab";
import ExamsTab from "./ExamsTab";
import StudentsTab from "./StudentsTab";
import UpdateClassTab from "./UpdateClassTab";
import AppLink from "@/components/AppLink";

const { TabPane } = Tabs;

const examColumns: ColumnsType<Exam> = [
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
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [listExam, setListExam] = useState<Exam[]>([]);
  const [listAllStudents, setListAllStudents] = useState<Student[]>([]);
  const [searchExamTerm, setSearchExamTerm] = useState<string>("");
  const [examCurrentPage, setExamCurrentPage] = useState<number>(1);
  const examPageSize = 5;

  // Các state của modal đã được giữ nguyên cho các tab liên quan đến bài thi, học sinh,...
  const [isExamModalOpen, setIsExamModalOpen] = useState<boolean>(false);
  const [examToView, setExamToView] = useState<Exam | null>(null);
  const [isExamContentModalOpen, setIsExamContentModalOpen] =
    useState<boolean>(false);
  const [isStudentListModalOpen, setIsStudentListModalOpen] =
    useState<boolean>(false);
  const [searchStudentTerm, setSearchStudentTerm] = useState<string>("");
  const [isStudentModalOpen, setIsStudentModalOpen] = useState<boolean>(false);
  const [studentToView, setStudentToView] = useState<Student | null>(null);
  const [failedStudents, setFailedStudents] = useState<Student[]>([]);

  // State và form cho tab cập nhật lớp học
  const [updateForm] = Form.useForm();
  const [updating, setUpdating] = useState<boolean>(false);

  const fetchClassroom = async () => {
    try {
      if (_classroom_id) {
        const data = await ClassroomAPI.getClassroomById(_classroom_id);
        if (data.success) {
          setClassroom(data.classroom);
          // Cập nhật giá trị form khi có dữ liệu lớp học
          updateForm.setFieldsValue({
            title: data.classroom.title,
            teacherId: data.classroom.teacherId,
            password: data.classroom.password,
            status: data.classroom.status,
          });
        } else {
          setError(data.message);
        }
      }
    } catch (error) {
      setError("Lỗi khi lấy thông tin lớp học");
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    try {
      let currentPage = 1;
      let totalPages = 1;
      let exams: Exam[] = [];

      while (currentPage <= totalPages) {
        const response = await ExamAPI.getAllExam(currentPage);
        if (response.success) {
          exams = exams.concat(response.data);
          totalPages = response.pagination.totalPages;
          currentPage++;
        } else {
          message.error("Lỗi khi lấy danh sách bài kiểm tra");
          break;
        }
      }
      setListExam(exams);
    } catch (error) {
      message.error("Lỗi khi lấy danh sách bài kiểm tra");
    }
  };

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

  // Xử lý cập nhật lớp học ở tab "Cập nhật lớp học"
  const handleUpdateSubmit = async () => {
    try {
      const values = await updateForm.validateFields();
      setUpdating(true);
      const updateData: Partial<Classroom> = {
        title: values.title,
        teacherId: values.teacherId,
        password: values.password,
        status: values.status,
      };
      if (classroom?._id) {
        const updatedClassroom = await ClassroomAPI.updateClassroom(
          classroom._id,
          updateData
        );
        if (updatedClassroom)
        message.success("Cập nhật lớp học thành công");
        // Cập nhật lại thông tin lớp học sau khi update
        fetchClassroom();
      }
    } catch (error) {
      message.error("Lỗi khi cập nhật lớp học");
    } finally {
      setUpdating(false);
    }
  };

  // Các hàm xử lý học sinh và bài kiểm tra giữ nguyên
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
      setError("Lỗi khi xóa học sinh");
      message.error("Lỗi khi xóa học sinh");
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
      setError("Lỗi khi xóa bài kiểm tra");
      message.error("Lỗi khi xóa bài kiểm tra");
    }
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
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        });
        if (jsonData.length <= 1) {
          message.error("File không có dữ liệu");
          return;
        }
        const headers = jsonData[0].map((header: any) =>
          header.toString().toLowerCase()
        );
        const idIndex = headers.indexOf("id");
        const usernameIndex = headers.indexOf("username");
        const emailIndex = headers.indexOf("email");

        if (idIndex === -1 && usernameIndex === -1 && emailIndex === -1) {
          message.error(
            "Không tìm thấy cột 'id', 'username' hoặc 'email' trong file Excel"
          );
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
              await ClassroomAPI.addStudentsToClassroom(_classroom_id || "", [
                studentId,
              ]);
            } else if (username) {
              const newid = listAllStudents.find(
                (student) => student.username === username
              );
              if (newid) {
                await ClassroomAPI.addStudentsToClassroom(_classroom_id || "", [
                  newid._id,
                ]);
              } else {
                failed.push({
                  _id: "",
                  username: username || "",
                  email: email || "",
                  password: "",
                  avatar: "",
                  role: "",
                  deleted: false,
                  status: "",
                  __v: 0,
                });
              }
            } else if (email) {
              const newid = listAllStudents.find(
                (student) => student.email === email
              );
              if (newid) {
                await ClassroomAPI.addStudentsToClassroom(_classroom_id || "", [
                  newid._id,
                ]);
              } else {
                failed.push({
                  _id: "",
                  username: username || "",
                  email: email || "",
                  password: "",
                  avatar: "",
                  role: "",
                  deleted: false,
                  status: "",
                  __v: 0,
                });
              }
            }
          } catch (err) {
            failed.push({
              _id: studentId || "",
              username: username || "",
              email: email || "",
              password: "",
              avatar: "",
              role: "",
              deleted: false,
              status: "",
              __v: 0,
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
    return false;
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await ClassroomAPI.downloadStudentResultsExcel(
        _classroom_id || ""
      );
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `student_results_${_classroom_id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      message.error("Lỗi khi tải xuống file Excel");
    }
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

  const teacherName =
    typeof classroom.teacherId === "object"
      ? (classroom.teacherId as any).username
      : classroom.teacherId;

  const filteredStudents = listAllStudents.filter((student) => {
    const term = searchStudentTerm.toLowerCase();
    return (
      student._id.toLowerCase().includes(term) ||
      student.username.toLowerCase().includes(term) ||
      student.email.toLowerCase().includes(term)
    );
  });

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
      <Row style={{ marginBottom: 16 }}>
        <Col>
          <AppLink to="/giaovien/QuanLyLopHoc">
            <Button>Quay lại danh sách lớp học</Button>
          </AppLink>
        </Col>
      </Row>
      <Row style={{ marginBottom: 16 }}>
        <Col span={24}>
          <h3 style={{ textAlign: "center" }}>{classroom.title}</h3>
          <ClassCodeCopy classCode={classroom._id || "N/A"} />
          <p>
            <strong>Giáo viên: </strong>
            {teacherName}
          </p>
          <p>
            <strong>Trạng thái: </strong>
            {classroom.status}
          </p>
          <p>
            <strong>Mật khẩu lớp: </strong>
            {classroom.password}
          </p>
        </Col>
      </Row>
      <Card bordered={false} className="detail-card">
        <Tabs defaultActiveKey="1">
          {/* Tab Tổng quan */}
          <TabPane tab="Tổng quan" key="1">
            <OverviewTab
              classroom={classroom}
              handleDownloadExcel={handleDownloadExcel}
            />
          </TabPane>

          {/* Tab Đề Thi */}
          <TabPane tab="Đề Thi" key="2">
            <ExamsTab
              classroom={classroom}
              examColumns={examColumns}
              openExamContent={openExamContent}
              handleRemoveExam={handleRemoveExam}
              setIsExamModalOpen={setIsExamModalOpen}
            />
          </TabPane>

          {/* Tab Học sinh */}
          <TabPane tab="Học sinh" key="3">
            <StudentsTab
              classroom={classroom}
              failedStudents={failedStudents}
              handleExcelUpload={handleExcelUpload}
              openStudentContent={openStudentContent}
              handleRemoveStudent={handleRemoveStudent}
              fetchAllStudents={fetchAllStudents}
              setIsStudentListModalOpen={setIsStudentListModalOpen}
            />
          </TabPane>

          {/* Tab Cập nhật lớp học */}
          <TabPane tab="Cập nhật lớp học" key="4">
            <UpdateClassTab
              updateForm={updateForm}
              handleUpdateSubmit={handleUpdateSubmit}
              updating={updating}
            />
          </TabPane>
        </Tabs>
      </Card>

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
                <Button
                  type="primary"
                  onClick={() => handleAddExamItem(exam._id)}
                >
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
        {examToView && <ViewExamDetail _id={examToView.slug || ""} />}
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
              <strong>Username: </strong>
              {studentToView.username}
            </p>
            <p>
              <strong>Email: </strong>
              {studentToView.email}
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
                <Button
                  type="primary"
                  onClick={() => handleAddStudentItem(student._id)}
                >
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
