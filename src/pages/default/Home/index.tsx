import "bootstrap/dist/css/bootstrap.min.css";

const Home = () => {
  return (
    <div className="container my-5">
      {/* Header Section */}
      <div className="position-relative">
        {/* Slideshow */}
        <div id="carouselExample" className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-inner">
            {/* Slide 1 */}
            <div className="carousel-item active">
              <div
                className="bg-image"
                style={{
                  backgroundImage: "url('/src/Content/img/englishBanner.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  height: "600px",
                  filter: "brightness(80%)",
                }}
              ></div>
            </div>
            {/* Slide 2 */}
            <div className="carousel-item">
              <div
                className="bg-image"
                style={{
                  backgroundImage: "url('/src/Content/img/laptop.png')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  height: "600px",
                  filter: "brightness(80%)",
                }}
              ></div>
            </div>
            {/* Slide 3 */}
            <div className="carousel-item">
              <div
                className="bg-image"
                style={{
                  backgroundImage: "url('/src/Content/img/giaodien.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  height: "600px",
                  filter: "brightness(80%)",
                }}
              ></div>
            </div>
          </div>

          {/* Điều hướng */}
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#carouselExample"
            data-bs-slide="prev"
          >
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#carouselExample"
            data-bs-slide="next"
          >
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>

        {/* Nội dung hiển thị */}
        <div
          className="position-absolute top-50 start-50 translate-middle text-white text-center p-5"
          style={{
            marginTop: "50px",
          }}
        >
          <h1 className="fw-bold">CHÀO MỪNG ĐẾN VỚI P2N</h1>
          <h2 className="text-warning">Hành Trình Rèn Luyện Tiếng Anh THPT</h2>
          <p className="mt-3">
            Tăng cường kỹ năng tiếng Anh mỗi ngày với các bài học và kỳ thi được thiết kế
            riêng dành cho bạn!
          </p>
          <button className="btn btn-warning btn-lg mt-4">Bắt đầu ngay</button>
        </div>
      </div>


      {/* Main Features Section */}
      <section className="mt-5">
        <h3 className="text-center mb-4">Các tính năng nổi bật</h3>
        <div className="row text-center">
          {[
            {
              image: "/src/Content/img/thithu.jpg",
              text: "Tham gia các bài thi thử theo từng cấp độ và chủ đề để đánh giá kiến thức.",
              link: "/kythi",
              buttonText: "Thi ngay",
            },
            {
              image: "/src/Content/img/ontap.jpg",
              text: "Cải thiện kiến thức với các bài ôn tập có hướng dẫn và đáp án chi tiết.",
              link: "/OnTap",
              buttonText: "Vào ôn thi",
            },
            {
              image: "/src/Content/img/lophoc.jpg",
              text: "Tham gia lớp học để có những kỳ thi sát chủ đề nhất.",
              link: "/PhongThi",
              buttonText: "Vào lớp",
            },
          ].map((feature, index) => (
            <div className="col-md-4 mb-4" key={index}>
              <div className="card border-0 shadow-sm h-100 hover-card">
                <a href={feature.link}>
                  <img src={feature.image} className="card-img-top hover-image" alt="" />
                </a>                
                <div className="card-body">
                  <p className="card-text">{feature.text}</p>
                  <a href={feature.link} className="btn btn-primary btn-lg">
                    {feature.buttonText}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Flexible Learning Section */}
      <div className="container text-center py-5">
        <h2 className="feature-heading">
          Nền tảng học tập linh hoạt và dễ sử dụng
        </h2>
        <div className="row align-items-center">
          <div className="col-md-6 text-start">
            <button
              className="badge bg-gradient"
              style={{ border: "none", outline: "none", boxShadow: "none" }}
            >
              NHANH
            </button>
            <h3 className="feature-title">
              Tự động tạo câu hỏi và đề thi trắc nghiệm
            </h3>
            <p className="feature-description">
              Tạo đề nhanh với vài cú nhấp chuột. Bằng cách nhập file tài liệu
              định dạng WORD hoặc PDF, AI sẽ giúp bạn tạo đề chính xác 100%
              trong vài phút.
            </p>
            <p className="feature-description">
              Tối ưu trải nghiệm, tiết kiệm thời gian, công sức, đảm bảo tính
              khách quan và có thêm thời gian nghiên cứu, học tập.
            </p>
            <a href="/OnTap" className="btn btn-primary btn-lg mt-3">
              Bắt đầu ngay
            </a>
          </div>
          <div className="col-md-6 text-center">
            <div className="image-container">
              <img
                src="src/Content/img/AI1.jpg"
                alt="Exam Creation Preview"
                className="img-fluid main-image"
              />
            </div>
          </div>
        </div>
      </div>

      {/* User-Friendly Section */}
      <section className="p2n-section">
        <div className="p2n-images">
          <img
            src="src/Content/img/giaodien1.jpg"
            alt="Phone 1"
            className="phone-image"
          />
          <img
            src="src/Content/img/giaodien.jpg"
            alt="Phone 2"
            className="phone-image"
          />
        </div>
        <div className="p2n-content">
          <h2>Thân thiện dễ sử dụng, cá nhân hóa việc học tập</h2>
          <ul>
            <li>
              👑 Giao diện P2N được thiết kế trực quan, thân thiện giúp người
              dùng thực hiện thao tác nhanh chóng và sử dụng được tối đa các
              tính năng hữu ích trên nền tảng.
            </li>
            <li>
              👤 Bằng cách cá nhân hóa, mỗi người dùng có trải nghiệm riêng và
              xây dựng lộ trình học tập phù hợp cho chính mình. Từ đó, kích
              thích tư duy độc lập, sáng tạo và đạt kết quả học tập tốt.
            </li>
          </ul>
          <a href="#" className="btn btn-primary btn-lg mt-3">
            Bắt đầu ngay
          </a>
        </div>
      </section>

      {/* Learn Anywhere Section */}
      <section className="container1">
        <section className="info-section">
          <h2>Học tập mọi lúc mọi nơi</h2>
          <p>
            Bất kể bạn đang ở đâu, chỉ cần có thiết bị kết nối internet, bạn đều
            có thể học tập.
          </p>
          <p>
            Bạn có thể học trên điện thoại thông minh, máy tính bảng, laptop
            hoặc máy tính để bàn.
          </p>
          <a href="#" className="btn btn-primary btn-lg mt-3">
            Bắt đầu ngay
          </a>
        </section>
        <section className="image-section">
          <img
            src="src/Content/img/neverstop learn.png"
            alt="Laptop Mockup"
            className="laptop-image"
          />
        </section>
      </section>
    </div>
  );
};

export default Home;
