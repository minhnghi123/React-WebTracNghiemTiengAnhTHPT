import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="mx-auto min-h-screen px-5 pt-2 desktop:max-w-[1512px]">
      <Navbar />

      <div className="flex-1 pb-[155px] pt-[45px]">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
