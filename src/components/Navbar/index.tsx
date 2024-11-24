export const Navbar = () => {
  const isLoggedIn = false; // Replace with actual login check
  const userName = "User"; // Replace with actual user name

  return (
    <div id="main">
      <div id="header">
        <div id="logo">
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
                className="nav-link"
                href="/admin/Login/Logout"
                style={{ color: "#007bff", fontWeight: "bold" }}
              >
                <span className="fas fa-sign-in-alt"></span> Log Out
              </a>
            </li>
          </ul>
        ) : (
          <ul className="nav nav-pills justify-content-center gap-3" id="ex1" role="tablist">
            <li className="nav-item rounded-pill shadow-sm" role="presentation">
              <a
                className="nav-dn bg-secondary text-white px-4 py-2 rounded-pill hover-bg-dark"
                id="tab-login"
                href="/Login"
                role="tab"
                aria-controls="pills-login"
                aria-selected="true"
              >
                Đăng nhập
              </a>
            </li>
            
            <li className="nav-item rounded-pill shadow-sm" role="presentation">
              <a
                className="nav-dn bg-primary text-white px-4 py-2 rounded-pill hover-bg-dark"
                id="tab-register"
                href="/SignUp"
                role="tab"
                aria-controls="pills-register"
                aria-selected="false"
              >
                Đăng ký
              </a>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};
