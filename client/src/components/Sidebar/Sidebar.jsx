import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "../../Context/LanguageProvider";
import SidebarItem from "./SidebarItem";
import { topMenus, gameMenus, otherMenus } from "./sidebarData";

const Sidebar = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  const [desktopOpen, setDesktopOpen] = useState(false);
  const [activeKey, setActiveKey] = useState("home");
  const [desktopExpandedKey, setDesktopExpandedKey] = useState("");
  const [mobilePanel, setMobilePanel] = useState(null);

  const label = (item) => (isBangla ? item.bn : item.en);

  const childLabel = (child) => {
    if (typeof child.name === "string") return child.name;
    return isBangla
      ? child?.name?.bn || child?.name?.en
      : child?.name?.en || child?.name?.bn;
  };

  const closeMobile = () => {
    setOpen(false);
    setMobilePanel(null);
  };

  const handleItem = (item, mode) => {
    setActiveKey(item.key);

    if (item.children) {
      if (mode === "desktop") {
        if (!desktopOpen) {
          setDesktopOpen(true);
          setDesktopExpandedKey(item.key);
          return;
        }

        setDesktopExpandedKey((prev) => (prev === item.key ? "" : item.key));
      } else {
        setMobilePanel(item);
      }
      return;
    }

    closeMobile();
    navigate(item.path || "/");
  };

  const allDesktopMenus = [
    topMenus.find((item) => item.key === "home"),
    gameMenus.find((item) => item.key === "hot"),
    ...gameMenus.filter((item) => item.key !== "hot"),
    ...topMenus.filter((item) => item.key !== "home"),
    ...otherMenus,
  ].filter(Boolean);

  return (
    <>
      <div
        onClick={closeMobile}
        className={`fixed inset-0 z-40 bg-black/60 transition-all duration-300 ease-in-out lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      />

      {/* Desktop Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 hidden h-screen bg-[#0b66a8] shadow-xl transition-all duration-300 ease-in-out lg:block ${
          desktopOpen ? "w-[250px]" : "w-[57px]"
        }`}
      >
        {desktopOpen && (
          <button
            type="button"
            onClick={() => setDesktopOpen(false)}
            className="absolute -right-[18px] top-3 z-50 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#075893] text-white shadow-lg transition hover:scale-105"
          >
            <ChevronLeft size={23} />
          </button>
        )}

        {!desktopOpen && (
          <button
            type="button"
            onClick={() => setDesktopOpen(true)}
            className="flex h-[52px] w-full cursor-pointer items-center justify-center transition hover:bg-[#1979c9]"
          >
            <span className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#075893] text-white shadow">
              <ChevronRight size={22} />
            </span>
          </button>
        )}

        <div className="h-full overflow-y-auto overflow-x-hidden sidebar-scroll">
          {allDesktopMenus.map((item) => {
            const Icon = item.icon;
            const expanded = desktopExpandedKey === item.key;
            const active = activeKey === item.key;

            if (!desktopOpen) {
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleItem(item, "desktop")}
                  className={`flex h-[52px] w-full cursor-pointer items-center justify-center transition-all duration-200 ease-in-out ${
                    active
                      ? "bg-[#37a2ff] shadow-[inset_4px_0_0_0_#ffffff]"
                      : "hover:bg-[#1979c9]"
                  }`}
                >
                  <span
                    className={`flex h-[32px] w-[32px] items-center justify-center rounded-full text-white transition ${
                      active ? "bg-[#005fff]" : "bg-[#075893]"
                    }`}
                  >
                    <Icon size={19} />
                  </span>
                </button>
              );
            }

            return (
              <div key={item.key}>
                <SidebarItem
                  item={item}
                  label={label(item)}
                  active={active}
                  expanded={expanded}
                  desktop
                  onClick={() => handleItem(item, "desktop")}
                />

                <AnimatePresence>
                  {item.children && expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden bg-[#f4f4f4]"
                    >
                      {item.children.map((child, index) => (
                        <button
                          key={child.id || index}
                          type="button"
                          onClick={() => {
                            setActiveKey(item.key);
                            navigate(child.path);
                          }}
                          className="flex h-[46px] w-full cursor-pointer items-center gap-3 border-b border-[#d8d8d8] px-9 text-left transition hover:bg-white"
                        >
                          {child.image ? (
                            <img
                              src={child.image}
                              alt={childLabel(child)}
                              className="h-6 w-6 shrink-0 object-contain"
                            />
                          ) : (
                            <span className="text-xl">{child.icon}</span>
                          )}

                          <span className="text-[14px] font-medium text-[#111]">
                            {childLabel(child)}
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-[194px] transform bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full overflow-y-auto overflow-x-hidden pb-5 pt-3 sidebar-scroll">
          <MenuGroup
            items={topMenus}
            label={label}
            activeKey={activeKey}
            onItem={(item) => handleItem(item, "mobile")}
          />

          <SectionTitle title="Games" />

          <MenuGroup
            items={gameMenus}
            label={label}
            activeKey={activeKey}
            onItem={(item) => handleItem(item, "mobile")}
          />

          <SectionTitle title="Others" />

          <MenuGroup
            items={otherMenus}
            label={label}
            activeKey={activeKey}
            onItem={(item) => handleItem(item, "mobile")}
          />
        </div>
      </aside>

      {/* Mobile Right Panel */}
      <AnimatePresence>
        {open && mobilePanel?.children?.length > 0 && (
          <motion.aside
            initial={{ x: 194, opacity: 0 }}
            animate={{ x: 194, opacity: 1 }}
            exit={{ x: 194, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed left-0 top-0 z-[51] h-screen w-[108px] border-l border-[#d9d9d9] bg-[#f5f5f5] shadow-xl lg:hidden"
          >
            <div className="h-full overflow-y-auto sidebar-scroll">
              {mobilePanel.children.map((child, index) => (
                <button
                  key={child.id || index}
                  type="button"
                  onClick={() => {
                    closeMobile();
                    navigate(child.path);
                  }}
                  className="flex h-[100px] w-full cursor-pointer flex-col items-center justify-center border-b border-[#d9d9d9] text-center transition hover:bg-white"
                >
                  {child.image ? (
                    <img
                      src={child.image}
                      alt={childLabel(child)}
                      className="h-[44px] w-[44px] object-contain"
                    />
                  ) : (
                    <span className="text-[32px] leading-none">
                      {child.icon}
                    </span>
                  )}

                  <span className="mt-2 text-[14px] font-medium uppercase text-[#222]">
                    {childLabel(child)}
                  </span>
                </button>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

const MenuGroup = ({ items, label, activeKey, onItem }) => (
  <>
    {items.map((item) => (
      <SidebarItem
        key={item.key}
        item={item}
        label={label(item)}
        active={activeKey === item.key}
        expanded={false}
        onClick={() => onItem(item)}
      />
    ))}
  </>
);

const SectionTitle = ({ title }) => (
  <div className="mx-3 my-3 border-t border-[#d9e6f2] pt-4 text-[15px] font-bold text-[#111]">
    {title}
  </div>
);

export default Sidebar;
