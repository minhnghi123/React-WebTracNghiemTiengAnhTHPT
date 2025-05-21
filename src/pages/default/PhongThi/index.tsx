import { useEffect, useState } from "react";
import {
  ClassroomReponse,
  studentClassroomAPI,
} from "@/services/student/ClassroomAPI";
import { Card, Input, Row, Col, Typography } from "antd";
import "bootstrap/dist/css/bootstrap.min.css";
import "./phongthi.css"; // Import your CSS file here
import AppLink from "@/components/AppLink";
const { Title, Text } = Typography;

export const PhongThi = () => {
  const [classrooms, setClassrooms] = useState<ClassroomReponse[]>([]);
  const [joinClassroomId, setJoinClassroomId] = useState("");
  const [searchText, setSearchText] = useState('');
  const filteredClassrooms = classrooms ? classrooms.filter((classroom) =>
    classroom.title.toLowerCase().includes(searchText.toLowerCase()) ||
    classroom.teacherId.username.toLowerCase().includes(searchText.toLowerCase())
  ) : [];

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
      <Input
        className="search-input"
        placeholder="Tìm kiếm lớp học hoặc giáo viên"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 16 }}
      />
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
            <AppLink
              to="/PhongThi/Detail/:classroomId"
              params={{ classroomId: joinClassroomId }}
              className={`ant-btn ant-btn-primary${!joinClassroomId.trim() ? " ant-btn-disabled" : ""}`}
              style={{ display: "block", pointerEvents: !joinClassroomId.trim() ? "none" : "auto" }}
            >
              Tham gia
            </AppLink>
          </Card>
        </Col>
        {/* Danh sách lớp học */}
        {filteredClassrooms.length > 0 ? (
          filteredClassrooms.map((classroom) => (
            <Col xs={24} sm={12} md={8} key={classroom._id}>
              <AppLink to="/PhongThi/Detail/:classroomId" params={{ classroomId: classroom._id }}>
                <Card
                  title={classroom.title}
                  bordered
                  hoverable
                >
                  <p>
                    <Text strong>Giáo viên: </Text> {classroom.teacherId.username}
                  </p>
                  <p>
                    <Text strong>Số lượng học sinh: </Text>{" "}
                    {classroom.students.length}
                  </p>
                </Card>
              </AppLink>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <div className="text-center">
              {searchText ? "Không tìm thấy lớp học nào." : "Chưa có lớp học nào."}
            </div>
          </Col>
        )}
      </Row>
    </div>
  );
};
