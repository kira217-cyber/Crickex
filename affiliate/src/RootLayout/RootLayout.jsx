import React from "react";
import { Outlet } from "react-router";
import Navber from "../components/Navber/Navber";
import Footer from "../components/Footer/Footer";

const BG_URL =
  "https://crickexpartner.com/wp-content/uploads/2025/10/BG-1917x1080-3.jpg";

const RootLayout = () => {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: `url(${BG_URL})` }}
    >
      <Navber />

      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;
