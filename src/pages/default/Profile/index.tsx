import { useEffect, useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, List, Card } from "antd";
import { useAuthContext } from "@/contexts/AuthProvider";
import "bootstrap/dist/css/bootstrap.min.css";
import { HistoryPage } from "./history";
import { ClassroomReponse, studentClassroomAPI } from "@/services/student/ClassroomAPI";
import "./prolife.css";

const { TabPane } = Tabs;

export const Profile = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState<ClassroomReponse[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  interface EditedUser {
    username?: string;
    email?: string;
    [key: string]: any; // Optional: To allow additional properties
  }

  const [editedUser, setEditedUser] = useState<EditedUser>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedUser({ ...user }); // Reset editedUser khi bắt đầu chỉnh sửa
  };

  const handleSaveClick = () => {
    // Gọi API để cập nhật thông tin người dùng (ví dụ: sử dụng fetch hoặc axios)
    // Sau khi API thành công, gọi onUpdateUser(editedUser) để cập nhật state ở component cha (nếu cần)
    console.log('Lưu thông tin:', editedUser);
    setIsEditing(false);
    // **Lưu ý:** Bạn cần triển khai logic gọi API thực tế ở đây
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };



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
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-center">Thông tin cá nhân</h1>
      {user ? (
        <div className="profile-container">
          <div>
            <img
              src={user.avatar || "https://via.placeholder.com/150"}
              alt="Avatar"
              className="profile-avatar"
            />
          </div>
          <div className="profile-info">
            {!isEditing ? (
              <>
                <p><strong>Tên người dùng:</strong> {user.username}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Vai trò:</strong> {user.role}</p>
                <button onClick={handleEditClick} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">Chỉnh sửa</button>
              </>
            ) : (
              <div>
                <p>
                  <strong>Tên người dùng:</strong>
                  <input
                    type="text"
                    name="username"
                    value={editedUser.username || ''}
                    onChange={handleChange}
                    className="ml-2 border rounded px-2 py-1"
                  />
                </p>
                <p>
                  <strong>Email:</strong>
                  <input
                    type="email"
                    name="email"
                    value={editedUser.email || ''}
                    onChange={handleChange}
                    className="ml-2 border rounded px-2 py-1"
                  />
                </p>
                <p><strong>Vai trò:</strong> {user.role} (Không cho phép chỉnh sửa)</p> {/* Tùy chọn không cho phép sửa vai trò */}
                <button onClick={handleSaveClick} className="mt-2 mr-2 px-4 py-2 bg-green-500 text-white rounded">Lưu</button>
                <button onClick={handleCancelClick} className="mt-2 px-4 py-2 bg-gray-300 text-gray-700 rounded">Hủy</button>
              </div>
            )}
          </div>
        </div>
        ) : (
          <p className="error-message">Không tìm thấy thông tin người dùng.</p>
        )}

      {/* Phần hiển thị 2 tab kết quả ôn tập và lớp học */}
      <Tabs defaultActiveKey="1" className="mt-8">
        <TabPane tab="Kết quả ôn tập" key="1">
          <HistoryPage />
        </TabPane>
        <TabPane tab="Lớp học" key="2">
          {classrooms.length > 0 ? (
            <List
              grid={{ gutter: 16, column: 1 }}
              dataSource={classrooms}
              renderItem={(item) => (
                <List.Item>
                  <Card hoverable onClick={() => navigate(`/PhongThi/Detail/${item._id}`)}>
                    {item.title}
                  </Card>
                </List.Item>
              )}
            />
          ) : (
            <p>Chưa có lớp học nào.</p>
          )}
        </TabPane>
      </Tabs>
      {/* <YearHeatmap /> */}
    </div>
  );
};
