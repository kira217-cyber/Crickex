import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Lock, Eye, EyeOff, Save, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import api from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";
import { logout } from "../../features/auth/authSlice";

const PasswordInput = ({
  name,
  label,
  placeholder,
  value,
  showPassword,
  saving,
  onChange,
  onToggleShow,
}) => {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-bold text-[#333]">
        {label}
      </label>

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0865a9]">
          <Lock size={17} />
        </span>

        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          disabled={saving}
          autoComplete="new-password"
          className="h-[42px] w-full rounded-[4px] border border-[#d7d7d7] bg-[#eeeeee] pl-10 pr-11 text-[14px] text-[#222] outline-none placeholder:text-[#999] focus:border-[#0865a9] disabled:cursor-not-allowed disabled:text-[#777]"
        />

        <button
          type="button"
          onClick={() => onToggleShow(name)}
          disabled={saving}
          className="absolute right-2 top-1/2 flex h-[28px] w-[28px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-[4px] text-[#0865a9] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
};

const PasswordChangeModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { isBangla } = useLanguage();

  const [saving, setSaving] = useState(false);

  const [show, setShow] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const t = {
    title: isBangla ? "পাসওয়ার্ড পরিবর্তন" : "Change Password",
    subtitle: isBangla
      ? "আপনার অ্যাকাউন্ট সুরক্ষিত রাখতে নিয়মিত পাসওয়ার্ড পরিবর্তন করুন।"
      : "Change your password regularly to keep your account secure.",
    currentPassword: isBangla ? "বর্তমান পাসওয়ার্ড" : "Current Password",
    newPassword: isBangla ? "নতুন পাসওয়ার্ড" : "New Password",
    confirmPassword: isBangla ? "কনফার্ম পাসওয়ার্ড" : "Confirm Password",
    currentPlaceholder: isBangla
      ? "বর্তমান পাসওয়ার্ড লিখুন"
      : "Enter current password",
    newPlaceholder: isBangla ? "নতুন পাসওয়ার্ড লিখুন" : "Enter new password",
    confirmPlaceholder: isBangla
      ? "আবার নতুন পাসওয়ার্ড লিখুন"
      : "Re-enter new password",
    save: isBangla ? "পাসওয়ার্ড আপডেট করুন" : "Update Password",
    saving: isBangla ? "আপডেট হচ্ছে..." : "Updating...",
    required: isBangla
      ? "সব পাসওয়ার্ড ফিল্ড পূরণ করুন"
      : "Fill all password fields",
    min: isBangla
      ? "নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"
      : "New password must be at least 6 characters",
    notMatch: isBangla
      ? "কনফার্ম পাসওয়ার্ড মিলছে না"
      : "Confirm password does not match",
    same: isBangla
      ? "নতুন পাসওয়ার্ড বর্তমান পাসওয়ার্ডের মতো হতে পারবে না"
      : "New password must be different from current password",
    success: isBangla
      ? "পাসওয়ার্ড আপডেট হয়েছে, আবার লগইন করুন"
      : "Password updated, please login again",
    failed: isBangla
      ? "পাসওয়ার্ড আপডেট করা যায়নি"
      : "Failed to update password",
    note: isBangla
      ? "পাসওয়ার্ড সফলভাবে পরিবর্তন হলে আপনাকে স্বয়ংক্রিয়ভাবে লগআউট করা হবে।"
      : "After changing password successfully, you will be logged out automatically.",
  };

  const setField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleShow = (key) => {
    setShow((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const resetForm = () => {
    setForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setShow({
      currentPassword: false,
      newPassword: false,
      confirmPassword: false,
    });
  };

  const handleClose = () => {
    if (saving) return;
    resetForm();
    onClose?.();
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    if (
      !form.currentPassword.trim() ||
      !form.newPassword.trim() ||
      !form.confirmPassword.trim()
    ) {
      toast.error(t.required);
      return;
    }

    if (form.newPassword.length < 6) {
      toast.error(t.min);
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error(t.notMatch);
      return;
    }

    if (form.currentPassword === form.newPassword) {
      toast.error(t.same);
      return;
    }

    try {
      setSaving(true);

      const res = await api.patch("/api/user-info/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });

      toast.success(res?.data?.message || t.success);

      resetForm();
      onClose?.();
      dispatch(logout());
    } catch (error) {
      toast.error(error?.response?.data?.message || t.failed);
    } finally {
      setSaving(false);
    }
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
              <h2 className="text-[18px] font-semibold">{t.title}</h2>

              <button
                type="button"
                onClick={handleClose}
                disabled={saving}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X size={24} />
              </button>
            </div>

            <div className="shrink-0 bg-[#0865a9] px-4 pb-4">
              <div className="rounded-[4px] bg-white/10 px-4 py-3 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
                    <ShieldCheck size={24} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[15px] font-bold">{t.title}</p>
                    <p className="mt-1 text-[12px] leading-5 text-white/80">
                      {t.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#f3f7fb] px-4 py-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="rounded-[6px] border border-[#dce8f5] bg-white p-4 shadow-sm">
                  <PasswordInput
                    name="currentPassword"
                    label={t.currentPassword}
                    placeholder={t.currentPlaceholder}
                    value={form.currentPassword}
                    showPassword={show.currentPassword}
                    saving={saving}
                    onChange={setField}
                    onToggleShow={toggleShow}
                  />
                </div>

                <div className="rounded-[6px] border border-[#dce8f5] bg-white p-4 shadow-sm">
                  <PasswordInput
                    name="newPassword"
                    label={t.newPassword}
                    placeholder={t.newPlaceholder}
                    value={form.newPassword}
                    showPassword={show.newPassword}
                    saving={saving}
                    onChange={setField}
                    onToggleShow={toggleShow}
                  />
                </div>

                <div className="rounded-[6px] border border-[#dce8f5] bg-white p-4 shadow-sm">
                  <PasswordInput
                    name="confirmPassword"
                    label={t.confirmPassword}
                    placeholder={t.confirmPlaceholder}
                    value={form.confirmPassword}
                    showPassword={show.confirmPassword}
                    saving={saving}
                    onChange={setField}
                    onToggleShow={toggleShow}
                  />
                </div>

                <div className="rounded-[6px] border border-[#dce8f5] bg-[#eef7ff] p-4 text-[12px] leading-6 text-[#0865a9]">
                  {t.note}
                </div>
              </form>
            </div>

            <div className="shrink-0 border-t border-[#e5e5e5] bg-white px-4 py-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="flex h-[42px] w-full cursor-pointer items-center justify-center gap-2 rounded-[4px] bg-[#0865a9] text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:bg-[#a6a6a6]"
              >
                {saving ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    {t.saving}
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    {t.save}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PasswordChangeModal;
