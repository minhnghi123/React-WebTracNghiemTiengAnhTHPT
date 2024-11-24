import "./home.css";
const Home = () => {
  return (
    <>
    <section className="hero-section">
      <div className="container-home">
        {/* Left Content */}
        <div className="hero-text">
          <span className="tagline">
            #1 Nền tảng thi trắc nghiệm online tốt nhất
          </span>
          <h1>
            Có một cách đơn giản hơn để <span className="highlight">ôn thi</span> |
            <br />
            trắc nghiệm online
          </h1>
          <p className="description">
            Tạo câu hỏi và đề thi nhanh với những giải pháp thông minh. EduQuiz
            tận dụng sức mạnh công nghệ để nâng cao trình độ học tập của bạn.
          </p>
          <div className="action-buttons">
            <button className="btn btn-primary">Tạo đề thi ngay</button>
            <button className="btn btn-secondary">Tìm kiếm đề thi</button>
          </div>
        </div>

        {/* Right Content */}
        <div className="hero-image">
          <img
            src="/src/assets/img/phan-mem-thi-truc-tuyen-lino 1.png"
            alt="Feature illustration"
          />
        </div>
      </div>
    </section>
    {/* Features Section */}
    <section className="features-section">
        <div className="container">
          <h3 className="section-title">Các tính năng nổi bật</h3>
          <div className="features">
            <div className="feature-card">
              <img
                src="/src/assets/img/giaodien1.jpg"
                alt="Feature 1"
                className="feature-img"
              />
              <h3 className="feature-title">Tạo đề thi nhanh chóng</h3>
              <p className="feature-description">
                Tạo câu hỏi và đề thi một cách dễ dàng, nhanh chóng với nhiều công cụ hỗ trợ.
              </p>
              <a href="/join-now" className="btn btn-join">Tham gia ngay</a>            </div>
            <div className="feature-card">
              <img
                src="/src/assets/img/AI1.jpg"
                alt="Feature 2"
                className="feature-img"
              />
              <h3 className="feature-title">Tính năng thông minh</h3>
              <p className="feature-description">
                Hệ thống AI giúp tối ưu việc phân tích kết quả và đưa ra gợi ý ôn luyện.
              </p>
              <a href="/join-now" className="btn btn-join">Tham gia ngay</a>            </div>
            <div className="feature-card">
              <img
                src="/src/assets/img/lophoc.jpg"
                alt="Feature 3"
                className="feature-img"
              />
              <h3 className="feature-title">Thống kê chi tiết</h3>
              <p className="feature-description">
                Xem thống kê chi tiết về kết quả học tập và tiến độ của học sinh.
              </p>
              <a href="/join-now" className="btn btn-join">Tham gia ngay</a>            </div>
          </div>
        </div>
      </section>
      <div className="container text-center py-5">
          <h2 className="feature-heading">Nền tảng học tập linh hoạt và dễ sử dụng</h2>

            <div className="row align-items-center">
                <div className="col-md-6 text-start">
                    <button className="badge bg-gradient">NHANH</button>
                    <h3 className="feature-title">Tự động tạo câu hỏi và đề thi trắc nghiệm</h3>
                    <p className="feature-description">
                        Tạo đề nhanh với vài cú nhấp chuột. Bằng cách nhập file tài liệu định dạng WORD hoặc PDF, AI sẽ giúp bạn tạo đề chính xác 100% trong vài phút.
                    </p>
                    <p className="feature-description">
                        Tối ưu trải nghiệm, tiết kiệm thời gian, công sức, đảm bảo tính khách quan và có thêm thời gian nghiên cứu, học tập.
                    </p>
                    <a href="/OnTap" className="btn btn-primary btn-lg mt-3">Bắt đầu ngay</a>
                </div>

                <div className="col-md-6 text-center">
                    <div className="image-container">
                        <img src="/src/assets/img/thithu.jpg" alt="Exam Creation Preview" className="img-fluid main-image"></img>
                    </div>
                </div>
            </div>
      </div>
       
    </>
  );
};

export default Home;
