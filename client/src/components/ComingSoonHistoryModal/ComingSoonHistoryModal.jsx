import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Clock } from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";
import TransactionTab from "./TransactionTab";
import AutoDepositModalHistory from "../AutoDepositModalHistory/AutoDepositModalHistory";


const ComingSoonHistoryModal = ({
  open,
  onClose,
  activeTab,
  onTabChange,
  title,
  onBackToDeposit,
}) => {
  const { isBangla } = useLanguage();

  const renderBody = () => {
    if (activeTab === "autoDeposit") {
      return (
        <AutoDepositModalHistory
          onBackToDeposit={() => {
            onClose?.();
            onBackToDeposit?.();
          }}
        />
      );
    }

    return (
      <div className="flex flex-1 items-center justify-center bg-[#f3f7fb] px-5">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#eaf4ff] text-[#0865a9]">
            <Clock size={42} />
          </div>

          <h3 className="mt-5 text-[24px] font-bold text-[#0865a9]">
            {isBangla ? "শীঘ্রই আসছে" : "Coming Soon"}
          </h3>

          <p className="mx-auto mt-2 max-w-[280px] text-[14px] leading-6 text-[#666]">
            {isBangla
              ? "এই হিস্টোরি সার্ভিস খুব শীঘ্রই চালু হবে।"
              : "This history service will be available soon."}
          </p>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/45 px-0 backdrop-blur-[3px] sm:px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative flex h-screen w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-[700px] sm:max-w-[430px] sm:rounded-[8px]"
          >
            <div className="relative flex h-[50px] shrink-0 items-center justify-center bg-[#0865a9] text-white">
              <h2 className="text-[18px] font-semibold">{title}</h2>

              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center text-white"
              >
                <X size={24} />
              </button>
            </div>

            <TransactionTab activeTab={activeTab} onChange={onTabChange} />

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {renderBody()}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ComingSoonHistoryModal;
