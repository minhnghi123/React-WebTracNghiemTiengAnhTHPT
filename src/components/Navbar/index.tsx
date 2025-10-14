import { useAuthContext } from "@/contexts/AuthProvider";
import { AuthApi } from "@/services/Auth";
import { useLayoutEffect, useState } from "react";
import { Dropdown, MenuProps } from "antd";
import {
  MenuOutlined,
  CloseOutlined,
  UserOutlined,
  LogoutOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import P2N from "/src/assets/img/P2N 1.svg";
import AppLink from "@/components/AppLink";
import "./navbar.css";

interface navbarProps {
  rule?: boolean;
}

export const Navbar: React.FC<navbarProps> = ({ rule = true }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, handleLogout } = useAuthContext();

  const handleBTNLogout = async () => {
    handleLogout();
    setIsLoggedIn(false);
    setUserName("");
    setIsMobileMenuOpen(false);
    try {
      const rq = await AuthApi.logout();
      console.log(rq?.data.message);
    } catch (error: any) {
      console.log(error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useLayoutEffect(() => {
    if (user) {
      setIsLoggedIn(true);
      setUserName(user.username);
    }
  }, [user]);

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <AppLink to="/profile" className="dropdown-item">
          <UserOutlined /> Thông tin cá nhân
        </AppLink>
      ),
    },
    {
      key: "2",
      label: (
        <AppLink to="/GiaoVien" className="dropdown-item">
          <AppstoreOutlined /> Dành cho giáo viên
        </AppLink>
      ),
    },
    {
      key: "4",
      label: (
        <a onClick={() => handleBTNLogout()} className="dropdown-item">
          <LogoutOutlined /> Đăng xuất
        </a>
      ),
    },
  ];

  return (
    <nav className="modern-navbar">
      <div className="navbar-container">
        <AppLink to="/" className="navbar-logo">
          <img src={P2N} alt="Logo" />
        </AppLink>

        {/* Desktop Menu */}
        {rule && (
          <div className={`navbar-menu ${isMobileMenuOpen ? "active" : ""}`}>
            <ul className="navbar-links">
              <li onClick={closeMobileMenu}>
                <AppLink to="/">Trang chủ</AppLink>
              </li>
              {user && (
                <>
                  <li onClick={closeMobileMenu}>
                    <AppLink to="/KyThi">Đề Thi</AppLink>
                  </li>
                  <li onClick={closeMobileMenu}>
                    <AppLink to="/OnTap">Thẻ Ghi Nhớ</AppLink>
                  </li>
                  <li onClick={closeMobileMenu}>
                    <AppLink to="/PhongThi">Lớp học</AppLink>
                  </li>
                </>
              )}
              <li onClick={closeMobileMenu}>
                <AppLink to="/About">Về chúng tôi</AppLink>
              </li>
              <li onClick={closeMobileMenu}>
                <AppLink to="/Contact">Liên hệ</AppLink>
              </li>
            </ul>
          </div>
        )}

        {/* Auth Section */}
        <div className="navbar-auth">
          {isLoggedIn ? (
            <Dropdown
              menu={{ items }}
              placement="bottomRight"
              trigger={["hover"]}
            >
              <div className="user-menu">
                <UserOutlined className="user-icon" />
                <div className="user-info">
                  <span className="user-name">{userName}</span>
                  <span className="user-role">
                    {user?.role === "student"
                      ? "Học sinh"
                      : user?.role === "teacher"
                      ? "Giáo viên"
                      : "Admin"}
                  </span>
                </div>
              </div>
            </Dropdown>
          ) : (
            <div className="auth-buttons">
              <AppLink to="/Login" className="btn-login">
                Đăng nhập
              </AppLink>
              <AppLink to="/SignUp" className="btn-signup">
                Đăng ký
              </AppLink>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>
      )}
    </nav>
  );
};

export function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}
