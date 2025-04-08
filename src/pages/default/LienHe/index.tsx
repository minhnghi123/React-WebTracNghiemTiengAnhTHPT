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
              <p>06 Trần Văn Ơn, Phú Hoà, Thủ Dầu Một, Bình Dương</p>
              <p>Điện thoại: +84 123 456 789</p>
            </address>
          </div>
        </div>
      </div>
    </div>
  );
};
