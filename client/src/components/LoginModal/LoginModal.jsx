import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, X } from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";

const logoUrl =
  "https://img.c88rx.com/cx/h5/assets/images/member-logo.png?v=1780386038573";

const LoginModal = ({ open, onClose, onRegisterClick, onForgotClick }) => {
  const { isBangla } = useLanguage();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const text = useMemo(
    () => ({
      title: isBangla ? "লগইন" : "Login",
      username: isBangla ? "ইউজারনেম" : "Username",
      usernamePh: isBangla
        ? "৪-১৬ অক্ষর, নাম্বার চলবে, স্পেস নয়"
        : "4-16 char, allow numbers, no space",
      password: isBangla ? "পাসওয়ার্ড" : "Password",
      passwordPh: isBangla
        ? "৬-২০ অক্ষর ও নাম্বার"
        : "6-20 characters and numbers",
      forgot: isBangla ? "পাসওয়ার্ড ভুলে গেছেন?" : "Forgot password?",
      login: isBangla ? "লগইন" : "Login",
      noAccount: isBangla
        ? "একাউন্ট নেই?"
        : "Do not have an account?",
      signUp: isBangla ? "সাইন আপ" : "Sign Up",
    }),
    [isBangla],
  );

  const canLogin = username.trim().length >= 4 && password.trim().length >= 6;

  const handleLogin = () => {
    const payload = {
      username,
      password,
    };

    console.log("Login Payload:", payload);
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
            className="relative flex h-screen w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-[700px] sm:max-w-[375px] sm:rounded-[8px]"
          >
            <div className="relative flex h-[50px] shrink-0 items-center justify-center bg-[#0865a9] text-white">
              <h2 className="text-[18px] font-semibold">{text.title}</h2>

              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-[21px] pb-8 pt-8">
              <div className="flex justify-center pb-10">
                <img
                  src={logoUrl}
                  alt="CRICKEX"
                  className="h-[28px] object-contain"
                />
              </div>

              <div>
                <label className="mb-3 block text-[14px] text-[#333]">
                  {text.username}
                </label>

                <input
                  autoFocus
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.replace(/\s/g, ""))
                  }
                  placeholder={text.usernamePh}
                  className="h-[45px] w-full rounded-[4px] border border-[#0a68b1] bg-[#eeeeee] px-4 text-[13px] text-[#222] outline-none placeholder:text-[#8c98a3]"
                />
              </div>

              <div className="mt-5">
                <label className="mb-3 block text-[14px] text-[#333]">
                  {text.password}
                </label>

                <div className="flex h-[45px] items-center rounded-[4px] border border-[#d7d7d7] bg-[#eeeeee] px-4">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={text.passwordPh}
                    className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-[#222] outline-none placeholder:text-[#8c98a3]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="cursor-pointer text-[#999]"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={onForgotClick}
                  className="cursor-pointer text-[14px] text-[#0069b4]"
                >
                  {text.forgot}
                </button>
              </div>

              <button
                type="button"
                onClick={handleLogin}
                disabled={!canLogin}
                className="mt-6 h-[46px] w-full cursor-pointer rounded-[3px] bg-[#0865a9] text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:bg-[#a6a6a6]"
              >
                {text.login}
              </button>

              <div className="mt-6 text-center text-[14px] text-[#8d8d8d]">
                {text.noAccount}{" "}
                <button
                  type="button"
                  onClick={onRegisterClick}
                  className="cursor-pointer text-[#0069b4]"
                >
                  {text.signUp}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;