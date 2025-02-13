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
          <div className="position-absolute top-50 start-50 translate-middle text-white text-center p-5">
            <h1 className="fw-bold display-4 display-md-3 display-lg-2">CHÀO MỪNG ĐẾN VỚI P2N</h1>
            <h2 className="text-warning h3 h-md-2 h-lg-1">Hành Trình Rèn Luyện Tiếng Anh THPT</h2>
            <p className="mt-3 lead d-none d-md-block">
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
              <div className="col-12 col-md-4 mb-4" key={index}>
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
          <h2 className="feature-heading display-4 display-md-3 display-lg-2">
            Nền tảng học tập linh hoạt và dễ sử dụng
          </h2>
          <div className="row align-items-center">
            <div className="col-12 col-md-6 text-start">
              <button
                className="badge bg-gradient"
                style={{ border: "none", outline: "none", boxShadow: "none" }}
              >
                NHANH
              </button>
              <h3 className="feature-title h4 h-md-3 h-lg-2">
                Tự động tạo câu hỏi và đề thi trắc nghiệm
              </h3>
              <p className="feature-description lead d-none d-md-block">
                Tạo đề nhanh với vài cú nhấp chuột. Bằng cách nhập file tài liệu
                định dạng WORD hoặc PDF, AI sẽ giúp bạn tạo đề chính xác 100%
                trong vài phút.
              </p>
              <p className="feature-description lead d-none d-md-block">
                Tối ưu trải nghiệm, tiết kiệm thời gian, công sức, đảm bảo tính
                khách quan và có thêm thời gian nghiên cứu, học tập.
              </p>
              <a href="/OnTap" className="btn btn-primary btn-lg mt-3">
                Bắt đầu ngay
              </a>
            </div>
            <div className="col-12 col-md-6 text-center">
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
          <div className="p2n-images d-flex flex-column flex-md-row justify-content-center align-items-center">
            <img
              src="src/Content/img/giaodien1.jpg"
              alt="Phone 1"
              className="phone-image img-fluid mb-3 mb-md-0 me-md-3"
            />
            <img
              src="src/Content/img/giaodien.jpg"
              alt="Phone 2"
              className="phone-image img-fluid"
            />
          </div>
          <div className="p2n-content text-center text-md-start mt-4 mt-md-0">
            <h2 className="display-4 display-md-3 display-lg-2">Thân thiện dễ sử dụng, cá nhân hóa việc học tập</h2>
            <ul className="list-unstyled">
              <li className="mb-3">
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
          <section className="info-section text-center text-md-start">
            <h2 className="display-4 display-md-3 display-lg-2">Học tập mọi lúc mọi nơi</h2>
            <p className="lead">
              Bất kể bạn đang ở đâu, chỉ cần có thiết bị kết nối internet, bạn đều
              có thể học tập.
            </p>
            <p className="lead">
              Bạn có thể học trên điện thoại thông minh, máy tính bảng, laptop
              hoặc máy tính để bàn.
            </p>
            <a href="#" className="btn btn-primary btn-lg mt-3">
              Bắt đầu ngay
            </a>
          </section>
          <section className="image-section d-flex justify-content-center align-items-center">
            <img
              src="src/Content/img/neverstop learn.png"
              alt="Laptop Mockup"
              className="laptop-image img-fluid"
            />
          </section>
        </section>
        {/* Testimonials Section */}
        <section className="testimonials-section text-center py-5">
          <h2 className="display-4 mb-5">Người học nói gì về chúng tôi</h2>
          <div className="row">
            {[
              {
                name: "Nguyễn Văn A",
                role: "Học sinh lớp 12",
                feedback:
                  "P2N đã giúp mình cải thiện đáng kể kỹ năng tiếng Anh. Các bài ôn tập rất rõ ràng, dễ hiểu và phù hợp với mục tiêu của mình.",
                image: "/src/Content/img/AI.jpg",
              },
              {
                name: "Trần Thị B",
                role: "Giáo viên THPT",
                feedback:
                  "Nền tảng này thực sự tiện lợi! Tôi có thể tạo bài thi nhanh chóng và học sinh cũng rất hào hứng tham gia.",
                image: "/src/Content/img/laptop.png",
              },
              {
                name: "Phạm Văn C",
                role: "Sinh viên Đại học",
                feedback:
                  "Hệ thống thi thử và phân tích kết quả rất chi tiết. Mình đã có một kế hoạch học tập rõ ràng nhờ P2N!",
                image: "/src/Content/img/maytinhbang.png",
              },
            ].map((testimonial, index) => (
              <div className="col-12 col-md-4 mb-4" key={index}>
                <div className="card shadow-sm border-0">
                  <img
                    src={testimonial.image}
                    className="card-img-top rounded-circle mx-auto mt-4"
                    alt={testimonial.name}
                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{testimonial.name}</h5>
                    <p className="text-muted">{testimonial.role}</p>
                    <p className="card-text">"{testimonial.feedback}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Core Values Section */}
        <section className="core-values-section text-center py-5 bg-light">
          <h2 className="display-4 mb-5">Giá trị cốt lõi của P2N</h2>
          <div className="row">
            {[
              {
                title: "Cá nhân hóa",
                description:
                  "Tạo lộ trình học tập riêng phù hợp với năng lực và mục tiêu của mỗi học viên.",
                icon: "fa-solid fa-user-check",
                image: "/src/Content/img/AI1.jpg",
              },
              {
                title: "Hiệu quả",
                description:
                  "Tối ưu hóa thời gian và công sức với các công cụ hỗ trợ học tập thông minh.",
                icon: "fa-solid fa-rocket",
                image: "/src/Content/img/giaodien1.jpg",
              },
              {
                title: "Sáng tạo",
                description:
                  "Khơi dậy tư duy sáng tạo và khả năng độc lập thông qua các hoạt động học tập đa dạng.",
                icon: "fa-solid fa-lightbulb",
                image: "/src/Content/img/giaodien.jpg",
              },
            ].map((value, index) => (
              <div className="col-12 col-md-4 mb-4" key={index}>
                <div className="card border-0 bg-transparent">
                  <img
                    src={value.image}
                    alt={value.title}
                    className="card-img-top rounded shadow-sm mb-4"
                    style={{ maxHeight: "200px", objectFit: "cover" }}
                  />
                  <div className="icon mb-4">
                    <i className={`${value.icon} fa-3x text-primary`}></i>
                  </div>
                  <h5 className="card-title">{value.title}</h5>
                  <p className="card-text">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* FAQs Section */}
        <section className="faqs-section py-5">
          <h2 className="display-4 text-center mb-5">Câu hỏi thường gặp</h2>
          <div className="accordion" id="faqsAccordion">
            {[
              {
                question: "P2N là gì?",
                answer:
                  "P2N là nền tảng học tiếng Anh chuyên biệt dành cho học sinh THPT, với các tính năng như ôn tập, thi thử và cá nhân hóa lộ trình học tập.",
              },
              {
                question: "Làm thế nào để tham gia thi thử?",
                answer:
                  "Bạn có thể vào mục 'Thi Thử' trong menu và chọn cấp độ hoặc chủ đề phù hợp để bắt đầu thi.",
              },
              {
                question: "Tôi có thể sử dụng P2N trên thiết bị nào?",
                answer:
                  "P2N hỗ trợ sử dụng trên các thiết bị như điện thoại, máy tính bảng và máy tính để bàn.",
              },
            ].map((faq, index) => (
              <div className="accordion-item" key={index}>
                <h2 className="accordion-header" id={`heading${index}`}>
                  <button
                    className="accordion-button"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse${index}`}
                    aria-expanded="true"
                    aria-controls={`collapse${index}`}
                  >
                    {faq.question}
                  </button>
                </h2>
                <div
                  id={`collapse${index}`}
                  className="accordion-collapse collapse"
                  aria-labelledby={`heading${index}`}
                  data-bs-parent="#faqsAccordion"
                >
                  <div className="accordion-body">{faq.answer}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  };

  export default Home;
