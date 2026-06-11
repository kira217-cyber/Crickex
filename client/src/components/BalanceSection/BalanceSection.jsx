import React from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import { RefreshCw, Gift, CreditCard } from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";
import { selectIsAuth, selectUser } from "../../features/auth/authSelectors";

const BalanceSection = () => {
  const { isBangla } = useLanguage();
  const isAuth = useSelector(selectIsAuth);
  const user = useSelector(selectUser);

  if (!isAuth) return null;

  const balance = Number(user?.balance || 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return (
    <div className="flex h-[52px] items-center justify-between bg-[#0b5f9e] px-4 text-white md:hidden">
      <div className="flex items-center text-[16px] font-bold">
        <span>৳ {balance}</span>
      </div>

      <div className="flex h-full items-center gap-4">
        <button
          type="button"
          className="flex h-full cursor-pointer items-center justify-center px-1 text-white/70"
        >
          <RefreshCw size={17} />
        </button>

        <div className="h-[28px] w-px bg-white/15" />

        <Link
          to="/promotions"
          className="flex h-full min-w-[52px] flex-col items-center justify-center gap-[2px] text-white"
        >
          <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#075394] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]">
            <Gift size={15} className="text-[#ff4960]" />
          </span>
          <span className="text-[11px] font-medium leading-none">
            {isBangla ? "প্রোমোশন" : "Promotions"}
          </span>
        </Link>

        <Link
          to="/deposit"
          className="flex h-full min-w-[52px] flex-col items-center justify-center gap-[2px] text-white"
        >
          <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#075394] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]">
            <CreditCard size={15} className="text-[#ff4960]" />
          </span>
          <span className="text-[11px] font-medium leading-none">
            {isBangla ? "ডিপোজিট" : "Deposit"}
          </span>
        </Link>
      </div>
    </div>
  );
};

export default BalanceSection;
