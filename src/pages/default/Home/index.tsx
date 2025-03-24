import "bootstrap/dist/css/bootstrap.min.css";
import "./reponsive.css";
import { useState, useEffect } from "react";

const Home = () => {
  const slides = [
    {
      image: "/src/assets/img/giaodien.jpg",
      title: "Ôn Thi Trắc Nghiệm Tiếng Anh",
      desc: "Nền tảng luyện tập và nâng cao kỹ năng làm bài thi hiệu quả",
    },
    {
      image: "/src/assets/img/ontap.jpg",
      title: "Kho Đề Thi Đa Dạng",
      desc: "Cập nhật đề thi mới nhất, sát với đề thi THPT quốc gia",
    },
    {
      image: "/src/assets/img/maytinhbang.png",
      title: "Theo Dõi Tiến Trình Học Tập",
      desc: "Thống kê kết quả học tập, giúp bạn cải thiện từng ngày",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  // Auto slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 4000); // 4s auto slide
    return () => clearInterval(interval); // Clear interval khi component unmount
  }, [slides.length]);

  return (
    <div className="container my-5">
      <div className="slider relative mb-10">
        <img
          src={slides[currentIndex].image}
          alt="Slide"
          className="slider-image"
        />
        <div className="slider-overlay">
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
      
    </div>
  );
};

export default Home;
