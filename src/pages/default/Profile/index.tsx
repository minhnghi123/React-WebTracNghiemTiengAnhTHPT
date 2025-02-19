import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface IUser {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  phone?: string;
  role: "student" | "teacher" | "admin";
}

export const Profile = () => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate(); // Dùng để chuyển hướng trang

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/auth/me", { withCredentials: true }); // Gửi cookie chứa token
        setUser(res.data.user);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        navigate("/login"); // Nếu chưa đăng nhập, chuyển về trang đăng nhập
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) return <p>Đang tải...</p>;

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-center">Thông tin cá nhân</h1>
      {user ? (
        <div>
          <div className="text-center">
            <img
              src={user.avatar || "https://via.placeholder.com/150"}
              alt="Avatar"
              className="w-32 h-32 mx-auto rounded-full mt-4"
            />
          </div>
          <div className="mt-4">
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone || "Chưa có số điện thoại"}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </div>
        </div>
      ) : (
        <p className="text-center text-red-500">Không tìm thấy thông tin người dùng.</p>
      )}
    </div>
  );
};
