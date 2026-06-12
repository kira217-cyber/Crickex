import React, { useMemo, useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  RefreshCw,
  ShieldCheck,
  User,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";

import { useLanguage } from "../../Context/LanguageProvider";
import api from "../../api/axios";
import { setCredentials } from "../../features/auth/authSlice";

const makeCode = () => {
  const chars = "0123456789";
  let code = "";

  for (let i = 0; i < 5; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
};

const Login = () => {
  const { isBangla } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    username: "",
    password: "",
    validationCode: "",
  });

  const [captcha, setCaptcha] = useState(makeCode());
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const text = useMemo(
    () => ({
      badge: isBangla ? "ক্রিকেক্স অ্যাফিলিয়েট" : "Crickex Affiliate",
      title: isBangla ? "অ্যাফিলিয়েট লগইন" : "Affiliate Login",
      sub: isBangla
        ? "আপনার অ্যাফিলিয়েট ড্যাশবোর্ডে প্রবেশ করুন।"
        : "Access your affiliate dashboard securely.",
      username: isBangla ? "ইউজারনেম" : "Username",
      password: isBangla ? "পাসওয়ার্ড" : "Password",
      validationCode: isBangla ? "ভ্যালিডেশন কোড" : "Validation Code",
      login: isBangla ? "লগইন করুন" : "Login",
      loggingIn: isBangla ? "লগইন হচ্ছে..." : "Logging in...",
      noAccount: isBangla ? "অ্যাকাউন্ট নেই?" : "Don’t have an account?",
      register: isBangla ? "রেজিস্টার করুন" : "Register",
      forgot: isBangla ? "পাসওয়ার্ড ভুলে গেছেন?" : "Forgot password?",
      enterUsername: isBangla ? "ইউজারনেম দিন" : "Enter username",
      enterPassword: isBangla ? "পাসওয়ার্ড দিন" : "Enter password",
      enterCode: isBangla ? "ভ্যালিডেশন কোড দিন" : "Enter validation code",
      invalidCode: isBangla
        ? "ভ্যালিডেশন কোড সঠিক নয়"
        : "Validation code is incorrect",
      success: isBangla ? "লগইন সফল হয়েছে" : "Login successful",
      failed: isBangla ? "লগইন ব্যর্থ হয়েছে" : "Login failed",
      feature1: isBangla ? "নিরাপদ লগইন" : "Secure Login",
      feature2: isBangla ? "লাইফটাইম কমিশন" : "Lifetime Commission",
      feature3: isBangla ? "দ্রুত সাপোর্ট" : "Fast Support",
      pending: isBangla
        ? "আপনার অ্যাফিলিয়েট অ্যাকাউন্ট pending আছে। Admin approve করলে লগইন করতে পারবেন।"
        : "Your affiliate account is pending. You can login after admin approval.",
    }),
    [isBangla],
  );

  const refreshCode = () => {
    setCaptcha(makeCode());
    setForm((prev) => ({ ...prev, validationCode: "" }));
  };

  const handleChange = (key, value) => {
    if (key === "username") {
      value = value
        .toLowerCase()
        .replace(/\s/g, "")
        .replace(/[^a-z0-9]/g, "");
    }

    if (key === "validationCode") {
      value = value.replace(/\D/g, "").slice(0, 5);
    }

    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    if (!form.username.trim()) {
      toast.error(text.enterUsername);
      return false;
    }

    if (!form.password.trim()) {
      toast.error(text.enterPassword);
      return false;
    }

    if (!form.validationCode.trim()) {
      toast.error(text.enterCode);
      return false;
    }

    if (form.validationCode.trim() !== captcha) {
      refreshCode();
      toast.error(text.invalidCode);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;
    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload = {
        username: form.username.trim().toLowerCase(),
        password: form.password,
      };

      const { data } = await api.post("/api/affiliate/login", payload);

      const user = data?.data?.user;
      const token = data?.data?.token;

      if (!user || !token) {
        toast.error(text.failed);
        refreshCode();
        return;
      }

      if (user?.role !== "aff-user") {
        toast.error("Only affiliate user can login here");
        refreshCode();
        return;
      }

      dispatch(setCredentials({ user, token }));

      toast.success(data?.message || text.success);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      refreshCode();

      toast.error(
        error?.response?.data?.message || error?.message || text.failed,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-auto bg-[#061532] px-4 py-10 text-white">
      <div className="mx-auto grid max-w-[1120px] items-center gap-8 lg:grid-cols-2">
        <div className="hidden md:block rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur md:p-8">
          <span className="inline-flex rounded-full bg-[#ffcc18] px-4 py-2 text-sm font-bold text-[#061532]">
            {text.badge}
          </span>

          <h1 className="mt-6 text-3xl font-black leading-tight md:text-5xl">
            {text.title}
          </h1>

          <p className="mt-4 max-w-[520px] text-base text-white/75">
            {text.sub}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[text.feature1, text.feature2, text.feature3].map((item) => (
              <div
                key={item}
                className="flex items-center justify-center rounded-xl bg-[#0c2c62] px-3 py-4 text-center text-sm font-bold"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white p-5 text-[#111] shadow-2xl md:p-7">
          <div className="mb-6 text-center">
            <img
              src="https://crickexpartner.com/wp-content/uploads/2024/03/logo-2.png"
              alt="Crickex"
              className="mx-auto h-[42px] object-contain"
            />
            <h2 className="mt-4 text-2xl font-black text-[#061532]">
              {text.login}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-[#061532]">
                {text.username}
              </label>

              <div className="flex h-[50px] items-center rounded-xl border border-[#d9e2ef] bg-[#f4f7fb] px-4 focus-within:border-[#ffcc18]">
                <User size={18} className="text-[#0b66a8]" />
                <input
                  type="text"
                  value={form.username}
                  disabled={loading}
                  onChange={(e) => handleChange("username", e.target.value)}
                  placeholder={text.username}
                  className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#061532]">
                {text.password}
              </label>

              <div className="flex h-[50px] items-center rounded-xl border border-[#d9e2ef] bg-[#f4f7fb] px-4 focus-within:border-[#ffcc18]">
                <Lock size={18} className="text-[#0b66a8]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  disabled={loading}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder={text.password}
                  className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
                />

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="cursor-pointer text-gray-500 disabled:cursor-not-allowed"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#061532]">
                {text.validationCode}
              </label>

              <div className="grid grid-cols-[1fr_130px_44px] gap-2">
                <div className="flex h-[50px] items-center rounded-xl border border-[#d9e2ef] bg-[#f4f7fb] px-4 focus-within:border-[#ffcc18]">
                  <ShieldCheck size={18} className="text-[#0b66a8]" />
                  <input
                    type="text"
                    value={form.validationCode}
                    disabled={loading}
                    onChange={(e) =>
                      handleChange("validationCode", e.target.value)
                    }
                    placeholder={text.validationCode}
                    className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm uppercase outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="flex h-[50px] select-none items-center justify-center rounded-xl border border-[#ffcc18] bg-[#061532] text-xl font-black tracking-[5px] text-[#ffcc18]">
                  {captcha}
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={refreshCode}
                  className="flex h-[50px] cursor-pointer items-center justify-center rounded-xl bg-[#ffcc18] text-[#061532] transition hover:bg-[#ffd83d] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <RefreshCw size={19} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                className="cursor-pointer text-sm font-bold text-[#0b66a8] hover:underline"
              >
                {text.forgot}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#ffcc18] text-base font-black text-[#061532] transition hover:bg-[#ffd83d] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  {text.loggingIn}
                </>
              ) : (
                text.login
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            {text.noAccount}{" "}
            <Link
              to="/register"
              className="cursor-pointer font-bold text-[#0b66a8] hover:underline"
            >
              {text.register}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
