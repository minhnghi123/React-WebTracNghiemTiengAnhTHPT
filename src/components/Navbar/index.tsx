import { useAuthContext } from "@/contexts/AuthProvider";
import { AuthApi } from "@/services/Auth";
import { useEffect, useState } from "react";

export const Navbar = () => {
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
  useEffect(() => {
    if (user) {
      setIsLoggedIn(true);
      setUserName(user.username);
    }
  }, []);
  return (
    <div id="main">
      <div id="header">
        <div id="logo">
          <img src="/src/assets/img/P2N 1.svg" alt="Logo"></img>
        </div>
        {isLoggedIn ? (
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <a
                className="nav-link"
                href="/hocsinh/ThongTinCaNhan/Index"
                style={{ color: "#007bff", fontWeight: "bold" }}
              >
                <span className="fas fa-user"></span> {userName}
              </a>
            </li>
            <li className="nav-item">
              <a
                onClick={() => handleBTNLogout()}
                className="nav-link"
                href="#"
                style={{ color: "#007bff" }}
              >
                <span className="fas fa-sign-out-alt"></span> Đăng xuất
              </a>
            </li>
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
                <span className="fas fa-user-plus"></span> Sign Up
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
