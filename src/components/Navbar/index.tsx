export const Navbar = () => {
  const isLoggedIn = false; // Replace with actual login check
  const userName = "User"; // Replace with actual user name

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
                className="nav-link"
                href="/admin/Login/Logout"
                style={{ color: "#007bff", fontWeight: "bold" }}
              >
                <span className="fas fa-sign-in-alt"></span> Log Out
              </a>
            </li>
          </ul>
        ) : (
          <ul
            className="nav nav-pills nav-justified gap-2"
            id="ex1"
            role="tablist"
          >
            <li
              className="nav-item bg-secondary rounded-pill"
              role="presentation"
            >
              <a
                className="nav-link text-danger"
                id="tab-login"
                href="/Login"
                role="tab"
                aria-controls="pills-login"
                aria-selected="true"
              >
                Đăng nhập
              </a>
            </li>
            <li className="nav-item" role="presentation">
              <a
                className="nav-link bg-primary text-white rounded-pill"
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
