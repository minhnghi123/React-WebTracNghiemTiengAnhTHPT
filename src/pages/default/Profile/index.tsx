import { useEffect, useState } from "react";

// Định nghĩa kiểu dữ liệu cho người dùng
interface User {
  username: string;
  email: string;
  role: string;
  status: string;
  avatar: string | null;
}

export const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<User>({
    username: "",
    email: "",
    role: "",
    status: "false",
    avatar: null,
  });

  useEffect(() => {
    // Lấy dữ liệu từ Local Storage
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData(parsedUser); // Cập nhật formData với dữ liệu người dùng hiện tại
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          avatar: reader.result as string,
        });
      };
      reader.readAsDataURL(file); // Chuyển file ảnh thành base64
    }
  };

  const handleAvatarRemove = () => {
    setFormData({
      ...formData,
      avatar: null, // Xóa avatar
    });
  };

  const handleSubmit = () => {
    // Cập nhật thông tin người dùng và lưu vào Local Storage
    setUser(formData);
    localStorage.setItem("user", JSON.stringify(formData));
    setIsEditing(false); // Kết thúc chế độ chỉnh sửa
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-center">Thông tin cá nhân</h1>
      {user ? (
        <div className="mt-4 p-4 border rounded-lg shadow">
          <div className="flex justify-center mb-4">
            <img
              src={formData.avatar || "/default-avatar.png"}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover"
            />
          </div>
          {isEditing ? (
            <div>
              <div className="mb-4">
                <label className="block mb-1">Tên:</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="p-2 w-full border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="p-2 w-full border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Vai trò:</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="p-2 w-full border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Trạng thái:</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="p-2 w-full border rounded"
                >
                  <option value="true">Hoạt động</option>
                  <option value="false">Không hoạt động</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1">Avatar:</label>
                <input
                  type="file"
                  onChange={handleAvatarChange}
                  className="p-2 w-full"
                />
                {formData.avatar && (
                  <button
                    onClick={handleAvatarRemove}
                    className="mt-2 text-red-500"
                  >
                    Xóa Avatar
                  </button>
                )}
              </div>
              <button
                onClick={handleSubmit}
                className="bg-blue-500 text-white p-2 rounded"
              >
                Lưu thay đổi
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="ml-2 p-2 text-gray-500 border rounded"
              >
                Hủy
              </button>
            </div>
          ) : (
            <div>
              <p><strong>Họ và tên:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Vai trò:</strong> {user.role}</p>
              <p><strong>Trạng thái:</strong> {user.status === "true" ? "Hoạt động" : "Không hoạt động"}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 bg-yellow-500 text-white p-2 rounded"
              >
                Chỉnh sửa thông tin
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-red-500">Không tìm thấy thông tin người dùng.</p>
      )}
    </div>
  );
};
