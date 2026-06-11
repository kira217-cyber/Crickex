import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Eye, EyeOff, Search, X, CheckCircle } from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";

import { useDispatch } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

import api from "../../api/axios";
import { setCredentials } from "../../features/auth/authSlice";

import slide1 from "../../assets/register/1.jpg";
import slide2 from "../../assets/register/2.jpg";
import slide3 from "../../assets/register/3.jpg";
import slide4 from "../../assets/register/4.jpg";

const logoUrl =
  "https://img.c88rx.com/cx/h5/assets/images/member-logo.png?v=1780386038573";

const slides = [slide1, slide2, slide3, slide4];

const RegisterModal = ({ open, onClose, onLoginClick }) => {
  const { isBangla } = useLanguage();
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [refCode, setRefCode] = useState("");

  const [countries, setCountries] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);

  const countryRef = useRef(null);

  const [selected, setSelected] = useState({
    name: "Bangladesh",
    code: "+880",
    cca2: "BD",
    flag: "https://flagcdn.com/w40/bd.png",
  });

  const text = {
    title: isBangla ? "সাইন আপ" : "Sign up",
    chooseCurrency: isBangla ? "কারেন্সি নির্বাচন করুন" : "Choose currency",
    username: isBangla ? "ইউজারনেম" : "Username",
    usernamePh: isBangla
      ? "৪-১৬ অক্ষর, নাম্বার চলবে, স্পেস নয়"
      : "4-16 char, allow numbers, no space",
    password: isBangla ? "পাসওয়ার্ড" : "Password",
    passwordPh: isBangla
      ? "৬-২০ অক্ষর ও নাম্বার"
      : "6-20 characters and numbers",
    rule1: isBangla ? "৬~২০ অক্ষরের মধ্যে।" : "Between 6~20 characters.",
    rule2: isBangla ? "কমপক্ষে একটি অক্ষর।" : "At least one alphabet.",
    rule3: isBangla
      ? "কমপক্ষে একটি নাম্বার। (স্পেশাল ক্যারেক্টার ব্যবহার করা যাবে)"
      : "At least one number. (Special character, symbols are allowed)",
    phone: isBangla ? "ফোন নম্বর" : "Phone Number",
    phonePh: isBangla ? "আপনার ফোন নম্বর দিন।" : "Enter your phone number.",
    refCode: isBangla ? "রেফার কোড" : "Refer Code",
    refPh: isBangla ? "রেফার কোড লিখুন" : "Enter refer code",
    submit: isBangla ? "সাবমিট" : "Submit",
    loading: isBangla ? "রেজিস্টার হচ্ছে..." : "Registering...",
    already: isBangla ? "আগেই একাউন্ট আছে ?" : "Already a member ?",
    login: isBangla ? "লগইন" : "Log in",
    terms: isBangla
      ? "রেজিস্টার করার মাধ্যমে আপনি নিশ্চিত করছেন যে আপনার বয়স ১৮ বছরের বেশি এবং আপনি Terms & Conditions পড়েছেন ও সম্মত হয়েছেন।"
      : "Registering means you are over 18 years old, have read and agree to the Terms & Conditions.",
    searchCountry: isBangla ? "দেশ খুঁজুন..." : "Search country...",

    enterUsername: isBangla ? "ইউজারনেম দিন" : "Enter username",
    usernameLength: isBangla
      ? "ইউজারনেম ৪-১৫ অক্ষরের হতে হবে"
      : "Username must be 4-15 characters",
    usernameInvalid: isBangla
      ? "ইউজারনেমে শুধু ইংরেজি অক্ষর ও নাম্বার ব্যবহার করুন"
      : "Username only allows letters and numbers",
    enterPassword: isBangla ? "পাসওয়ার্ড দিন" : "Enter password",
    passwordLength: isBangla
      ? "পাসওয়ার্ড ৬-২০ অক্ষরের হতে হবে"
      : "Password must be 6-20 characters",
    passwordAlphabet: isBangla
      ? "পাসওয়ার্ডে কমপক্ষে একটি অক্ষর থাকতে হবে"
      : "Password must contain at least one alphabet",
    passwordNumber: isBangla
      ? "পাসওয়ার্ডে কমপক্ষে একটি নাম্বার থাকতে হবে"
      : "Password must contain at least one number",
    enterPhone: isBangla ? "ফোন নম্বর দিন" : "Enter phone number",
    phoneLength: isBangla ? "সঠিক ফোন নম্বর দিন" : "Enter a valid phone number",
    success: isBangla ? "রেজিস্ট্রেশন সফল হয়েছে" : "Registration successful",
  };

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setPhone("");
    setRefCode("");
    setShowPassword(false);
    setCurrencyOpen(false);
    setCountryOpen(false);
    setSearch("");
  };

  useEffect(() => {
    if (!open) return;

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 2600);

    return () => clearInterval(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const loadCountries = async () => {
      try {
        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca2,idd,flags",
        );
        const data = await res.json();

        const list = (Array.isArray(data) ? data : [])
          .map((c) => {
            const root = c?.idd?.root || "";
            const suffix = c?.idd?.suffixes?.[0] || "";
            const code = `${root}${suffix}`.trim();

            return {
              name: c?.name?.common || "",
              code,
              cca2: c?.cca2 || "",
              flag:
                c?.flags?.png ||
                `https://flagcdn.com/w40/${String(
                  c?.cca2 || "",
                ).toLowerCase()}.png`,
            };
          })
          .filter((item) => item.name && item.code && item.cca2)
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(list);

        const bd = list.find((item) => item.cca2 === "BD");
        if (bd) setSelected(bd);
      } catch (error) {
        console.error("Country fetch failed:", error);
      }
    };

    loadCountries();
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryRef.current && !countryRef.current.contains(event.target)) {
        setCountryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return countries;

    return countries.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.cca2.toLowerCase().includes(q),
    );
  }, [countries, search]);

  const cleanUsername = username.trim().toLowerCase();
  const cleanPassword = String(password || "");
  const cleanPhone = String(phone || "").replace(/\D/g, "");

  const canSubmit =
    cleanUsername.length >= 4 &&
    cleanUsername.length <= 15 &&
    /^[a-z0-9]+$/.test(cleanUsername) &&
    cleanPassword.length >= 6 &&
    cleanPassword.length <= 20 &&
    /[a-zA-Z]/.test(cleanPassword) &&
    /\d/.test(cleanPassword) &&
    cleanPhone.length >= 6;

  const registerMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/api/users/register", payload);
      return data;
    },

    onSuccess: (res) => {
      const user = res?.data?.user;
      const token = res?.data?.token;

      if (user && token) {
        dispatch(setCredentials({ user, token }));
      }

      toast.success(res?.message || text.success);
      resetForm();
      onClose?.();
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          (isBangla ? "রেজিস্ট্রেশন ব্যর্থ হয়েছে" : "Registration failed"),
      );
    },
  });

  const validateForm = () => {
    if (!cleanUsername) {
      toast.error(text.enterUsername);
      return false;
    }

    if (cleanUsername.length < 4 || cleanUsername.length > 15) {
      toast.error(text.usernameLength);
      return false;
    }

    if (!/^[a-z0-9]+$/.test(cleanUsername)) {
      toast.error(text.usernameInvalid);
      return false;
    }

    if (!cleanPassword) {
      toast.error(text.enterPassword);
      return false;
    }

    if (cleanPassword.length < 6 || cleanPassword.length > 20) {
      toast.error(text.passwordLength);
      return false;
    }

    if (!/[a-zA-Z]/.test(cleanPassword)) {
      toast.error(text.passwordAlphabet);
      return false;
    }

    if (!/\d/.test(cleanPassword)) {
      toast.error(text.passwordNumber);
      return false;
    }

    if (!cleanPhone) {
      toast.error(text.enterPhone);
      return false;
    }

    if (cleanPhone.length < 6) {
      toast.error(text.phoneLength);
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (registerMutation.isPending) return;
    if (!validateForm()) return;

    registerMutation.mutate({
      currency: "BDT",
      username: cleanUsername,
      password: cleanPassword,
      countryCode: selected.code,
      phone: cleanPhone,
      referCode: refCode.trim().toUpperCase(),
    });
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
                disabled={registerMutation.isPending}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-5 [scrollbar-width:none]">
              <div className="flex justify-center py-5">
                <img
                  src={logoUrl}
                  alt="CRICKEX"
                  className="h-[28px] object-contain"
                />
              </div>

              <div className="w-full overflow-hidden">
                <div
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{
                    transform: `translateX(-${activeSlide * 100}%)`,
                  }}
                >
                  {slides.map((img, index) => (
                    <div key={index} className="min-w-full px-[21px]">
                      <div className="h-[104px] overflow-hidden rounded-[4px] bg-[#0b66a8]">
                        <img
                          src={img}
                          alt={`register-banner-${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex justify-center gap-1.5">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    className={`h-[6px] cursor-pointer rounded-full transition-all ${
                      activeSlide === index
                        ? "w-[18px] bg-[#0865a9]"
                        : "w-[6px] bg-[#cfd5da]"
                    }`}
                  />
                ))}
              </div>

              <div className="px-[21px] pt-6">
                <label className="mb-3 block text-[14px] text-[#222]">
                  {text.chooseCurrency}
                </label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCurrencyOpen((prev) => !prev)}
                    className="flex h-[45px] w-full cursor-pointer items-center justify-between rounded-[4px] border border-[#d7d7d7] bg-[#eeeeee] px-3"
                  >
                    <span className="flex items-center gap-3 text-[14px] text-[#111]">
                      <img
                        src="https://flagcdn.com/w40/bd.png"
                        alt="BD"
                        className="h-[22px] w-[22px] rounded-full object-cover"
                      />
                      BDT
                    </span>

                    <ChevronDown size={17} className="text-[#666]" />
                  </button>

                  {currencyOpen && (
                    <div className="absolute left-0 top-[49px] z-20 w-full rounded border border-[#ddd] bg-white shadow">
                      <button
                        type="button"
                        onClick={() => setCurrencyOpen(false)}
                        className="flex w-full cursor-pointer items-center gap-3 px-3 py-3 text-left text-sm hover:bg-gray-100"
                      >
                        <img
                          src="https://flagcdn.com/w40/bd.png"
                          alt="BD"
                          className="h-[22px] w-[22px] rounded-full object-cover"
                        />
                        BDT
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-8">
                  <label className="mb-3 block text-[14px] text-[#222]">
                    {text.username}
                  </label>

                  <input
                    value={username}
                    onChange={(e) =>
                      setUsername(
                        e.target.value
                          .toLowerCase()
                          .replace(/\s/g, "")
                          .replace(/[^a-z0-9]/g, "")
                          .slice(0, 15),
                      )
                    }
                    placeholder={text.usernamePh}
                    disabled={registerMutation.isPending}
                    className="h-[45px] w-full rounded-[4px] border border-[#d7d7d7] bg-[#eeeeee] px-4 text-[13px] outline-none placeholder:text-[#8c98a3] disabled:cursor-not-allowed"
                  />
                </div>

                <div className="mt-5">
                  <label className="mb-3 block text-[14px] text-[#222]">
                    {text.password}
                  </label>

                  <div className="flex h-[45px] items-center rounded-[4px] border border-[#d7d7d7] bg-[#eeeeee] px-4">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value.slice(0, 20))}
                      placeholder={text.passwordPh}
                      disabled={registerMutation.isPending}
                      className="h-full min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#8c98a3] disabled:cursor-not-allowed"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="cursor-pointer text-[#999]"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>

                  <div className="mt-3 space-y-2 text-[14px] leading-[18px] text-[#758494]">
                    {[text.rule1, text.rule2, text.rule3].map((rule) => (
                      <div key={rule} className="flex items-start gap-2">
                        <CheckCircle
                          size={17}
                          className="mt-[1px] shrink-0 fill-[#8d969b] text-[#8d969b]"
                        />
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <label className="mb-3 block text-[14px] text-[#222]">
                    {text.phone}
                  </label>

                  <div ref={countryRef} className="relative">
                    <div className="flex h-[45px] items-center rounded-[4px] border border-[#d7d7d7] bg-[#eeeeee]">
                      <button
                        type="button"
                        onClick={() => setCountryOpen((prev) => !prev)}
                        disabled={registerMutation.isPending}
                        className="flex h-full cursor-pointer items-center gap-2 px-4 disabled:cursor-not-allowed"
                      >
                        <img
                          src={selected.flag}
                          alt={selected.name}
                          className="h-[22px] w-[22px] rounded-full object-cover"
                        />

                        <span className="text-[13px] font-semibold text-[#111]">
                          {selected.code}
                        </span>
                      </button>

                      <div className="h-[22px] w-px bg-[#d8d8d8]" />

                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) =>
                          setPhone(
                            e.target.value.replace(/\D/g, "").slice(0, 15),
                          )
                        }
                        placeholder={text.phonePh}
                        disabled={registerMutation.isPending}
                        className="h-full min-w-0 flex-1 bg-transparent px-4 text-[13px] outline-none placeholder:text-[#8c98a3] disabled:cursor-not-allowed"
                      />
                    </div>

                    {countryOpen && (
                      <div className="absolute left-0 top-[50px] z-30 w-full overflow-hidden rounded-md border border-[#ddd] bg-white shadow-xl">
                        <div className="border-b border-[#eee] p-2">
                          <div className="flex h-9 items-center gap-2 rounded border border-[#ddd] px-2">
                            <Search size={15} className="text-[#777]" />

                            <input
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              placeholder={text.searchCountry}
                              className="h-full w-full bg-transparent text-sm outline-none"
                            />
                          </div>
                        </div>

                        <div className="max-h-[220px] overflow-y-auto">
                          {filteredCountries.map((item) => (
                            <button
                              type="button"
                              key={`${item.cca2}-${item.code}`}
                              onClick={() => {
                                setSelected(item);
                                setCountryOpen(false);
                                setSearch("");
                              }}
                              className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left hover:bg-[#f5f5f5]"
                            >
                              <span className="flex items-center gap-2">
                                <img
                                  src={item.flag}
                                  alt={item.name}
                                  className="h-[15px] w-[22px] object-cover"
                                />
                                <span className="text-sm">{item.name}</span>
                              </span>

                              <span className="text-sm font-semibold">
                                {item.code}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5">
                  <label className="mb-3 block text-[14px] text-[#222]">
                    {text.refCode}
                  </label>

                  <input
                    value={refCode}
                    onChange={(e) =>
                      setRefCode(
                        e.target.value
                          .toUpperCase()
                          .replace(/\s/g, "")
                          .replace(/[^A-Z0-9]/g, "")
                          .slice(0, 6),
                      )
                    }
                    placeholder={text.refPh}
                    disabled={registerMutation.isPending}
                    className="h-[45px] w-full rounded-[4px] border border-[#d7d7d7] bg-[#eeeeee] px-4 text-[13px] outline-none placeholder:text-[#8c98a3] disabled:cursor-not-allowed"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit || registerMutation.isPending}
                  className="mt-8 h-[44px] w-full cursor-pointer rounded-[3px] bg-[#0865a9] text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:bg-[#a6a6a6]"
                >
                  {registerMutation.isPending ? text.loading : text.submit}
                </button>

                <div className="mt-5 text-center text-[14px] text-[#8d969b]">
                  {text.already}{" "}
                  <button
                    type="button"
                    onClick={onLoginClick}
                    disabled={registerMutation.isPending}
                    className="cursor-pointer text-[#0069b4] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {text.login}
                  </button>
                </div>

                <p className="mx-auto mt-5 max-w-[320px] text-center text-[14px] leading-[18px] text-[#8d969b]">
                  {text.terms}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RegisterModal;
