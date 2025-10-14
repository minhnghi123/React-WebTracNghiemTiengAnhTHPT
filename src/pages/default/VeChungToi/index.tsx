import "./VeChungToi.css";
import {
  BookOutlined,
  RocketOutlined,
  HeartOutlined,
  StarOutlined,
} from "@ant-design/icons";
import lino from "/src/assets/img/phan-mem-thi-truc-tuyen-lino 1.png";
import AppLink from "@/components/AppLink";

export const VeChungToi = () => {
  return (
    <div className="about-us-page">
      {/* Hero Section */}
      <div className="about-hero">
        <div className="about-hero-background"></div>
        <div className="about-hero-content">
          <BookOutlined className="about-hero-icon" />
          <h1 className="about-hero-title">Về Chúng Tôi</h1>
          <p className="about-hero-subtitle">
            Nền tảng học tiếng Anh trực tuyến hàng đầu Việt Nam
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="about-container">
        {/* Introduction Card */}
        <div className="about-card">
          <div className="about-intro-grid">
            <div className="about-intro-text">
              <h2>Giới thiệu</h2>
              <p>
                <strong>P2N</strong> là một trong những phần mềm tự học tiếng
                Anh trực tuyến hiệu quả. Chúng tôi cung cấp giao diện thân
                thiện, dễ sử dụng, và các bài kiểm tra được thiết kế với bố cục,
                thời lượng tương tự như các Đề Thi tiếng Anh thực tế.
              </p>
              <p>
                Với nguồn đề thi phong phú được thu thập từ các nguồn uy tín,
                người dùng có thể tự luyện thi các Đề Thi quan trọng như{" "}
                <strong>IELTS</strong>, <strong>TOEIC</strong>,... và cải thiện
                các kỹ năng ngôn ngữ một cách toàn diện.
              </p>
            </div>
            <div className="about-intro-image">
              <img src={lino} alt="P2N Platform" />
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="about-card">
          <h2 className="section-title-center">Giá Trị Cốt Lõi</h2>
          <div className="about-values-grid">
            <div className="value-card">
              <div className="value-icon">
                <RocketOutlined />
              </div>
              <h3>Tầm Nhìn</h3>
              <p>
                Trở thành nền tảng học tiếng Anh trực tuyến hàng đầu, mang lại
                giải pháp học tập tối ưu cho mọi người.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">
                <HeartOutlined />
              </div>
              <h3>Sứ Mệnh</h3>
              <p>
                Cung cấp công cụ học tập hiệu quả, giúp người học tiếng Anh đạt
                được mục tiêu cá nhân nhanh chóng và dễ dàng.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">
                <StarOutlined />
              </div>
              <h3>Giá Trị</h3>
              <ul>
                <li>Chất lượng</li>
                <li>Uy tín</li>
                <li>Sáng tạo</li>
                <li>Khách hàng là trung tâm</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="about-card">
          <h2 className="section-title-center">Thông Tin Liên Hệ</h2>
          <div className="about-contact-grid">
            <div className="contact-item">
              <h5>Người thành lập</h5>
              <p>P2N Team</p>
            </div>
            <div className="contact-item">
              <h5>Địa chỉ</h5>
              <p>Đại Học Thủ Dầu Một</p>
            </div>
            <div className="contact-item">
              <h5>Liên hệ</h5>
              <p>
                <AppLink to="/Contact" className="contact-link">
                  Gửi phản hồi
                </AppLink>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
