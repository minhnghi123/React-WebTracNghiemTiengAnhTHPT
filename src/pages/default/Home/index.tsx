import "bootstrap/dist/css/bootstrap.min.css";
import "./reponsive.css";
import { useState, useEffect } from "react";
import thithu from "/src/assets/img/thithu.jpg";
import ontap from "/src/assets/img/ontap.jpg";
import lophoc from "/src/assets/img/lophoc.jpg";
import giaodien from "/src/assets/img/giaodien.jpg";
import maytinhban from "/src/assets/img/maytinhbang.png";
import AppLink from "@/components/AppLink";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData); // Parse JSON từ localStorage
      console.log("User Info:", user);
      setIsLoggedIn(true);
    }
  }, []);

  const slides = [
    {
      image: giaodien,
      title: "Ôn Thi Trắc Nghiệm Tiếng Anh",
      desc: "Nền tảng luyện tập và nâng cao kỹ năng làm bài thi hiệu quả",
    },
    {
      image: ontap,
      title: "Kho Đề Thi Đa Dạng",
      desc: "Cập nhật đề thi mới nhất, sát với đề thi THPT quốc gia",
    },
    {
      image: maytinhban,
      title: "Theo Dõi Tiến Trình Học Tập",
      desc: "Thống kê kết quả học tập, giúp bạn cải thiện từng ngày",
    },
  ];

  const changeSlide = (newIndex: number) => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setFade(true);
    }, 500);
  };

  const prevSlide = () => {
    changeSlide(currentIndex === 0 ? slides.length - 1 : currentIndex - 1);
  };

  const nextSlide = () => {
    changeSlide(currentIndex === slides.length - 1 ? 0 : currentIndex + 1);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 3000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <div className="container my-5">
      <div className="slider relative mb-10">
        <img
          src={slides[currentIndex].image}
          alt="Slide"
          className={`slider-image ${fade ? "fade-in" : "fade-out"}`}
        />
        <div className={`slider-overlay ${fade ? "fade-in" : "fade-out"}`}>
          <h2 className="slider-title">{slides[currentIndex].title}</h2>
          <p className="slider-desc">{slides[currentIndex].desc}</p>
        </div>
        <button onClick={prevSlide} className="slider-btn prev">
          &#10094;
        </button>
        <button onClick={nextSlide} className="slider-btn next">
          &#10095;
        </button>
      </div>

      {/* Gợi ý tham gia Đề Thi, ôn tập, tham gia lớp học */}
      <div className="exam-prep-section grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        {/* Tham gia Đề Thi */}
        <div className="exam-card">
          <img src={thithu} alt="Tham gia Đề Thi" className="exam-image" />
          <div className="exam-info">
            <h3 className="text-xl font-bold">Tham gia Đề Thi</h3>
            <p className="text-gray-600 mt-2">
              Thử sức với các đề thi sát với đề thi THPT quốc gia, nâng cao kỹ
              năng làm bài.
            </p>
            <AppLink
              className="ant-btn mt-4 px-6 py-2 bg-blue-500 text-black font-semibold rounded-lg shadow-md hover:bg-blue-600 transition"
              to={isLoggedIn ? "/KyThi" : "/Login"}
            >
              Tham gia ngay
            </AppLink>
          </div>
        </div>

        {/* Ôn tập */}
        <div className="exam-card">
          <img src={ontap} alt="Ôn tập hiệu quả" className="exam-image" />
          <div className="exam-info">
            <h3 className="text-xl font-bold">Ôn tập hiệu quả</h3>
            <p className="text-gray-600 mt-2">
              Hệ thống ôn tập thông minh giúp bạn cải thiện điểm số nhanh chóng.
            </p>
            <AppLink
              className="ant-btn mt-4 px-6 py-2 bg-green-500 text-black font-semibold rounded-lg shadow-md hover:bg-green-600 transition"
              to={isLoggedIn ? "/OnTap" : "/Login"}
            >
              Ôn tập ngay
            </AppLink>
          </div>
        </div>

        {/* Tham gia vào lớp học */}
        <div className="exam-card">
          <img src={lophoc} alt="Tham gia lớp học" className="exam-image" />
          <div className="exam-info">
            <h3 className="text-xl font-bold">Tham gia vào lớp học</h3>
            <p className="text-gray-600 mt-2">
              Học tập cùng bạn bè, trao đổi kiến thức và nhận hỗ trợ từ giáo
              viên.
            </p>
            <AppLink
              className="ant-btn mt-4 px-6 py-2 bg-purple-500 text-black font-semibold rounded-lg shadow-md hover:bg-purple-600 transition"
              to={isLoggedIn ? "/PhongThi" : "/Login"}
            >
              Tham gia ngay
            </AppLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
