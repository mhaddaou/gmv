import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LayoutProvider, LayoutSplashScreen } from "../_gmbbuilder/layout/core";
import { MasterInit } from "../_gmbbuilder/layout/MasterInit";
import { AuthInit } from "./modules/auth";

const App = () => {
  return (
    <Suspense fallback={<LayoutSplashScreen />}>
      <LayoutProvider>
        <AuthInit>
          <Outlet />
          <MasterInit />
          <ToastContainer />
        </AuthInit>
      </LayoutProvider>
    </Suspense>
  );
};

export { App };

