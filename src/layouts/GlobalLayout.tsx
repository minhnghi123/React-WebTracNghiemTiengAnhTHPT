import React, { useEffect } from "react";
import { Modal } from "antd";
import { io } from "socket.io-client";
import { useAuthContext } from "@/contexts/AuthProvider";

const socket = io(import.meta.env.VITE_API_URL_PROD);

const GlobalLayout: React.FC = ({ children }) => {
  const { user } = useAuthContext();
  useEffect(() => {
    socket.on("TEACHER_RESPONSE_SUCCESS", (data) => {
      if (data.userId === user?._id) {
        Modal.success({
          title: "Phản hồi từ giáo viên",
          content: data.message,
        });
      }
    });

    return () => {
      socket.off("TEACHER_RESPONSE_SUCCESS");
    };
  }, [user]);

  return <>{children}</>;
};

export default GlobalLayout;
