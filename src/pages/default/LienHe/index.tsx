import "./LienHe.css";

export const LienHe = () => {
  return (
    <div>
      <div className="d-flex flex-row">
        <div className="d-flex flex-fill bg-primary flex-column align-items-center justify-content-center col-6 text-white py-5">
          <p className="welcome-text">
            WELCOME TO{" "}
            <span>
              <img
                className="img-fluid logo"
                src="src/Content/img/P2N 1.svg"
                alt="P2N Logo"
              />
            </span>
          </p>
          <p className="tagline">Hành trình rèn luyện tiếng Anh THPT</p>
        </div>
        <img
          className="col-6 img-fluid"
          src="src/Content/img/phan-mem-thi-truc-tuyen-lino 1.png"
          alt="Phần mềm thi trực tuyến"
        />
      </div>

      <div className="contact-wrapper">
        <h1 className="contact-title">Liên Hệ</h1>
        <p className="contact-description">
          Xin vui lòng gửi email cho chúng tôi tại{" "}
          <a href="mailto:p2n.team@gmail.com" className="email-link">
            p2n.team@gmail.com
          </a>
          , inbox Facebook page, hoặc nhắn tin cho chúng tôi qua Zalo. Chúng tôi
          sẽ trả lời bạn trong thời gian sớm nhất :)
        </p>

        <address className="contact-address">
          <strong>Support:</strong>{" "}
          <a href="mailto:Support@example.com" className="email-link">
            Support@example.com
          </a>
          <br />
          <strong>Marketing:</strong>{" "}
          <a href="mailto:Marketing@example.com" className="email-link">
            Marketing@example.com
          </a>
        </address>
      </div>
    </div>
  );
};
