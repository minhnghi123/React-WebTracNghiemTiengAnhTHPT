import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export const ProtectedRouteAdmin: React.FC<ProtectedRouteProps> = ({
  children,
}) => {
  const location = useLocation();
  useEffect(() => {
    ;
  }, [location]);

  return children;
};

export const ProtectedRouteUser: React.FC<ProtectedRouteProps> = ({
  children,
}) => {
  const location = useLocation();
  useEffect(() => {
    ;
  }, [location]);

  return children;
};
