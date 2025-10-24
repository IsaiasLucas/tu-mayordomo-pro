import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";

export const AppLayout = () => {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
};
