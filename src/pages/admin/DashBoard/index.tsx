import "bootstrap/dist/css/bootstrap.min.css";
import "./DashBoard.css";
import { useNavigate } from "react-router-dom";
import dethi from "/src/Content/img/img-folder-de-thi.png";
import lophoc from "/src/Content/img/img-lop-hoc.jpg";
export const DashBoarAdmin = () => {
  const navigate = useNavigate();

  return (
    <div className="container mb-3 mt-5">
      <div className="row g-4">
        <div
          onClick={() => navigate("/Admin/DangCauHoi")}
          className="col-12 col-md-6 col-lg-3 dashboard-item"
        >
          <div className="bg-white p-4 rounded shadow h-100 text-center">
            <img
              src={dethi}
              alt="Đề thi"
              style={{ width: "64px", height: "64px" }}
            />
            <p className="my-3 fw-bold" style={{ fontSize: "20px" }}>
              Quản lý dạng câu hỏi
            </p>
          </div>
        </div>
        {/* <div
          className="col-12 col-md-6 col-lg-3 dashboard-item"
          onClick={() => navigate("/giaovien/NganHangCauHoi")}
        >
          <div className="bg-white p-4 rounded shadow h-100 text-center">
            <img
              src="/src/Content/img/img-ngan-hang-cau-hoi.jpg"
              alt="Ngân hàng câu hỏi"
              style={{ width: "64px", height: "64px" }}
            />
            <p className="my-3 fw-bold" style={{ fontSize: "20px" }}>
              Ngân hàng câu hỏi
            </p>
          </div>
        </div> */}
        <div
          onClick={() => navigate("/Admin/QuanLyTaiKhoan")}
          className="col-12 col-md-6 col-lg-3 dashboard-item"
        >
          <div className="bg-white p-4 rounded shadow h-100 text-center">
            <img
              src={lophoc}
              alt="Quản lý lớp"
              style={{ width: "64px", height: "64px" }}
            />
            <p className="my-3 fw-bold" style={{ fontSize: "20px" }}>
              {" "}
              Quản lý tài khoản
            </p>
          </div>
        </div>
        {/* <div className="col-12 col-md-6 col-lg-3 dashboard-item">
          <div className="bg-white p-4 rounded shadow h-100 text-center">
            <img
              src="/src/Content/img/duyet-de-thi.png"
              alt="Quản lý báo lỗi"
              style={{ width: "64px", height: "64px" }}
            />
            <p className="my-3 fw-bold" style={{ fontSize: "20px" }}>
              Duyệt đề thi
            </p>
          </div>
        </div> */}
      </div>
    </div>
  );
};
