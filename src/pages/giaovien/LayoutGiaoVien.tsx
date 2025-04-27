import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Outlet } from "react-router-dom";
import  { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuthContext } from "@/contexts/AuthProvider";

import "bootstrap/dist/css/bootstrap.min.css";
import { ErrorReport } from "./QuanLyBaoLoi";

const socket = io("http://localhost:5000");

const LayoutGiaoVien = () => {
  const { user } = useAuthContext();

  const [pendingReportsCount, setPendingReportsCount] = useState(0);

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
    <div id="main">
      <Navbar rule={false} />
      <div className="container-fluid">
        <div className="row">
          <nav className="col-md-3 col-lg-2 d-md-block bg-light sidebar">
            <div className="position-sticky pt-3">
              <a
                href="/"
                className="d-flex align-items-center pb-3 mb-md-0 me-md-auto text-dark text-decoration-none"
                style={{ fontWeight: "bold" }}
              ></a>

              {/* Sidebar menu */}
              <ul
                className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start"
                id="menu"
                style={{
                  width: "100%",
                  padding: "15px",
                  backgroundColor: "#ffffff",
                  borderRadius: "10px",
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                }}
              >
                <li style={{ width: "100%" }}>
                  <a
                    href="#submenu1"
                    data-bs-toggle="collapse"
                    className="nav-link px-0 align-middle"
                    style={{
                      color: "#343a40",
                      padding: "12px",
                      display: "flex",
                      alignItems: "center",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                    }}
                  >
                    <i className="fas fa-tachometer-alt me-2"></i>
                    <span className="ms-1 d-none d-sm-inline">
                      Quản lý chung
                    </span>
                  </a>
                  <ul
                    className="collapse show nav flex-column ms-1 ml-4"
                    id="submenu1"
                    data-bs-parent="#menu"
                  >
                    <li>
                      <a
                        href="/GiaoVien/QuanLyDeThi"
                        className="nav-link px-0"
                        style={{
                          color: "#495057",
                          padding: "8px 0",
                          textTransform: "capitalize",
                        }}
                      >
                        Quản lý đề thi
                      </a>
                    </li>
                    <li>
                      <a
                        href="/giaovien/QuanLyLopHoc"
                        className="nav-link px-0"
                        style={{
                          color: "#495057",
                          padding: "8px 0",
                          textTransform: "capitalize",
                        }}
                      >
                        Quản lý lớp học
                      </a>
                    </li>
                    <li>
                      <a
                        href="/giaovien/NganHangCauHoi"
                        className="nav-link px-0"
                        style={{
                          color: "#495057",
                          padding: "8px 0",
                          textTransform: "capitalize",
                        }}
                      >
                        Ngân hàng câu hỏi
                      </a>
                    </li>
                    <li>
                      <a
                        href="/GiaoVien/QuanLyBaoLoi"
                        className="nav-link px-0 d-flex justify-content-between align-items-center"
                        style={{
                          color: "#495057",
                          padding: "8px 0",
                          textTransform: "capitalize",
                        }}
                      >
                        Báo lỗi
                        {pendingReportsCount > 0 && (
                          <span
                            className="badge bg-danger"
                            style={{
                              fontSize: "12px",
                              marginLeft: "10px",
                            }}
                          >
                            {pendingReportsCount}
                          </span>
                        )}
                      </a>
                    </li>
                    <li>
                      <a
                        href="/giaovien/QuanLyAudio"
                        className="nav-link px-0"
                        style={{
                          color: "#495057",
                          padding: "8px 0",
                          textTransform: "capitalize",
                        }}
                      >
                        Quản lý file nghe
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
              <hr />
            </div>
          </nav>
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <Outlet />
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LayoutGiaoVien;
