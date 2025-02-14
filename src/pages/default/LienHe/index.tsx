import "./LienHe.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook } from "@fortawesome/free-brands-svg-icons";

export const LienHe = () => {
  return (
    <div className="contact-page">
      <div className="contact-wrapper">
        <h1 className="contact-title">Liên Hệ</h1>
        <p className="contact-description">
          Nếu bạn có bất kỳ câu hỏi nào hoặc cần hỗ trợ, xin vui lòng liên hệ với
          chúng tôi qua các kênh dưới đây. Chúng tôi sẽ phản hồi bạn trong thời
          gian sớm nhất!
        </p>

        <div className="contact-options">
          <div className="contact-method">
            <h2 className="method-title">Email</h2>
            <p>
              <strong>Chung:</strong>{" "}
              <a href="mailto:p2n.team@gmail.com" className="email-link">
                p2n.team@gmail.com
              </a>
            </p>
            <p>
              <strong>Hỗ trợ:</strong>{" "}
              <a href="mailto:Support@example.com" className="email-link">
                Support@example.com
              </a>
            </p>
            <p>
              <strong>Marketing:</strong>{" "}
              <a href="mailto:Marketing@example.com" className="email-link">
                Marketing@example.com
              </a>
            </p>
          </div>

          <div className="contact-method">
            <h2 className="method-title">Mạng xã hội</h2>
            <ul className="social-links">
              <li>
                <a
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  <FontAwesomeIcon icon={faFacebook} className="social-link-icon" /> Facebook
                </a>
              </li>
            </ul>
          </div>

          <div className="contact-method">
            <h2 className="method-title">Địa chỉ</h2>
            <address className="contact-address">
              <p>123 Đường ABC, Phường DEF, Quận GHI, TP. Hồ Chí Minh</p>
              <p>Điện thoại: +84 123 456 789</p>
            </address>
          </div>
        </div>

        <div className="contact-form">
          <h2 className="form-title">Gửi tin nhắn</h2>
          <form>
            <div className="form-group">
              <label htmlFor="name">Họ và tên:</label>
              <input type="text" id="name" name="name" placeholder="Nhập họ và tên" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input type="email" id="email" name="email" placeholder="Nhập email của bạn" required />
            </div>
            <div className="form-group">
              <label htmlFor="message">Tin nhắn:</label>
              <textarea id="message" name="message" placeholder="Nhập nội dung tin nhắn" required />
            </div>
            <button type="submit" className="submit-button">Gửi</button>
          </form>
        </div>
      </div>
    </div>
  );
};
