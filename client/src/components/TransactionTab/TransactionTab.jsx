import React from "react";
import {
  Wallet,
  BanknoteArrowDown,
  Gamepad2,
  Landmark,
  RotateCcw,
} from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";

const TransactionTab = ({ activeTab = "deposit", onChange }) => {
  const { isBangla } = useLanguage();

  const tabs = [
    {
      key: "withdraw",
      label: isBangla ? "উইথড্র হিস্টোরি" : "Withdraw History",
      icon: <BanknoteArrowDown size={16} />,
    },
    {
      key: "bet",
      label: isBangla ? "বেট হিস্টোরি" : "Bet History",
      icon: <Gamepad2 size={16} />,
    },
    {
      key: "deposit",
      label: isBangla ? "ডিপোজিট হিস্টোরি" : "Deposit History",
      icon: <Wallet size={16} />,
    },
    {
      key: "autoDeposit",
      label: isBangla ? "অটো ডিপোজিট হিস্টোরি" : "Auto Deposit History",
      icon: <Landmark size={16} />,
    },
    {
      key: "turnover",
      label: isBangla ? "টার্নওভার হিস্টোরি" : "Turnover History",
      icon: <RotateCcw size={16} />,
    },
  ];

  return (
    <div className="shrink-0 border-b border-white/10 bg-[#0865a9] px-3 pb-3">
      <div className="overflow-x-auto [scrollbar-width:none]">
        <div className="flex min-w-max items-center gap-2">
          {tabs.map((tab) => {
            const active = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onChange?.(tab.key)}
                className={`flex h-[36px] cursor-pointer items-center gap-2 rounded-[4px] px-3 text-[12px] font-bold transition ${
                  active
                    ? "bg-[#2e9bf3] text-white shadow-sm"
                    : "bg-[#00518c] text-white/85 hover:bg-[#0b6cad]"
                }`}
              >
                {tab.icon}
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TransactionTab;
