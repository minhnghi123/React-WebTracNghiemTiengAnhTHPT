import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Outlet } from "react-router-dom";
import "./Layout.css";
const Layout = () => {
  return (
    <div id="main">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default Layout;
