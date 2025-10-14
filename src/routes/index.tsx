import { ReactNode } from "react";
import { LinkProps } from "react-router-dom";

import {
  ProtectedRouteAdmin,
  ProtectedRouteUser,
  ProtectedRouteTeacher,
} from "@/components/ProtectedRoute";
import Layout from "@/pages/default/Layout";
import Home from "@/pages/default/Home";
// import { Login } from "@/pages/default/Login";
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
import { QuanLyDangCauHoi } from "@/pages/admin/QuanLyDangCauHoi";
import { UpdateExamQuestion } from "@/pages/giaovien/QuanLyDeThi/DeThi/UpdateExam";
import { KyThi } from "@/pages/default/KyThi";
import { DetailExam } from "@/pages/default/KyThi/BaiLam/DetailExam";
import { KetQua } from "@/pages/default/KyThi/KetQua";
import { QuanLyAudio } from "@/pages/giaovien/QuanLyFileAudio";
import { ForgetPass } from "@/pages/default/Login/forgetPass";
import { FlashCardIndex } from "@/pages/default/OnTap/FlashCardIndex";
import { FlashCardDetail } from "@/pages/default/OnTap/FlashCardDetail";
import { FlashCardCreate } from "@/pages/default/OnTap/FlashCardCreate";
import { FlashCardUpdate } from "@/pages/default/OnTap/FlashCardUpdate";
import { FlashCardExam } from "@/pages/default/OnTap/FlashCardExam";
import { Profile } from "@/pages/default/Profile";
import VerificationTeacher from "@/pages/admin/QuanLyTaiKhoan/verificationTeacher";
import { QuanLyLopHoc } from "@/pages/giaovien/QuanLyLopHoc";
import DetailClass from "@/pages/giaovien/QuanLyLopHoc/detailClass";
import QuanLyDeThiIndex from "@/pages/giaovien/QuanLyDeThi/indexDeThi";
import { ClassroomDetail } from "@/pages/default/PhongThi/detailclass";
import { CreateExamQuestion } from "@/pages/giaovien/QuanLyDeThi/DeThi/CreateExamQuestion.tsx";
import BaiLam from "@/pages/default/KyThi/BaiLam/BaiLam";
import QuanLyBaoLoi from "@/pages/giaovien/QuanLyBaoLoi/index.tsx";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { LoginWithSteps } from "@/pages/default/Login/login";
import { LichSuLamBai } from "@/pages/default/KyThi/LichSu";
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

// --------RECAPCHA--------
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
// --------RECAPCHA--------

export const createRoute = (
  path: TRoutePaths,
  element: ReactNode,
  roleAccess?: number
) => {
  if (roleAccess) {
    const Wrapper =
      roleAccess === 2
        ? ProtectedRouteAdmin
        : roleAccess === 3
        ? ProtectedRouteTeacher
        : ProtectedRouteUser;
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
      createRoute(
        "/PhongThi/Detail/:classroomId",
        <ClassroomDetail />,
        ERolePath.USER
      ),
      createRoute("/OnTap", <FlashCardIndex />, ERolePath.USER),
      createRoute("/FlashCard/:_id", <FlashCardDetail />, ERolePath.USER),
      createRoute("/KyThi", <KyThi />, ERolePath.USER),
      createRoute("/KyThi/ChiTiet/:_id", <DetailExam />, ERolePath.USER),
      createRoute("/KyThi/BaiLam/", <BaiLam />, ERolePath.USER),
      createRoute("/KetQua", <KetQua />, ERolePath.USER),
      createRoute("/profile", <Profile />, ERolePath.USER),
      createRoute("/flashcard/create", <FlashCardCreate />, ERolePath.USER),
      createRoute("/flashcard/edit/:_id", <FlashCardUpdate />, ERolePath.USER),
      createRoute("/flashcard/exam/:id", <FlashCardExam />, ERolePath.USER),
      createRoute("/KyThi/LichSu/:examId", <LichSuLamBai />, ERolePath.USER),
    ],
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      createRoute(
        "/Login",
        <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY}>
          <LoginWithSteps />
        </GoogleReCaptchaProvider>,
        ERolePath.USER
      ),
      createRoute("/SignUp", <SignUp />, ERolePath.USER),
      createRoute("/forgetPass", <ForgetPass />, ERolePath.USER),
    ],
  },
  {
    path: "/",
    element: <LayoutGiaoVien />,
    children: [
      createRoute("/GiaoVien", <DashBoardGiaoVien />, ERolePath.GIAOVIEN),
      createRoute(
        "/giaovien/NganHangCauHoi",
        <QuanLyCauHoi />,
        ERolePath.GIAOVIEN
      ),
      createRoute(
        "/giaovien/QuanLyDeThi",
        <QuanLyDeThiIndex />,
        ERolePath.GIAOVIEN
      ),
      createRoute(
        "/giaovien/QuanLyDeThi/CreateExam",
        <CreateExamQuestion />,
        ERolePath.GIAOVIEN
      ),
      createRoute(
        "/giaovien/QuanLyDeThi/UpdateExam/:_id",
        <UpdateExamQuestion />,
        ERolePath.GIAOVIEN
      ),
      createRoute(
        "/giaovien/QuanLyLopHoc/:_classroom_id",
        <DetailClass />,
        ERolePath.GIAOVIEN
      ),
      createRoute(
        "/giaovien/QuanLyLopHoc",
        <QuanLyLopHoc />,
        ERolePath.GIAOVIEN
      ),
      createRoute("/giaovien/QuanLyAudio", <QuanLyAudio />, ERolePath.GIAOVIEN),
      createRoute(
        "/GiaoVien/QuanLyBaoLoi",
        <QuanLyBaoLoi />,
        ERolePath.GIAOVIEN
      ),
    ],
  },
  {
    path: "/",
    element: <LayoutAdmin />,
    children: [
      createRoute("/Admin", <DashBoarAdmin />, ERolePath.ADMIN),
      createRoute("/Admin/DangCauHoi", <QuanLyDangCauHoi />, ERolePath.ADMIN),
      createRoute(
        "/Admin/QuanLyTaiKhoan",
        <VerificationTeacher />,
        ERolePath.ADMIN
      ),
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
  "/forgetPass": ["/forgetPass"],
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
  "GiaoVien/QuanLyBaoLoi": ["/GiaoVien/QuanLyBaoLoi"],
  "/KyThi/ChiTiet/:_id": ["/KyThi/ChiTiet/:_id"],
  "/KyThi": ["/KyThi"],
  "/KyThi/BaiLam/": ["/KyThi/BaiLam/"],
  "/KyThi/LichSu/:examId": ["/KyThi/LichSu/:examId"],
  "/KetQua": ["/KetQua"],
  "/giaovien/QuanLyAudio": ["/giaovien/QuanLyAudio"],
  "/FlashCard/:_id": ["/FlashCard/:_id"],
  "/flashcard/create": ["/flashcard/create"],
  "/flashcard/edit/:_id": ["/flashcard/edit/:_id"],
  "/flashcard/exam/:id": ["/flashcard/exam/:id"],
  "/profile": ["/profile"],
  "/Admin/QuanLyTaiKhoan": ["/Admin/QuanLyTaiKhoan"],
  "/giaovien/QuanLyLopHoc": ["/giaovien/QuanLyLopHoc"],
  "/giaovien/QuanLyLopHoc/:_classroom_id": [
    "/giaovien/QuanLyLopHoc/:_classroom_id",
  ],
} as const;

export type TRoutePaths = (typeof paths)[keyof typeof paths][number] &
  LinkProps["to"];
