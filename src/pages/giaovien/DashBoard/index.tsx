import "bootstrap/dist/css/bootstrap.min.css";
import "./DashBoard.css";
import { useNavigate } from "react-router-dom";
export const DashBoardGiaoVien = () => {
  const navigate = useNavigate();

  return (
    <div className="container mb-3 mt-5">
      <div className="row g-4">
        <div className="col-12 col-md-6 col-lg-3 dashboard-item">
          <div className="bg-white p-4 rounded shadow h-100 text-center">
            <img
              src="src/Content/img/img-folder-de-thi.png"
              alt="Đề thi"
              style={{ width: "64px", height: "64px" }}
            />
            <p className="my-3 fw-bold" style={{ fontSize: "20px" }}>
              Đề thi
            </p>
          </div>
        </div>
        <div
          className="col-12 col-md-6 col-lg-3 dashboard-item"
          onClick={() => navigate("/giaovien/NganHangCauHoi")}
        >
          <div className="bg-white p-4 rounded shadow h-100 text-center">
            <img
              src="src/Content/img/img-ngan-hang-cau-hoi.jpg"
              alt="Ngân hàng câu hỏi"
              style={{ width: "64px", height: "64px" }}
            />
            <p className="my-3 fw-bold" style={{ fontSize: "20px" }}>
              Ngân hàng câu hỏi
            </p>
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-3 dashboard-item">
          <div className="bg-white p-4 rounded shadow h-100 text-center">
            <img
              src="src/Content/img/img-lop-hoc.jpg"
              alt="Quản lý lớp"
              style={{ width: "64px", height: "64px" }}
            />
            <p className="my-3 fw-bold" style={{ fontSize: "20px" }}>
              Quản lý lớp
            </p>
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-3 dashboard-item">
          <div className="bg-white p-4 rounded shadow h-100 text-center">
            <img
              src="src/Content/img/img-bao-loi.png"
              alt="Quản lý báo lỗi"
              style={{ width: "64px", height: "64px" }}
            />
            <p className="my-3 fw-bold" style={{ fontSize: "20px" }}>
              Quản lý báo lỗi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
