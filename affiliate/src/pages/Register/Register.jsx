import React, { useMemo, useState } from "react";
import {
  Eye,
  EyeOff,
  User,
  Phone,
  Mail,
  Lock,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { useLanguage } from "../../Context/LanguageProvider";
import api from "../../api/axios";

const Register = () => {
  const { isBangla } = useLanguage();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const text = useMemo(
    () => ({
      badge: isBangla ? "ক্রিকেক্স অ্যাফিলিয়েট" : "Crickex Affiliate",
      title: isBangla ? "অ্যাফিলিয়েট অ্যাকাউন্ট তৈরি করুন" : "Create Affiliate Account",
      sub: isBangla
        ? "আজই জয়েন করুন এবং লাইফটাইম কমিশন আয়ের সুযোগ নিন।"
        : "Join today and start earning lifetime commission.",
      commission: isBangla ? "৫০% লাইফটাইম কমিশন" : "50% Lifetime Commission",
      username: isBangla ? "ইউজারনেম" : "Username",
      phone: isBangla ? "ফোন নম্বর" : "Phone",
      email: isBangla ? "ইমেইল" : "Email",
      password: isBangla ? "পাসওয়ার্ড" : "Password",
      confirmPassword: isBangla ? "কনফার্ম পাসওয়ার্ড" : "Confirm Password",
      submit: isBangla ? "রেজিস্টার করুন" : "Register",
      submitting: isBangla ? "রেজিস্টার হচ্ছে..." : "Registering...",
      already: isBangla ? "আগেই অ্যাকাউন্ট আছে?" : "Already have an account?",
      login: isBangla ? "লগইন" : "Login",
      note1: isBangla ? "ফ্রি অ্যাকাউন্ট" : "Free Account",
      note2: isBangla ? "জিরো ইনভেস্টমেন্ট" : "Zero Investment",
      note3: isBangla ? "দ্রুত সাপোর্ট" : "Fast Support",

      usernameRequired: isBangla ? "ইউজারনেম দিন" : "Enter username",
      usernameInvalid: isBangla
        ? "ইউজারনেম ৪-১৫ অক্ষর হবে এবং শুধু ইংরেজি অক্ষর/নাম্বার ব্যবহার করুন"
        : "Username must be 4-15 characters and only letters/numbers allowed",
      phoneRequired: isBangla ? "ফোন নম্বর দিন" : "Enter phone number",
      emailRequired: isBangla ? "ইমেইল দিন" : "Enter email",
      emailInvalid: isBangla ? "সঠিক ইমেইল দিন" : "Enter valid email",
      passwordRequired: isBangla ? "পাসওয়ার্ড দিন" : "Enter password",
      passwordInvalid: isBangla
        ? "পাসওয়ার্ড ৬-২০ অক্ষরের হতে হবে"
        : "Password must be 6-20 characters",
      confirmRequired: isBangla
        ? "কনফার্ম পাসওয়ার্ড দিন"
        : "Enter confirm password",
      passwordNotMatch: isBangla
        ? "পাসওয়ার্ড মিলছে না"
        : "Password does not match",
      success: isBangla
        ? "রেজিস্ট্রেশন সফল হয়েছে। অ্যাডমিন approve করলে আপনি লগইন করতে পারবেন।"
        : "Registration successful. You can login after admin approval.",
    }),
    [isBangla],
  );

  const handleChange = (key, value) => {
    if (key === "username") {
      value = value
        .toLowerCase()
        .replace(/\s/g, "")
        .replace(/[^a-z0-9]/g, "");
    }

    if (key === "phone") {
      value = value.replace(/\D/g, "");
    }

    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    const username = form.username.trim().toLowerCase();
    const phone = form.phone.trim();
    const email = form.email.trim().toLowerCase();

    if (!username) return toast.error(text.usernameRequired);
    if (
      username.length < 4 ||
      username.length > 15 ||
      !/^[a-z0-9]+$/.test(username)
    ) {
      return toast.error(text.usernameInvalid);
    }

    if (!phone) return toast.error(text.phoneRequired);
    if (!email) return toast.error(text.emailRequired);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return toast.error(text.emailInvalid);

    if (!form.password) return toast.error(text.passwordRequired);
    if (form.password.length < 6 || form.password.length > 20) {
      return toast.error(text.passwordInvalid);
    }

    if (!form.confirmPassword) return toast.error(text.confirmRequired);
    if (form.password !== form.confirmPassword)
      return toast.error(text.passwordNotMatch);

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
        phone: form.phone.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        countryCode: "+880",
        currency: "BDT",
      };

      const { data } = await api.post("/api/affiliate/register", payload);

      toast.success(data?.message || text.success);

      setForm({
        username: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 900);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          (isBangla ? "রেজিস্ট্রেশন ব্যর্থ হয়েছে" : "Registration failed"),
      );
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      key: "username",
      label: text.username,
      type: "text",
      icon: User,
      placeholder: isBangla ? "আপনার ইউজারনেম" : "Enter username",
    },
    {
      key: "phone",
      label: text.phone,
      type: "tel",
      icon: Phone,
      placeholder: isBangla ? "আপনার ফোন নম্বর" : "Enter phone number",
    },
    {
      key: "email",
      label: text.email,
      type: "email",
      icon: Mail,
      placeholder: isBangla ? "আপনার ইমেইল" : "Enter email address",
    },
  ];

  return (
    <div className="min-h-screen bg-[#061532] px-4 py-10 text-white">
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

          <div className="mt-6 rounded-2xl bg-[#ffcc18] p-5 text-[#061532]">
            <p className="text-2xl font-black md:text-4xl">{text.commission}</p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[text.note1, text.note2, text.note3].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-xl bg-[#0c2c62] px-3 py-3 text-sm font-bold"
              >
                <CheckCircle size={17} className="text-[#ffcc18]" />
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
              {text.submit}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => {
              const Icon = field.icon;

              return (
                <div key={field.key}>
                  <label className="mb-2 block text-sm font-bold text-[#061532]">
                    {field.label}
                  </label>

                  <div className="flex h-[50px] items-center rounded-xl border border-[#d9e2ef] bg-[#f4f7fb] px-4 focus-within:border-[#ffcc18]">
                    <Icon size={18} className="text-[#0b66a8]" />
                    <input
                      type={field.type}
                      value={form[field.key]}
                      disabled={loading}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              );
            })}

            <div>
              <label className="mb-2 block text-sm font-bold text-[#061532]">
                {text.password}
              </label>

              <div className="flex h-[50px] items-center rounded-xl border border-[#d9e2ef] bg-[#f4f7fb] px-4 focus-within:border-[#ffcc18]">
                <Lock size={18} className="text-[#0b66a8]" />
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  disabled={loading}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder={isBangla ? "পাসওয়ার্ড লিখুন" : "Enter password"}
                  className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowPass((prev) => !prev)}
                  className="cursor-pointer text-gray-500 disabled:cursor-not-allowed"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#061532]">
                {text.confirmPassword}
              </label>

              <div className="flex h-[50px] items-center rounded-xl border border-[#d9e2ef] bg-[#f4f7fb] px-4 focus-within:border-[#ffcc18]">
                <Lock size={18} className="text-[#0b66a8]" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  disabled={loading}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  placeholder={
                    isBangla ? "আবার পাসওয়ার্ড লিখুন" : "Confirm password"
                  }
                  className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="cursor-pointer text-gray-500 disabled:cursor-not-allowed"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#ffcc18] text-base font-black text-[#061532] transition hover:bg-[#ffd83d] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  {text.submitting}
                </>
              ) : (
                text.submit
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            {text.already}{" "}
            <Link
              to="/login"
              className="cursor-pointer font-bold text-[#0b66a8] hover:underline"
            >
              {text.login}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
