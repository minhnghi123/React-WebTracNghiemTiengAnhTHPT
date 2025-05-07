import "./VeChungToi.css";
import "bootstrap/dist/css/bootstrap.min.css";
import lino from "/src/assets/img/phan-mem-thi-truc-tuyen-lino 1.png";
export const VeChungToi = () => {
  return (
    <div>
      <div className="content-wrapper">
        <div className="container">
          <h1 id="vechungtoi" className="text-center my-4">
            Về Chúng Tôi
          </h1>
          <div className="content">
            <div className="row">
              <div className="col-md-6">
                <h2 className="info-title">Giới thiệu</h2>
                <p>
                  P2N là một trong những phần mềm tự học tiếng Anh trực tuyến
                  hiệu quả. Chúng tôi cung cấp giao diện thân thiện, dễ sử dụng,
                  và các bài kiểm tra được thiết kế với bố cục, thời lượng tương
                  tự như các Đề Thi tiếng Anh thực tế.
                </p>
                <p>
                  Với nguồn đề thi phong phú được thu thập từ các nguồn uy tín,
                  người dùng có thể tự luyện thi các Đề Thi quan trọng như
                  <strong> IELTS</strong>, <strong>TOEIC</strong>,... và cải
                  thiện các kỹ năng ngôn ngữ một cách toàn diện.
                </p>
              </div>
              <div className="col-md-6 text-center">
                <img
                  src={lino}
                  alt="About us illustration"
                  className="img-fluid rounded"
                />
              </div>
            </div>

            <hr className="my-4" />

            <div className="row">
              <div className="col-md-4">
                <h2 className="info-title">Tầm Nhìn</h2>
                <p>
                  Trở thành nền tảng học tiếng Anh trực tuyến hàng đầu, mang lại
                  giải pháp học tập tối ưu cho mọi người.
                </p>
              </div>
              <div className="col-md-4">
                <h2 className="info-title">Sứ Mệnh</h2>
                <p>
                  Cung cấp công cụ học tập hiệu quả, giúp người học tiếng Anh
                  đạt được mục tiêu cá nhân nhanh chóng và dễ dàng.
                </p>
              </div>
              <div className="col-md-4">
                <h2 className="info-title">Giá Trị Cốt Lõi</h2>
                <ul>
                  <li>Chất lượng</li>
                  <li>Uy tín</li>
                  <li>Sáng tạo</li>
                  <li>Khách hàng là trung tâm</li>
                </ul>
              </div>
            </div>

            <hr className="my-4" />

            <h2 className="info-title text-center">Thông Tin Liên Hệ</h2>
            <div className="row text-center">
              <div className="col-md-4">
                <h5>Người thành lập</h5>
                <p>P2N</p>
              </div>
              <div className="col-md-4">
                <h5>Địa chỉ</h5>
                <p>Đại Học Thủ Dầu Một</p>
              </div>
              <div className="col-md-4">
                <h5>Liên hệ</h5>
                <p>
                  <a href="/Contact" className="contact-link">
                    Gửi phản hồi
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
