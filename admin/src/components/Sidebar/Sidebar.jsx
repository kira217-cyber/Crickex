import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import {
  FaHome,
  FaBell,
  FaSignOutAlt,
  FaSearch,
  FaUsers,
  FaUserCircle,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaGamepad,
  FaWallet,
  FaMoneyBillWave,
} from "react-icons/fa";
import { GrUserAdmin } from "react-icons/gr";
import { RxHamburgerMenu } from "react-icons/rx";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import { selectAdmin } from "../../features/auth/authSelectors";


const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const admin = useSelector(selectAdmin);

  const [open, setOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  const adminRole = admin?.role === "mother" ? "mother" : "sub";
  const permissions = Array.isArray(admin?.permissions)
    ? admin.permissions
    : [];
  const isMother = adminRole === "mother";

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
      if (desktop) setOpen(false);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const canAccess = (key) => {
    if (isMother) return true;
    return permissions.includes(key);
  };

  const menuItems = useMemo(
    () => [
      {
        key: "dashboard",
        to: "/",
        icon: <FaHome />,
        text: "Dashboard",
        end: true,
      },
      {
        key: "__mother__",
        to: "/create-admin",
        icon: <GrUserAdmin />,
        text: "Create Admin",
      },
    ],
    [],
  );

  const walletItems = useMemo(
    () => [
      {
        key: "deposit",
        to: "/deposit",
        icon: <FaWallet />,
        text: "Deposit",
      },
      {
        key: "withdraw",
        to: "/withdraw",
        icon: <FaMoneyBillWave />,
        text: "Withdraw",
      },
    ],
    [],
  );

  const visibleMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (item.key === "__mother__") return isMother;
      return canAccess(item.key);
    });
  }, [menuItems, isMother, permissions]);

  const visibleWalletItems = useMemo(
    () => walletItems.filter((item) => canAccess(item.key)),
    [walletItems, permissions, isMother],
  );

  const showWallet = visibleWalletItems.length > 0;

  useEffect(() => {
    if (!showWallet) setWalletOpen(false);
  }, [showWallet]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-[#050607] text-white">
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#03111f] via-[#1A79D3] to-[#0d5fa8] px-4 py-3 flex items-center justify-between shadow-lg shadow-[#1A79D3]/30 border-b border-[#1A79D3]/20">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-white/15 transition-colors cursor-pointer"
        >
          <RxHamburgerMenu className="text-2xl text-white" />
        </button>

        <h2 className="text-lg font-black">Crickex Admin</h2>

        <NavLink to="/profile">
          <FaUserCircle className="text-2xl text-white hover:text-blue-100 transition-colors cursor-pointer" />
        </NavLink>
      </div>

      {open && !isDesktop && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        <motion.aside
          initial={false}
          animate={{ x: open || isDesktop ? 0 : "-100%" }}
          transition={{ type: "spring", damping: 24, stiffness: 190 }}
          className="fixed md:static top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-[#050607] via-[#06182a] to-[#050607] border-r border-[#1A79D3]/20 shadow-2xl shadow-black/60 flex flex-col overflow-hidden"
        >
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-[#1A79D3]/20 bg-gradient-to-r from-black/80 via-[#1A79D3]/20 to-black/80 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] flex items-center justify-center shadow-lg shadow-[#1A79D3]/40">
                  <span className="text-white font-black text-3xl">C</span>
                </div>

                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    CRICKEX
                  </h2>
                  <p className="text-sm text-blue-100/80 font-medium">
                    {isMother ? "Mother Panel" : "Sub Admin Panel"}
                  </p>
                </div>
              </div>
            </div>

            {!isDesktop && (
              <button
                onClick={() => setOpen(false)}
                className="absolute top-5 right-5 p-2.5 rounded-xl hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <FaTimes size={22} />
              </button>
            )}

            <nav className="flex-1 px-3 py-6 overflow-y-auto [scrollbar-width:none]">
              {visibleMenuItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-5 py-3.5 rounded-xl mb-1.5 text-base font-semibold transition-all duration-200 group ${
                      isActive
                        ? "bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] text-white shadow-lg shadow-[#1A79D3]/30"
                        : "text-slate-200 hover:bg-[#1A79D3]/15 hover:text-white"
                    }`
                  }
                >
                  <span className="text-2xl opacity-90 group-hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </span>
                  <span>{item.text}</span>
                </NavLink>
              ))}

              {showWallet && (
                <DropdownSection
                  title="Wallet"
                  icon={<FaWallet />}
                  open={walletOpen}
                  setOpen={setWalletOpen}
                  items={visibleWalletItems}
                  onClose={() => setOpen(false)}
                />
              )}
            </nav>

            <div className="p-5 border-t border-[#1A79D3]/20 mt-auto shrink-0">
              <button
                onClick={handleLogout}
                className="w-full cursor-pointer flex items-center justify-center gap-3 py-3.5 px-5 bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] rounded-xl text-white font-black transition-all duration-300 shadow-lg shadow-[#1A79D3]/30 border border-[#1A79D3]/30 hover:scale-[1.01]"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>
        </motion.aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="hidden md:flex items-center justify-between px-6 lg:px-10 py-5 border-b border-[#1A79D3]/20 bg-gradient-to-r from-black/80 via-[#1A79D3]/15 to-black/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3ea0ff] text-lg" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-12 pr-5 py-3 bg-black/40 border border-[#1A79D3]/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-[#1A79D3]/70 focus:ring-2 focus:ring-[#1A79D3]/20 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button className="relative p-2.5 hover:bg-[#1A79D3]/15 rounded-xl transition-colors cursor-pointer">
                <FaBell className="text-xl text-[#3ea0ff]" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-red-300/60"></span>
              </button>

              <NavLink
                to="/profile"
                className="p-1 hover:bg-[#1A79D3]/15 rounded-full transition-colors"
              >
                <FaUserCircle className="text-3xl text-[#3ea0ff]" />
              </NavLink>
            </div>
          </div>

          <main className="flex-1 overflow-y-auto [scrollbar-width:none] bg-[radial-gradient(circle_at_top_left,rgba(26,121,211,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(26,121,211,0.12),transparent_40%),linear-gradient(135deg,#050607,#07131f,#050607)]">
            <div className="mt-16 md:mt-0 p-4 lg:p-6 text-white">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

const DropdownSection = ({ title, icon, open, setOpen, items, onClose }) => {
  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl text-slate-200 hover:bg-[#1A79D3]/15 hover:text-white transition-all duration-200 cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <span className="text-2xl">{icon}</span>
          <span className="font-semibold">{title}</span>
        </div>

        {open ? <FaChevronUp size={18} /> : <FaChevronDown size={18} />}
      </button>

      {open && (
        <div className="mt-2 pl-10 space-y-1">
          {items.map((sub) => (
            <NavLink
              key={sub.to}
              to={sub.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] text-white font-bold shadow-md shadow-[#1A79D3]/30"
                    : "text-slate-300 hover:text-white hover:bg-[#1A79D3]/15"
                }`
              }
            >
              <span className="text-xl opacity-90">{sub.icon}</span>
              <span>{sub.text}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
