import { useEffect, useState } from "react";
import {
  ClassroomReponse,
  studentClassroomAPI,
} from "@/services/student/ClassroomAPI";
import { useNavigate } from "react-router-dom";
import { Card, Button, Input, Row, Col, Typography } from "antd";
import "bootstrap/dist/css/bootstrap.min.css";

const { Title, Text } = Typography;

export const PhongThi = () => {
  const [classrooms, setClassrooms] = useState<ClassroomReponse[]>([]);
  const [joinClassroomId, setJoinClassroomId] = useState("");
  const navigate = useNavigate();

  const getAllClassrooms = async () => {
    try {
      const response = await studentClassroomAPI.getStudentClassrooms();
      if (response.success) {
        setClassrooms(response.classrooms);
      } else {
        console.error("Lỗi khi lấy danh sách lớp:", response.message);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API lấy danh sách lớp:", error);
    }
  };

  useEffect(() => {
    getAllClassrooms();
  }, []);

  return (
    <div className="container py-4">
      <Title level={2} className="text-center mb-4">
        Danh sách lớp
      </Title>
      <Row gutter={[16, 16]}>
        {/* Card tham gia lớp mới */}
        <Col xs={24} sm={12} md={8}>
          <Card title="Tham gia lớp mới" bordered hoverable>
            <Input
              placeholder="Mã lớp"
              value={joinClassroomId}
              onChange={(e) => setJoinClassroomId(e.target.value)}
              style={{ marginBottom: 8, width: "100%" }}
            />
            <Button
              type="primary"
              block
              onClick={() => navigate(`/PhongThi/Detail/${joinClassroomId}`)}
            >
              Tham gia
            </Button>
          </Card>
        </Col>
        {/* Danh sách lớp học */}
        {classrooms && classrooms.length > 0 ? (
          classrooms.map((classroom) => (
            <Col xs={24} sm={12} md={8} key={classroom._id}>
              <Card
                title={classroom.title}
                bordered
                hoverable
                onClick={() => navigate(`/PhongThi/Detail/${classroom._id}`)}
              >
                <p>
                  <Text strong>Giáo viên: </Text> {classroom.teacherId.username}
                </p>
                <p>
                  <Text strong>Số lượng học sinh: </Text>{" "}
                  {classroom.students.length}
                </p>
              </Card>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <div className="text-center">Chưa có lớp học nào.</div>
          </Col>
        )}
      </Row>
    </div>
  );
};
