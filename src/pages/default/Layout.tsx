import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Outlet } from "react-router-dom";
import "./Layout.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { ResultAPI } from "@/services/student";
import { useAuthContext } from "@/contexts/AuthProvider";
import { useState, useEffect } from "react";
import { Result } from "@/types/interface";
import ExamInfoBox from "./ExamInfor";
import { AuthApi } from "@/services/Auth";
import BlockPage, { BlockInfo } from "../BlockPage";

const Layout = () => {
  const { user } = useAuthContext();
  const [examDetails, setExamDetails] = useState<Result | null>(null);

  const getInCompletedExam = async () => {
    try {
      const response = await ResultAPI.getInCompletedExam();
      console.log("getInCompletedExam", response);
      if (response.code === 200 && response.results) {
        setExamDetails(response.results);
      }
    } catch (error) {
      console.error("Error fetching incomplete exam:", error);
    }
  };
  const [blockInfo, setBlockInfo] = useState<BlockInfo | null>(null);
  const getBlockInfo = async () => {
    try {
      const res = await AuthApi.getBlockInfo();
      console.log("getBlockInfo", res);
      setBlockInfo(res);
    } catch (error) {
      console.error("Error fetching block info:", error);
    }
  };

  useEffect(() => {
    if (user?._id) {
      getInCompletedExam();
      getBlockInfo(); 
    }
  }, [user]);

  return (
    <div id="main" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ flex: 1, paddingBottom: "80px" }}>
        {/* Ensure content takes up remaining space and leaves room for the footer */}
        {blockInfo?.isBlocked && new Date(blockInfo.blockedUntil) > new Date() ? (
          <BlockPage info={blockInfo} />
        ) : (
          <Outlet />
        )}
        {examDetails && <ExamInfoBox examDetails={examDetails} />}
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
