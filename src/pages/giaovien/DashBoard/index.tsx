import "bootstrap/dist/css/bootstrap.min.css";
import "./DashBoard.css";
import { useEffect, useState } from "react";
import { useAuthContext } from "@/contexts/AuthProvider";
import { io } from "socket.io-client";
import { ErrorReport } from "../QuanLyBaoLoi";
import dethi from "/src/Content/img/img-folder-de-thi.png";
import cauhoi from "/src/Content/img/img-ngan-hang-cau-hoi.jpg";
import lophoc from "/src/Content/img/img-lop-hoc.jpg";
import baoloi from "/src/Content/img/img-bao-loi.png";
import audio from "/src/Content/img/img-audio.jpg";
import AppLink from "@/components/AppLink";
const socket = io("http://https://react-webtracnghiemtienganhthpt-ke5j.onrender.com");

export const DashBoardGiaoVien = () => {
  const [pendingReportsCount, setPendingReportsCount] = useState(0);
  const { user } = useAuthContext();

  useEffect(() => {
    socket.emit("GET_ERROR_REPORTS");

    socket.on("ERROR_REPORTS", (reports) => {
      const filteredReports = reports.filter(
        (report: ErrorReport) =>
          report.status === "pending" && report.examId?.createdBy === user?._id
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
        <div className="col-12 col-md-6 col-lg-3 dashboard-item">
          <AppLink to="/giaovien/QuanLyDeThi" style={{ textDecoration: "none" }}>
            <div className="bg-white p-4 rounded shadow h-100 text-center">
              <img
                src={dethi}
                alt="Đề thi"
                style={{ width: "64px", height: "64px" }}
              />
              <p className="my-3 fw-bold" style={{ fontSize: "20px" }}>
                Đề thi
              </p>
            </div>
          </AppLink>
        </div>
        <div className="col-12 col-md-6 col-lg-3 dashboard-item">
          <AppLink to="/giaovien/NganHangCauHoi" style={{ textDecoration: "none" }}>
            <div className="bg-white p-4 rounded shadow h-100 text-center">
              <img
                src={cauhoi}
                alt="Ngân hàng câu hỏi"
                style={{ width: "64px", height: "64px" }}
              />
              <p className="my-3 fw-bold" style={{ fontSize: "20px" }}>
                Ngân hàng câu hỏi
              </p>
            </div>
          </AppLink>
        </div>
        <div className="col-12 col-md-6 col-lg-3 dashboard-item">
          <AppLink to="/giaovien/QuanLyLopHoc" style={{ textDecoration: "none" }}>
            <div className="bg-white p-4 rounded shadow h-100 text-center">
              <img
                src={lophoc}
                alt="Quản lý lớp"
                style={{ width: "64px", height: "64px" }}
              />
              <p className="my-3 fw-bold" style={{ fontSize: "20px" }}>
                Quản lý lớp
              </p>
            </div>
          </AppLink>
        </div>
        <div className="col-12 col-md-6 col-lg-3 dashboard-item">
          <AppLink to="/GiaoVien/QuanLyBaoLoi" style={{ textDecoration: "none" }}>
            <div className="bg-white p-4 rounded shadow h-100 text-center position-relative">
              <img
                src={baoloi}
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
          </AppLink>
        </div>
        <div className="col-12 col-md-6 col-lg-3 dashboard-item">
          <AppLink to="/giaovien/QuanLyAudio" style={{ textDecoration: "none" }}>
            <div className="bg-white p-4 rounded shadow h-100 text-center">
              <img
                src={audio}
                alt="Quản lý file nghe"
                style={{ width: "64px", height: "64px" }}
              />
              <p className="my-3 fw-bold" style={{ fontSize: "20px" }}>
                Quản lý file nghe
              </p>
            </div>
          </AppLink>
        </div>
      </div>
    </div>
  );
};
