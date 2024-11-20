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

export enum ERolePath {
  ADMIN = 2,
  GIAOVIEN = 3,
  USER = 1,
  GUEST = 0,
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
    children: [createRoute("/", <Home />, ERolePath.USER)],
  },
  {
    path: "/",
    children: [
      createRoute("/Login", <Login />, ERolePath.USER),
      createRoute("/SignUp", <SignUp />, ERolePath.USER),
    ],
  },
];

const paths = {
  "/": ["/"],
  "/profile": ["/profile/:id", "/profile/:id/edit"],
  "/about": ["/about"],
  "/contact": ["/contact"],
  "/Login": ["/Login"],
  "/SignUp": ["/SignUp"],
} as const;

export type TRoutePaths = (typeof paths)[keyof typeof paths][number] &
  LinkProps["to"];
