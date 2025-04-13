import "bootstrap/dist/css/bootstrap.min.css";
import "./DashBoard.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthProvider";
import { io } from "socket.io-client";
import { ErrorReport } from "../QuanLyBaoLoi";

const socket = io("http://localhost:5000");

export const DashBoardGiaoVien = () => {
  const [pendingReportsCount, setPendingReportsCount] = useState(0);
  const { user } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    socket.emit("GET_ERROR_REPORTS");

    socket.on("ERROR_REPORTS", (reports) => {
      const filteredReports = reports.filter(
        (report: ErrorReport) =>
          report.status === "pending" &&
          report.examId?.createdBy === user?._id
      );
      setPendingReportsCount(filteredReports.length);
    });

    return () => {
      socket.off("ERROR_REPORTS");
    };
  }, [user?._id]);

  return (
    <div className="container mb-3 mt-5">
      <div className="row g-4">
        <div
          className="col-12 col-md-6 col-lg-3 dashboard-item"
          onClick={() => navigate("/giaovien/QuanLyDeThi")}
        >
          <div className="bg-white p-4 rounded shadow h-100 text-center">
            <img
              src="/src/Content/img/img-folder-de-thi.png"
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
              src="/src/Content/img/img-ngan-hang-cau-hoi.jpg"
              alt="Ngân hàng câu hỏi"
              style={{ width: "64px", height: "64px" }}
            />
            <p className="my-3 fw-bold" style={{ fontSize: "20px" }}>
              Ngân hàng câu hỏi
            </p>
          </div>
        </div>
        <div
          onClick={() => navigate("/giaovien/QuanLyLopHoc")}
          className="col-12 col-md-6 col-lg-3 dashboard-item"
        >
          <div className="bg-white p-4 rounded shadow h-100 text-center">
            <img
              src="/src/Content/img/img-lop-hoc.jpg"
              alt="Quản lý lớp"
              style={{ width: "64px", height: "64px" }}
            />
            <p className="my-3 fw-bold" style={{ fontSize: "20px" }}>
              Quản lý lớp
            </p>
          </div>
        </div>
        <div
          className="col-12 col-md-6 col-lg-3 dashboard-item"
          onClick={() => navigate("/giaovien/QuanLyBaoLoi")}
        >
          <div className="bg-white p-4 rounded shadow h-100 text-center position-relative">
            <img
              src="/src/Content/img/img-bao-loi.png"
              alt="Quản lý báo lỗi"
              style={{ width: "64px", height: "64px" }}
            />
            <p className="my-3 fw-bold" style={{ fontSize: "20px" }}>
              Quản lý báo lỗi
            </p>
            {pendingReportsCount > 0 && (
              <span
                className="badge bg-danger position-absolute"
                style={{ bottom: "10px", right: "10px" }}
              >
                {pendingReportsCount}
              </span>
            )}
          </div>
        </div>
        <div
          className="col-12 col-md-6 col-lg-3 dashboard-item"
          onClick={() => navigate("/giaovien/QuanLyAudio")}
        >
          <div className="bg-white p-4 rounded shadow h-100 text-center">
            <img
              src="/src/Content/img/img-audio.jpg"
              alt="Quản lý file nghe"
              style={{ width: "64px", height: "64px" }}
            />
            <p className="my-3 fw-bold" style={{ fontSize: "20px" }}>
              Quản lý file nghe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
