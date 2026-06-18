import React, { useEffect, useState } from "react";
import { Bell, Loader2, RefreshCw, Save, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const emptyForm = {
  textBn: "",
  textEn: "",
  status: "active",
};

const AddNotice = () => {
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const inputClass =
    "w-full rounded-xl border border-[#1A79D3]/25 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#3ea0ff] focus:ring-2 focus:ring-[#1A79D3]/20";

  const labelClass = "mb-2 block text-sm font-bold text-blue-100";

  const loadNotice = async () => {
    try {
      setFetching(true);

      const res = await api.get("/api/notice");
      const data = res.data?.data || null;

      setNotice(data);

      if (data) {
        setForm({
          textBn: data?.text?.bn || "",
          textEn: data?.text?.en || "",
          status: data?.status || "active",
        });
      } else {
        setForm(emptyForm);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load notice");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadNotice();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.textBn.trim() || !form.textEn.trim()) {
      return toast.error("Bangla and English notice text are required");
    }

    try {
      setLoading(true);

      const res = await api.post("/api/notice", {
        textBn: form.textBn.trim(),
        textEn: form.textEn.trim(),
        status: form.status,
      });

      setNotice(res.data?.data || null);
      toast.success("Notice saved successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save notice");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const ok = window.confirm("Are you sure you want to delete this notice?");
    if (!ok) return;

    try {
      setLoading(true);

      await api.delete("/api/notice");

      setNotice(null);
      setForm(emptyForm);

      toast.success("Notice deleted successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete notice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-white">
      <section className="relative overflow-hidden rounded-3xl border border-[#1A79D3]/20 bg-gradient-to-r from-black/80 via-[#06182a] to-black/80 p-6 shadow-2xl shadow-black/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,121,211,0.30),transparent_35%)]" />

        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] shadow-lg shadow-[#1A79D3]/40">
              <Bell className="h-9 w-9" />
            </div>

            <h1 className="text-3xl font-black md:text-4xl">
              Notice{" "}
              <span className="bg-gradient-to-r from-[#3ea0ff] to-blue-100 bg-clip-text text-transparent">
                Management
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Only one notice will be saved. New save will update the existing
              notice.
            </p>
          </div>

          <div className="rounded-2xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 p-5">
            <p className="text-sm font-black text-blue-100">Notice Status</p>
            <p
              className={`mt-1 text-2xl font-black ${
                notice?.status === "active"
                  ? "text-emerald-400"
                  : notice
                    ? "text-red-400"
                    : "text-slate-400"
              }`}
            >
              {notice ? notice.status?.toUpperCase() : "EMPTY"}
            </p>
          </div>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"
      >
        <div className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
          <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-black">
                {notice ? "Update Notice" : "Add Notice"}
              </h2>
              <p className="text-sm text-slate-400">
                Add Bangla and English notice text.
              </p>
            </div>

            <button
              type="button"
              onClick={loadNotice}
              disabled={fetching}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-4 py-2 text-sm font-black text-blue-100 hover:bg-[#1A79D3]/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {fetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </button>
          </div>

          <div className="grid gap-5">
            <div>
              <label className={labelClass}>Bangla Notice Text *</label>
              <textarea
                rows={5}
                className={`${inputClass} resize-none`}
                value={form.textBn}
                onChange={(e) => setForm({ ...form, textBn: e.target.value })}
                placeholder="বাংলা নোটিশ লিখুন..."
              />
            </div>

            <div>
              <label className={labelClass}>English Notice Text *</label>
              <textarea
                rows={5}
                className={`${inputClass} resize-none`}
                value={form.textEn}
                onChange={(e) => setForm({ ...form, textEn: e.target.value })}
                placeholder="Write English notice..."
              />
            </div>

            <div>
              <label className={labelClass}>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className={`${inputClass} cursor-pointer`}
              >
                <option className="bg-[#050607]" value="active">
                  Active
                </option>
                <option className="bg-[#050607]" value="inactive">
                  Inactive
                </option>
              </select>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-[#1A79D3]/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}

              {loading ? "Saving..." : "Save Notice"}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={loading || !notice}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-5 py-3.5 text-sm font-black text-red-200 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-5 w-5" />
              Delete Notice
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
          <h2 className="text-xl font-black">Live Preview</h2>
          <p className="mt-1 text-sm text-slate-400">
            This is how the notice text will look.
          </p>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-[#1A79D3]/20 bg-black/40 p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="rounded-lg bg-[#3ea0ff] px-3 py-1 text-xs font-black text-white">
                  বাংলা
                </span>

                <span
                  className={`rounded-lg px-3 py-1 text-xs font-black ${
                    form.status === "active"
                      ? "bg-emerald-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {form.status.toUpperCase()}
                </span>
              </div>

              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-200">
                {form.textBn || "বাংলা নোটিশ প্রিভিউ এখানে দেখাবে..."}
              </p>
            </div>

            <div className="rounded-2xl border border-[#1A79D3]/20 bg-black/40 p-5">
              <div className="mb-3">
                <span className="rounded-lg bg-[#3ea0ff] px-3 py-1 text-xs font-black text-white">
                  English
                </span>
              </div>

              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-200">
                {form.textEn || "English notice preview will show here..."}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddNotice;
