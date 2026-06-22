import React, { useEffect, useState } from "react";
import { Outlet } from "react-router";
import { useDispatch, useSelector } from "react-redux";

import Navber from "../components/Navber/Navber";
import Sidebar from "../components/Sidebar/Sidebar";
import BottomNavbar from "../components/BottomNavbar/BottomNavbar";
import SiteIdentity from "../components/SiteIdentity/SiteIdentity";

import { fetchGlobalClientData } from "../features/global/globalSlice";
import { selectGlobalLoaded } from "../features/global/globalSelectors";

const RootLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const loaded = useSelector(selectGlobalLoaded);

  useEffect(() => {
    if (!loaded) {
      dispatch(fetchGlobalClientData());
    }
  }, [dispatch, loaded]);

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <SiteIdentity />

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
