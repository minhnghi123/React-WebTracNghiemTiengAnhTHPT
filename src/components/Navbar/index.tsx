import { useAuthContext } from "@/contexts/AuthProvider";
import { AuthApi } from "@/services/Auth";
import { useLayoutEffect, useState } from "react";
import { Dropdown, MenuProps } from "antd";
import P2N from "/src/assets/img/P2N 1.svg";
import AppLink from "@/components/AppLink";

interface navbarProps {
  rule?: boolean;
}

export const Navbar: React.FC<navbarProps> = ({ rule = true }) => {
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

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <AppLink rel="noopener noreferrer" to="/profile">
          Thông tin cá nhân
        </AppLink>
      ),
    },
    {
      key: "4",
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

  return (
    <div id="main">
      <div id="header">
        <AppLink to="/" id="logo" className="cursor-pointer" style={{ cursor: "pointer" }}>
          <img src={P2N} alt="Logo"></img>
        </AppLink>

        {rule && (
          <div id="menu">
            <ul className="dsMenu">
              <li>
                <AppLink to="/">Trang chủ </AppLink>
              </li>
              {user && (
                <>
                  <li>
                    <AppLink to="/KyThi">Danh sách Đề Thi</AppLink>
                  </li>
                  <li>
                    <AppLink to="/OnTap">Thẻ Ghi Nhớ</AppLink>
                  </li>
                  <li>
                    <AppLink to="/PhongThi">Lớp học</AppLink>
                  </li>
                </>
              )}
              <li>
                <AppLink to="/About">Về chúng tôi</AppLink>
              </li>
              <li>
                <AppLink to="/Contact">Liên hệ</AppLink>
              </li>
            </ul>
          </div>
        )}
        {isLoggedIn ? (
          <ul className="navbar-nav ml-auto">
            <Dropdown
              menu={{ items }}
              placement="bottomRight"
              trigger={["hover"]}
            >
              <div style={{ cursor: "pointer" }}>
                {user && (
                  <AppLink
                    to={
                      user.role === "student"
                        ? "/profile"
                        : user.role === "teacher"
                        ? "/GiaoVien"
                        : "/Admin"
                    }
                    className="nav-link"
                    style={{ color: "#007bff", fontWeight: "bold", display: "block" }}
                  >
                    <li className="nav-item">
                      <span className="fas fa-user"></span> {userName}
                    </li>
                    <li className="nav-item">
                      <span className="fas fa-user"></span>{" "}
                      {user?.role === "student"
                        ? "Học sinh"
                        : user?.role === "teacher"
                        ? "Giáo viên"
                        : "Admin"}
                    </li>
                  </AppLink>
                )}
              </div>
            </Dropdown>
          </ul>
        ) : (
          <ul
            className="nav nav-pills justify-content-center gap-3"
            id="ex1"
            role="tablist"
          >
            <li className="nav-item rounded-pill shadow-sm" role="presentation">
              <AppLink
                className="nav-dn bg-secondary text-white px-4 py-2 rounded-pill hover-bg-dark"
                id="tab-login"
                to="/Login"
                role="tab"
                aria-controls="pills-login"
                aria-selected="true"
              >
                Đăng nhập
              </AppLink>
            </li>

            <li className="nav-item rounded-pill shadow-sm" role="presentation">
              <AppLink
                className="nav-dn bg-primary text-white px-4 py-2 rounded-pill hover-bg-dark"
                id="tab-register"
                to="/SignUp"
                role="tab"
                aria-controls="pills-register"
                aria-selected="false"
              >
                Đăng ký
              </AppLink>
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
