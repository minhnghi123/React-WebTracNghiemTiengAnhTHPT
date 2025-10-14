import "./footer.css";
export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container3">
        <div className="footer-content">
          {/* Quick Links */}
          <div>
            <h2>Liên kết</h2>
            <ul>
              <li>
                <a href="/">Trang chủ</a>
              </li>
              <li>
                <a href="/About">Về chúng tôi</a>
              </li>
              <li>
                <a href="/Contact">Liên hệ</a>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h2>Tính năng</h2>
            <ul>
              <li>
                <a href="/KyThi">Đề thi</a>
              </li>
              <li>
                <a href="/OnTap">Ôn tập</a>
              </li>
              <li>
                <a href="/PhongThi">Lớp học</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2>Liên hệ</h2>
            <ul className="contact-info">
              <li>
                <i className="fas fa-envelope"></i>
                <span>support@p2nenglish.com</span>
              </li>
              <li>
                <i className="fas fa-phone"></i>
                <span>0123 456 789</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2024 P2N English. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
