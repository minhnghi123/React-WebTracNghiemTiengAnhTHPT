import { useAuthContext } from "@/contexts/AuthProvider";
import { AuthApi } from "@/services/Auth";
import { useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown, MenuProps } from "antd";

export const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const { user, handleLogout } = useAuthContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Toggle Mobile Menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Xử lý đăng xuất
  const handleBTNLogout = async () => {
    handleLogout();
    setIsLoggedIn(false);
    setUserName("");

    try {
      const rq = await AuthApi.logout();
      console.log(rq?.data.message);
    } catch (error) {
      console.log(error);
    }

    navigate("/login");
  };

  // Kiểm tra trạng thái đăng nhập khi component render
  useLayoutEffect(() => {
    if (user) {
      setIsLoggedIn(true);
      setUserName(user.username);
    }
  }, [user]);

  // Tạo danh sách menu dropdown
  const items: MenuProps["items"] = [
    { key: "1", label: <a href="/profile">Thông tin cá nhân</a> },
    ...(user?.role === "admin"
      ? [
          { key: "2", label: <a href="/Admin">Vào giao diện admin</a> },
          { key: "3", label: <a href="/">Vào giao diện học sinh</a> },
          { key: "4", label: <a href="/Giaovien">Vào giao diện giáo viên</a> },
        ]
      : []),
    {
      key: "5",
      label: (
        <a onClick={handleBTNLogout} style={{ color: "#007bff", cursor: "pointer" }}>
          <span className="fas fa-sign-out-alt"></span> Đăng xuất
        </a>
      ),
    },
  ];

  return (
    <div id="header">
      {/* Logo */}
      <a href="/" id="logo">
      <img src="/src/assets/img/P2N 1.svg" alt="Logo" />
      </a>
      {/* Biểu tượng Menu (Hiện trên mobile) */}
      <button className="mobile-menu-icon" onClick={toggleMenu}>
        ☰
      </button>

      {/* Menu chính */}
      <div id="menu" className={isMenuOpen ? "show" : ""}>
        <ul className="dsMenu">
          <li><a href="/">Trang chủ</a></li>
          <li><a href="/KyThi">Kỳ Thi</a></li>
          <li><a href="/Ontap">Ôn tập</a></li>
          <li><a href="/PhongThi">Lớp học</a></li>
        </ul>
      </div>

      {/* Dropdown user */}
      {isLoggedIn ? (
        <Dropdown menu={{ items }} placement="bottomRight">
          <a className="nav-link" href="/profile">
            <span className="fas fa-user"></span> {userName} - {user?.role === "student" ? "Học sinh" : "Giáo viên"}
          </a>
        </Dropdown>
      ) : (
        <div className="auth-buttons">
          <a className="login-btn" href="/Login">Đăng nhập</a>
          <a className="signup-btn" href="/SignUp">Đăng ký</a>
        </div>
      )}
    </div>
  );
};

// Hàm lấy giá trị Cookie
export function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}
