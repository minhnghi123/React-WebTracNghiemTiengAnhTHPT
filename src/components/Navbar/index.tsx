export const Navbar = () => {
  const isLoggedIn = false; // Replace with actual login check
  const userName = "User"; // Replace with actual user name

  return (
    <div id="main">
      <div id="header">
        <div id="logo">
          <img src="/src/assets/img/P2N 1.svg" alt="Logo"></img>
        </div>
    
        <ul className="nav">
          <li><a href="#">Trang Chủ</a></li>
          <li><a href="/src/pages/default/KyThi/index.tsx">Khám Phá</a></li>
          <li><a href="/src/pages/default/OnTap/index.tsx">Ôn Tập</a></li>   
          <li><a href="/src/pages/default/Home">Lớp Học</a></li>
          <li><a href="/src/pages/default/VeChungToi/index.tsx">Về Chúng Tôi</a></li>
          <li><a href="/src/pages/default/LienHe/index.tsx">Liên Hệ</a></li>
        </ul>
        
        <ul className="login">
          <li><a href="/src/pages/default/DangNhap/index.tsx">Đăng Nhập</a></li>
          <li><a href="/src/pages/default/DangKy/index.tsx">Đăng Ký</a></li>
        </ul>
      </div>
    </div>
  );
};
