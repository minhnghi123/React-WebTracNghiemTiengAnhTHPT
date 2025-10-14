import "./LienHe.css";
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  FacebookFilled,
  MessageOutlined,
} from "@ant-design/icons";

export const LienHe = () => {
  return (
    <div className="contact-page">
      {/* Hero Section */}
      <div className="contact-hero">
        <div className="contact-hero-background"></div>
        <div className="contact-hero-content">
          <MessageOutlined className="contact-hero-icon" />
          <h1 className="contact-hero-title">Liên Hệ Với Chúng Tôi</h1>
          <p className="contact-hero-subtitle">
            Nếu bạn có bất kỳ câu hỏi nào hoặc cần hỗ trợ, xin vui lòng liên hệ
            với chúng tôi
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="contact-wrapper">
        <div className="contact-content">
          {/* Left side - Contact Info */}
          <div className="contact-info-section">
            <div className="contact-method">
              <div className="method-icon-wrapper">
                <MailOutlined className="method-icon" />
              </div>
              <h2 className="method-title">Email</h2>
              <p>
                <strong>Email chung:</strong>
                <br />
                <a href="mailto:p2n.team@gmail.com" className="email-link">
                  p2n.team@gmail.com
                </a>
              </p>
              <p>
                <strong>Hỗ trợ kỹ thuật:</strong>
                <br />
                <a href="mailto:Support@example.com" className="email-link">
                  Support@example.com
                </a>
              </p>
            </div>

            <div className="contact-method">
              <div className="method-icon-wrapper">
                <EnvironmentOutlined className="method-icon" />
              </div>
              <h2 className="method-title">Địa chỉ</h2>
              <address className="contact-address">
                <p>06 Trần Văn Ơn, Phú Hoà</p>
                <p>Thủ Dầu Một, Bình Dương</p>
                <p>
                  <PhoneOutlined /> <strong>Điện thoại:</strong> +84 123 456 789
                </p>
              </address>
            </div>

            <div className="contact-method">
              <div className="method-icon-wrapper">
                <FacebookFilled className="method-icon" />
              </div>
              <h2 className="method-title">Mạng xã hội</h2>
              <ul className="social-links">
                <li>
                  <a
                    href="https://www.facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                  >
                    <FacebookFilled className="social-link-icon" />
                    Facebook
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Right side - Contact Form */}
          <div className="contact-form-section">
            <h2 className="form-title">Gửi tin nhắn cho chúng tôi</h2>
            <form className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Họ và tên</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Nhập họ và tên của bạn"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Nhập email của bạn"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Tiêu đề</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  placeholder="Tiêu đề tin nhắn"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Nội dung</label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Nhập nội dung tin nhắn của bạn"
                  required
                />
              </div>

              <button type="submit" className="submit-button">
                Gửi tin nhắn
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
