import React, { useState } from "react";
import { Outlet } from "react-router";
import Navber from "../components/Navber/Navber";
import Sidebar from "../components/Sidebar/Sidebar";
import BottomNavbar from "../components/BottomNavbar/BottomNavbar";

const RootLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <Navber setOpen={setSidebarOpen} />

      <main className="min-h-screen pt-[56px] lg:pt-[64px]">
        <Outlet />
      </main>
      <BottomNavbar />
    </div>
  );
};

export default RootLayout;
