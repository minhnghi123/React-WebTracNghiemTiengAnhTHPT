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
import { QuanLyDeThi } from "@/pages/giaovien/QuanLyDeThi";
import { QuanLyDangCauHoi } from "@/pages/admin/QuanLyDangCauHoi";
import { CreateExamQuestion } from "@/pages/giaovien/QuanLyDeThi/DeThi/CreateExamQuestion.tsx";
import { UpdateExamQuestion } from "@/pages/giaovien/QuanLyDeThi/DeThi/UpdateExam";
import { KyThi } from "@/pages/default/KyThi";
import { DetailExam } from "@/pages/default/KyThi/BaiLam/DetailExam";
import { BaiLam } from "@/pages/default/KyThi/BaiLam/BaiLam";
import { KetQua } from "@/pages/default/KyThi/KetQua";
import { QuanLyAudio } from "@/pages/giaovien/QuanLyFileAudio";
import { ForgetPass } from "@/pages/default/Login/forgetPass";
import { FlashCardIndex } from "@/pages/default/OnTap/FlashCardIndex";
import { FlashCardDetail } from "@/pages/default/OnTap/FlashCardDetail";
import { FlashCardCreate } from "@/pages/default/OnTap/FlashCardCreate";
import { FlashCardUpdate } from "@/pages/default/OnTap/FlashCardUpdate";
import { FlashCardExam } from "@/pages/default/OnTap/FlashCardExam";
import {Profile} from "@/pages/default/Profile";
import VerificationTeacher from "@/pages/admin/QuanLyTaiKhoan/verificationTeacher";
import { QuanLyLopHoc } from "@/pages/giaovien/QuanLyLopHoc";
import DetailClass from "@/pages/giaovien/QuanLyLopHoc/detailClass";
import QuanLyDeThiIndex from "@/pages/giaovien/QuanLyDeThi/indexDeThi";
import { ClassroomDetail } from "@/pages/default/PhongThi/detailclass";

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
      createRoute("/PhongThi/Detail/:classroomId", <ClassroomDetail />, ERolePath.USER),
      createRoute("/OnTap", <FlashCardIndex />, ERolePath.USER),
      createRoute("/FlashCard/:_id", <FlashCardDetail />, ERolePath.USER),
      createRoute("/KyThi", <KyThi />, ERolePath.USER),
      createRoute("/KyThi/ChiTiet/:_id", <DetailExam />, ERolePath.USER),
      createRoute("/KyThi/BaiLam/:_id", <BaiLam />, ERolePath.USER),
      createRoute("/KetQua", <KetQua />, ERolePath.USER), 
      createRoute("/profile", <Profile />, ERolePath.USER),
      createRoute("/flashcard/create", <FlashCardCreate />, ERolePath.USER),
      createRoute("/flashcard/edit/:_id", <FlashCardUpdate />, ERolePath.USER),
      createRoute("/flashcard/exam/:id", <FlashCardExam />, ERolePath.USER),
    ],
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      createRoute("/Login", <Login />, ERolePath.USER),
      createRoute("/SignUp", <SignUp />, ERolePath.USER),
      createRoute("/forgetPassword", <ForgetPass />, ERolePath.USER),
    ],
  },
  {
    path: "/",
    element: <LayoutGiaoVien />,
    children: [
      createRoute("/GiaoVien", <DashBoardGiaoVien />, ERolePath.USER),
      createRoute("/giaovien/NganHangCauHoi", <QuanLyCauHoi />, ERolePath.USER),
      createRoute("/giaovien/QuanLyDeThi", <QuanLyDeThiIndex />, ERolePath.USER),
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
      createRoute("/giaovien/QuanLyLopHoc/:_classroom_id", <DetailClass />, ERolePath.USER),
      createRoute("/giaovien/QuanLyLopHoc", <QuanLyLopHoc />, ERolePath.USER),
      createRoute("/giaovien/QuanLyAudio", <QuanLyAudio />, ERolePath.USER),
    ],
  },
  {
    path: "/",
    element: <LayoutAdmin />,
    children: [
      createRoute("/Admin", <DashBoarAdmin />, ERolePath.USER),
      createRoute("/Admin/DangCauHoi", <QuanLyDangCauHoi />, ERolePath.USER),
      createRoute("/Admin/QuanLyTaiKhoan", <VerificationTeacher />, ERolePath.USER),
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

const paths = {
  "/": ["/"],
  "/About": ["/About"],
  "/Contact": ["/Contact"],
  "/Login": ["/Login"],
  "/forgetPassword": ["/forgetPassword"],
  "/SignUp": ["/SignUp"],
  "/PhongThi": ["/PhongThi"],
  "/PhongThi/Detail/:classroomId": ["/PhongThi/Detail/:classroomId"],
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
  "/FlashCard/:_id": ["/FlashCard/:_id"],
  "/flashcard/create": ["/flashcard/create"],
  "/flashcard/edit/:_id": ["/flashcard/edit/:_id"],
  "/flashcard/exam/:id": ["/flashcard/exam/:id"],
  "/profile": ["/profile"],
  "/Admin/QuanLyTaiKhoan": ["/Admin/QuanLyTaiKhoan"],
  "/giaovien/QuanLyLopHoc": ["/giaovien/QuanLyLopHoc"],
  "/giaovien/QuanLyLopHoc/:_classroom_id": ["/giaovien/QuanLyLopHoc/:_classroom_id"],

} as const;

export type TRoutePaths = (typeof paths)[keyof typeof paths][number] &
  LinkProps["to"];
