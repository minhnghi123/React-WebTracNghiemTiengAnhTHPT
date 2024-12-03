import { useAuthContext } from "@/contexts/AuthProvider";
import { AuthApi } from "@/services/Auth";
import { useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown, MenuProps } from "antd";

export const Navbar = () => {
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <a rel="noopener noreferrer" href="#">
          Thông tin cá nhân
        </a>
      ),
    },
    {
      key: "2",
      label: (
        <a rel="noopener noreferrer" href="/GiaoVien">
          Vào giao diện giáo viên
        </a>
      ),
    },
    {
      key: "3",
      label: (
        <a
          onClick={() => handleBTNLogout()}
          className="nav-link"
          href="#"
          style={{ color: "#007bff" }}
        >
          <span className="fas fa-sign-out-alt"></span> Đăng xuất
        </a>
      ),
    },
  ];
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const { user, handleLogout } = useAuthContext();
  const handleBTNLogout = async () => {
    handleLogout();
    setIsLoggedIn(false);
    setUserName("");
    try {
      const rq = await AuthApi.logout();
      console.log(rq?.data.message);
    } catch (error: any) {
      console.log(error);
    }
  };
  useLayoutEffect(() => {
    if (user) {
      setIsLoggedIn(true);
      setUserName(user.username);
    }
  }, [user]);
  const navigator = useNavigate();
  return (
    <div id="main">
      <div id="header">
        <div
          onClick={() => navigator("/")}
          id="logo"
          className="cursor-pointer"
          style={{ cursor: "pointer" }}
        >
          <img src="/src/assets/img/P2N 1.svg" alt="Logo"></img>
        </div>
        <div id="menu">
          <ul className="dsMenu">
            <li>
              <a href="/Home">Trang chủ</a>
            </li>
            <li>
              <a href="/Contests/Index">Khám phá</a>
            </li>
            <li>
              <a href="/Ontap">Ôn tập</a>
            </li>
            <li>
              <a href="/PhongThi/Index">Lớp học</a>
            </li>
            <li>
              <a href="/About">Về chúng tôi</a>
            </li>
            <li>
              <a href="/Contact">Liên hệ</a>
            </li>
          </ul>
        </div>
        {isLoggedIn ? (
          <ul className="navbar-nav ml-auto">
            <Dropdown menu={{ items }} placement="bottomRight">
              <a
                onClick={(e) => e.preventDefault()}
                className="nav-link"
                href="/hocsinh/ThongTinCaNhan/Index"
                style={{ color: "#007bff", fontWeight: "bold" }}
              >
                <li className="nav-item">
                  <span className="fas fa-user"></span> {userName}
                </li>
                <li className="nav-item">
                  {" "}
                  <span className="fas fa-user"></span>{" "}
                  {user?.role === "student" ? "Học sinh" : "Giáo viên"}
                </li>
              </a>
            </Dropdown>
          </ul>
        ) : (
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <a
                className="nav-link"
                href="/login"
                style={{ color: "#007bff" }}
              >
                <span className="fas fa-sign-in-alt"></span> Login
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                href="/signup"
                style={{ color: "#007bff" }}
              >
                <span className="fas fa-sign-in-alt"></span> Log Out
              </a>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};

// Utility function to get cookie value
export function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}
