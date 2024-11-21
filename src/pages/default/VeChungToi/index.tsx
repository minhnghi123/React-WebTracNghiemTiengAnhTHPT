import "./VeChungToi.css";
import "bootstrap/dist/css/bootstrap.min.css";
export const VeChungToi = () => {
  return (
    <div>
      <div className="d-flex flex-row">
        <div className="d-flex flex-fill bg-primary flex-column align-items-center justify-content-center col-6 text-white py-5">
          <p className="welcome-text">WELCOME TO PEN</p>
          <p className="tagline">Hành trình rèn luyện tiếng Anh THPT</p>
        </div>
        <img
          className="col-6 img-fluid"
          src="src/Content/img/phan-mem-thi-truc-tuyen-lino 1.png"
          alt="Phần mềm thi trực tuyến"
        />
      </div>
      <div className="content-wrapper">
        <div className="sm-container">
          <h1 id="vechungtoi" className="text-center my-4">
            Về Chúng Tôi
          </h1>
          <div className="content">
            <p>
              P2N là một trong những phần mềm tự học tiếng Anh trực tuyến hiệu
              quả. Chúng tôi cung cấp cho người dùng phần mềm tự học tiếng Anh
              với giao diện thân thiện, dễ sử dụng và các phần thi được thiết kế
              với bố cục, thời lượng tương tự như kỳ thi tiếng Anh thực tế với
              số lượng đề thi khủng được thu thập từ các nguồn uy tín. Nhờ đó
              người dùng có thể tự ôn tập, luyện thi cấp tốc để chuẩn bị cho các
              kỳ thi tiếng Anh quan trọng như IELTS, TOEIC,… đồng thời rèn luyện
              các kỹ năng ngôn ngữ một cách toàn diện nhất.
            </p>
            <h2 className="info-title">Thông Tin</h2>
            <p>
              Người thành lập: P2N <br />
              Địa Chỉ: Đại Học Thủ Dầu Một
            </p>
            <p>
              Xin vui lòng{" "}
              <a className="contact-link" href="/Home/Contact.cshtml">
                Liên hệ
              </a>{" "}
              với chúng tôi nếu bạn có bất cứ thắc mắc góp ý nào.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
