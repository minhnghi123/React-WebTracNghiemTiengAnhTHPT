import  { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Tabs,
  Table,
  List,
  Avatar,
  Button,
  Input,
  Row,
  Col,
  message,
} from "antd";
import {
  studentClassroomAPI,
} from "@/services/student/ClassroomAPI";
import "bootstrap/dist/css/bootstrap.min.css";
import { ColumnsType } from "antd/es/table";
import { Exam, Question } from "@/services/teacher/Teacher";

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
      new Date(a.startTime || 0).getTime() -
      new Date(b.startTime || 0).getTime(),
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
export const ClassroomDetail = () => {
  const navigator = useNavigate();
  const navagiteToDetail = (id: string) => {
    navigator(`/KyThi/ChiTiet/${id}`);
  };
  const { classroomId } = useParams<{ classroomId: string }>();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [joinPassword, setJoinPassword] = useState<string>("");

  const fetchClassroom = async () => {
    setLoading(true);
    try {
      const response = await studentClassroomAPI.getClassroomById(classroomId!);
      if (response.success) {
        setClassroom(response.classroom);
      } else {
        setError(response.message || "Có lỗi xảy ra");
      }
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    }
    setLoading(false);
  };

  const handleJoinClassroom = async () => {
    try {
      const joinResponse = await studentClassroomAPI.joinClassroom(
        classroomId!,
        joinPassword
      );
      if (joinResponse.success) {
        message.success("Tham gia lớp học thành công!");
        fetchClassroom(); // Cập nhật lại thông tin lớp học
      } else {
        message.error("Tham gia lớp thất bại: " + joinResponse.message);
      }
    } catch (error: any) {
      message.error("Có lỗi khi tham gia lớp");
    }
  };

  useEffect(() => {
    fetchClassroom();
  }, [classroomId]);

  if (loading) {
    return (
      <div className="container py-4 text-center">
        Đang tải thông tin lớp...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4 text-center text-danger">Lỗi: {error}</div>
    );
  }

  if (!classroom) {
    return (
      <div className="container py-4 text-center">Không tìm thấy lớp học</div>
    );
  }

  // Nếu trường students có tồn tại và là mảng thì học sinh đã gia nhập lớp
  const joined = classroom.students && Array.isArray(classroom.students);

  return (
    <div className="container py-4">
      <Button
        onClick={() => navigate("/PhongThi")}
        style={{ marginBottom: 16 }}
      >
        Quay lại
      </Button>
      <Card
        title={<h3 style={{ textAlign: "center" }}>{classroom.title}</h3>}
        bordered={false}
      >
        <p>
          <strong>Giáo viên:</strong> {classroom.teacherId.username}
        </p>
        <p>
          <strong>Trạng thái:</strong> {classroom.status}
        </p>
        <p>
          <strong>Mật khẩu lớp:</strong> {classroom.password}
        </p>
      </Card>

      {/* Nếu chưa tham gia lớp, hiển thị form nhập mật khẩu */}
      {!joined && (
        <Card title="Tham gia lớp học" bordered style={{ marginTop: 16 }}>
          <p>Để tham gia lớp học này, vui lòng nhập mật khẩu lớp.</p>
          <Input.Password
            placeholder="Nhập mật khẩu lớp"
            value={joinPassword}
            onChange={(e) => setJoinPassword(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <Button type="primary" onClick={handleJoinClassroom}>
            Tham gia
          </Button>
        </Card>
      )}

      {/* Nếu đã tham gia lớp, hiển thị chi tiết lớp qua các Tab */}
      {joined && (
        <Card bordered style={{ marginTop: 16 }}>
          <Tabs defaultActiveKey="1">
            <TabPane tab="Kỳ thi" key="1">
              <Table
                dataSource={classroom.exams || []}
                showSorterTooltip={false}
                columns={[
                  ...examColumns,

                  {
                    title: "",
                    key: "action",
                    render: (_, record) => (
                      <Button
                        color="primary"
                        variant="solid"
                        onClick={() => {
                          navagiteToDetail(record.slug);
                        }}
                      >
                        Chi tiết
                      </Button>
                    ),
                  },
                ]}
              />
            </TabPane>
            <TabPane tab="Tổng quan" key="2">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <p>
                    <strong>Số lượng học sinh:</strong>{" "}
                    {classroom.students.length}
                  </p>
                </Col>
                <Col span={12}>
                  <p>
                    <strong>Số lượng bài kiểm tra:</strong>{" "}
                    {classroom.exams ? classroom.exams.length : 0}
                  </p>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="Thành viên" key="3">
              <List
                itemLayout="horizontal"
                dataSource={classroom.students || []}
                renderItem={(student: any) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar src={student.avatar} />}
                      title={student.username}
                      description={student.email}
                    />
                  </List.Item>
                )}
              />
            </TabPane>
          </Tabs>
        </Card>
      )}
    </div>
  );
};

export default ClassroomDetail;
