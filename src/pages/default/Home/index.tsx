import "bootstrap/dist/css/bootstrap.min.css";
import "./reponsive.css";
import { useState, useEffect } from "react";
import { Button, Card, Row, Col } from "antd";
import {
  PlayCircleOutlined,
  BookOutlined,
  TeamOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import AppLink from "@/components/AppLink";
import "./home.css";

export const Home: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setIsLoggedIn(true);
    }
  }, []);

  const features = [
    {
      icon: <PlayCircleOutlined className="text-5xl" />,
      title: "Tham gia Đề Thi",
      description:
        "Thử sức với các đề thi sát với đề thi THPT quốc gia, nâng cao kỹ năng làm bài.",
      color: "from-blue-500 to-indigo-600",
      link: isLoggedIn ? "/KyThi" : "/Login",
      buttonText: "Tham gia ngay",
    },
    {
      icon: <BookOutlined className="text-5xl" />,
      title: "Ôn tập hiệu quả",
      description:
        "Hệ thống ôn tập thông minh giúp bạn cải thiện điểm số nhanh chóng.",
      color: "from-green-500 to-emerald-600",
      link: isLoggedIn ? "/OnTap" : "/Login",
      buttonText: "Ôn tập ngay",
    },
    {
      icon: <TeamOutlined className="text-5xl" />,
      title: "Tham gia lớp học",
      description:
        "Học tập cùng bạn bè, trao đổi kiến thức và nhận hỗ trợ từ giáo viên.",
      color: "from-purple-500 to-pink-600",
      link: isLoggedIn ? "/PhongThi" : "/Login",
      buttonText: "Tham gia ngay",
    },
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Nền tảng luyện thi
              <span className="gradient-text"> Tiếng Anh THPT</span>
              <br />
              hàng đầu Việt Nam
            </h1>
            <p className="hero-description">
              Học tập thông minh, nâng cao kỹ năng với hệ thống đề thi chuẩn
              hóa, kho tài liệu phong phú và cộng đồng học viên năng động.OK!
            </p>
            <div className="hero-buttons">
              <AppLink to={isLoggedIn ? "/KyThi" : "/Login"}>
                <Button type="primary" size="large" className="cta-button">
                  Bắt đầu ngay <ArrowRightOutlined />
                </Button>
              </AppLink>
              <AppLink to="/About">
                <Button size="large" className="secondary-button">
                  Tìm hiểu thêm
                </Button>
              </AppLink>
            </div>
          </div>

          {/* ✅ FIX: Floating cards layout - Tách riêng không chồng chéo */}
          <div className="hero-image">
            <div className="floating-card card-1">
              <div className="card-icon">📚</div>
              <div className="card-text">500+ Đề thi</div>
            </div>
            <div className="floating-card card-2">
              <div className="card-icon">🎯</div>
              <div className="card-text">98% Đạt mục tiêu</div>
            </div>
            <div className="floating-card card-3">
              <div className="card-icon">⭐</div>
              <div className="card-text">10k+ Học sinh</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - ✅ Updated với icons mới */}
      <section className="stats-section">
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8}>
            <Card className="stat-card" bordered={false}>
              <div className="stat-icon-wrapper">
                <span className="stat-icon-svg" role="img" aria-label="exam">
                  📚
                </span>
              </div>
              <div className="stat-number">500+</div>
              <div className="stat-label">Đề thi</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className="stat-card" bordered={false}>
              <div className="stat-icon-wrapper">
                <span className="stat-icon-svg" role="img" aria-label="target">
                  🎯
                </span>
              </div>
              <div className="stat-number">98%</div>
              <div className="stat-label">Đạt mục tiêu</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className="stat-card" bordered={false}>
              <div className="stat-icon-wrapper">
                <span
                  className="stat-icon-svg"
                  role="img"
                  aria-label="students"
                >
                  ⭐
                </span>
              </div>
              <div className="stat-number">10k+</div>
              <div className="stat-label">Học sinh</div>
            </Card>
          </Col>
        </Row>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Tính năng nổi bật</h2>
          <p className="section-description">
            Khám phá những công cụ học tập hiệu quả nhất
          </p>
        </div>
        <Row gutter={[32, 32]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={24} md={8} key={index}>
              <Card className="feature-card" hoverable>
                <div
                  className={`feature-icon bg-gradient-to-br ${feature.color}`}
                >
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <AppLink to={feature.link}>
                  <Button type="link" className="feature-button">
                    {feature.buttonText} <ArrowRightOutlined />
                  </Button>
                </AppLink>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Sẵn sàng bắt đầu hành trình của bạn?</h2>
          <p className="cta-description">
            Tham gia cùng hàng nghìn học sinh đã đạt được mục tiêu của mình
          </p>
          <AppLink to={isLoggedIn ? "/KyThi" : "/SignUp"}>
            <Button type="primary" size="large" className="cta-button-large">
              {isLoggedIn ? "Tham gia đề thi ngay" : "Đăng ký miễn phí"}
            </Button>
          </AppLink>
        </div>
      </section>
    </div>
  );
};

export default Home;
