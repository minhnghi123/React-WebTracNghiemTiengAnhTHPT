import { ReactNode } from "react";
import { LinkProps } from "react-router-dom";

import {
  ProtectedRouteAdmin,
  ProtectedRouteUser,
} from "@/components/ProtectedRoute";
import Layout from "@/pages/default/Layout";
import Home from "@/pages/default/Home";
import { Login } from "@/pages/default/Login";
import { SignUp } from "@/pages/default/Login/SignUp";
import { VeChungToi } from "@/pages/default/VeChungToi";
import { LienHe } from "@/pages/default/LienHe";
import { PhongThi } from "@/pages/default/PhongThi";
import LayoutGiaoVien from "@/pages/giaovien/LayoutGiaoVien";
import { DashBoardGiaoVien } from "@/pages/giaovien/DashBoard";
import { QuanLyCauHoi } from "@/pages/giaovien/QuanLyCauHoi";
import LayoutAdmin from "@/pages/admin/DashBoard/LayoutAdmin";
import { DashBoarAdmin } from "@/pages/admin/DashBoard";
import NotFound from "@/pages/NotFound";
import { OnTap } from "@/pages/default/OnTap";
import { QuanLyDeThi } from "@/pages/giaovien/QuanLyDeThi";
import { QuanLyDangCauHoi } from "@/pages/admin/QuanLyDangCauHoi";
import { CreateExamQuestion } from "@/pages/giaovien/QuanLyDeThi/DeThi/CreateExamQuestion.tsx";
import { UpdateExamQuestion } from "@/pages/giaovien/QuanLyDeThi/DeThi/UpdateExam";
import { KyThi } from "@/pages/default/KyThi";
import { DetailExam } from "@/pages/default/KyThi/BaiLam/DetailExam";
import { BaiLam } from "@/pages/default/KyThi/BaiLam/BaiLam";
import { KetQua } from "@/pages/default/KyThi/KetQua";
import { QuanLyAudio } from "@/pages/giaovien/QuanLyFileAudio";

export enum ERolePath {
  ADMIN = 2,
  GIAOVIEN = 3,
  USER = 1,
  STUDENT = 0,
}

// const isCorrectPath = (path: string) => {
//   if (!path.startsWith("/")) return false;
//   return true;
// };

export const createRoute = (
  path: TRoutePaths,
  element: ReactNode,
  roleAccess?: number
) => {
  if (roleAccess) {
    const Wrapper = roleAccess === 1 ? ProtectedRouteUser : ProtectedRouteAdmin;
    element = <Wrapper>{element}</Wrapper>;
  }

  return {
    path,
    element,
  };
};

export const router = [
  {
    path: "/",
    element: <Layout />,
    children: [
      createRoute("/", <Home />, ERolePath.USER),
      createRoute("/About", <VeChungToi />, ERolePath.USER),
      createRoute("/Contact", <LienHe />, ERolePath.USER),
      createRoute("/PhongThi", <PhongThi />, ERolePath.USER),
      createRoute("/OnTap", <OnTap />, ERolePath.USER),
      createRoute("/KyThi", <KyThi />, ERolePath.USER),
      createRoute("/KyThi/ChiTiet/:_id", <DetailExam />, ERolePath.USER),
      createRoute("/KyThi/BaiLam/:_id", <BaiLam />, ERolePath.USER),
      createRoute("/KetQua", <KetQua />, ERolePath.USER),
    ],
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      createRoute("/Login", <Login />, ERolePath.USER),
      createRoute("/SignUp", <SignUp />, ERolePath.USER),
    ],
  },
  {
    path: "/",
    element: <LayoutGiaoVien />,
    children: [
      createRoute("/GiaoVien", <DashBoardGiaoVien />, ERolePath.USER),
      createRoute("/giaovien/NganHangCauHoi", <QuanLyCauHoi />, ERolePath.USER),
      createRoute("/giaovien/QuanLyDeThi", <QuanLyDeThi />, ERolePath.USER),
      createRoute(
        "/giaovien/QuanLyDeThi/CreateExam",
        <CreateExamQuestion />,
        ERolePath.USER
      ),
      createRoute(
        "/giaovien/QuanLyDeThi/UpdateExam/:_id",
        <UpdateExamQuestion />,
        ERolePath.USER
      ),
      createRoute("/giaovien/QuanLyAudio", <QuanLyAudio />, ERolePath.USER),
    ],
  },
  {
    path: "/",
    element: <LayoutAdmin />,
    children: [
      createRoute("/Admin", <DashBoarAdmin />, ERolePath.USER),
      createRoute("/Admin/DangCauHoi", <QuanLyDangCauHoi />, ERolePath.USER),
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

const paths = {
  "/": ["/"],
  "/profile": ["/profile/:id", "/profile/:id/edit"],
  "/About": ["/About"],
  "/Contact": ["/Contact"],
  "/Login": ["/Login"],
  "/SignUp": ["/SignUp"],
  "/PhongThi": ["/PhongThi"],
  "/GiaoVien": ["/GiaoVien"],
  "/NganHangCauHoi": ["/NganHangCauHoi"],
  "/giaovien/NganHangCauHoi": ["/giaovien/NganHangCauHoi"],
  "/Admin": ["/Admin"],
  "/OnTap": ["/OnTap"],
  "/giaovien/QuanLyDeThi": ["/giaovien/QuanLyDeThi"],
  "/Admin/DangCauHoi": ["/Admin/DangCauHoi"],
  "/giaovien/QuanLyDeThi/CreateExam": ["/giaovien/QuanLyDeThi/CreateExam"],
  "/giaovien/QuanLyDeThi/UpdateExam/:_id": [
    "/giaovien/QuanLyDeThi/UpdateExam/:_id",
  ],
  "/KyThi/ChiTiet/:_id": ["/KyThi/ChiTiet/:_id"],
  "/KyThi": ["/KyThi"],
  "/KyThi/BaiLam/:_id": ["/KyThi/BaiLam/:_id"],
  "/KetQua": ["/KetQua"],
  "/giaovien/QuanLyAudio": ["/giaovien/QuanLyAudio"],
} as const;

export type TRoutePaths = (typeof paths)[keyof typeof paths][number] &
  LinkProps["to"];
