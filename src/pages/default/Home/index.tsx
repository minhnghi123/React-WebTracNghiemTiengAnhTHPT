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

const Home = () => {
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

  const stats = [
    { number: "10,000+", label: "Học sinh" },
    { number: "500+", label: "Đề thi" },
    { number: "100+", label: "Giáo viên" },
    { number: "98%", label: "Hài lòng" },
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
              hóa, kho tài liệu phong phú và cộng đồng học viên năng động.
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

      {/* Stats Section */}
      <section className="stats-section">
        <Row gutter={[32, 32]}>
          {stats.map((stat, index) => (
            <Col xs={12} sm={12} md={6} key={index}>
              <div className="stat-card">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </Col>
          ))}
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
