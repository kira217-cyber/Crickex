import React, { useEffect, useState } from "react";
import {
  Edit,
  ImagePlus,
  Loader2,
  PlusCircle,
  RefreshCw,
  Save,
  Sliders,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const API_URL = import.meta.env.VITE_API_URL;

const emptyForm = {
  desktopImage: null,
  mobileImage: null,
  order: "",
  status: "active",
};

const fileUrl = (path = "") => {
  if (!path) return "";
  if (String(path).startsWith("http")) return path;
  return `${API_URL}${String(path).startsWith("/") ? path : `/${path}`}`;
};

const AddSlider = () => {
  const [form, setForm] = useState(emptyForm);
  const [sliders, setSliders] = useState([]);
  const [editing, setEditing] = useState(null);

  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  const [desktopPreview, setDesktopPreview] = useState("");
  const [mobilePreview, setMobilePreview] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const inputClass =
    "w-full rounded-xl border border-[#1A79D3]/25 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#3ea0ff] focus:ring-2 focus:ring-[#1A79D3]/20";

  const labelClass = "mb-2 block text-sm font-bold text-blue-100";

  const loadSliders = async () => {
    try {
      setListLoading(true);

      const res = await api.get("/api/sliders", {
        params: {
          status: statusFilter,
          limit: 100,
        },
      });

      setSliders(res.data?.data?.sliders || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load sliders");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadSliders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    if (form.desktopImage instanceof File) {
      const url = URL.createObjectURL(form.desktopImage);
      setDesktopPreview(url);
      return () => URL.revokeObjectURL(url);
    }

    if (editing?.desktopImageUrl) {
      setDesktopPreview(editing.desktopImageUrl);
      return;
    }

    if (editing?.desktopImage) {
      setDesktopPreview(fileUrl(editing.desktopImage));
      return;
    }

    setDesktopPreview("");
  }, [form.desktopImage, editing]);

  useEffect(() => {
    if (form.mobileImage instanceof File) {
      const url = URL.createObjectURL(form.mobileImage);
      setMobilePreview(url);
      return () => URL.revokeObjectURL(url);
    }

    if (editing?.mobileImageUrl) {
      setMobilePreview(editing.mobileImageUrl);
      return;
    }

    if (editing?.mobileImage) {
      setMobilePreview(fileUrl(editing.mobileImage));
      return;
    }

    setMobilePreview("");
  }, [form.mobileImage, editing]);

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm);
    setDesktopPreview("");
    setMobilePreview("");
  };

  const startEdit = (slider) => {
    setEditing(slider);

    setForm({
      desktopImage: null,
      mobileImage: null,
      order: slider?.order ? String(slider.order) : "",
      status: slider?.status || "active",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editing && !(form.desktopImage instanceof File)) {
      return toast.error("Desktop slider image is required");
    }

    if (!editing && !(form.mobileImage instanceof File)) {
      return toast.error("Mobile slider image is required");
    }

    try {
      setLoading(true);

      const fd = new FormData();

      fd.append("order", String(form.order || "0"));
      fd.append("status", form.status);

      if (form.desktopImage instanceof File) {
        fd.append("desktopImage", form.desktopImage);
      }

      if (form.mobileImage instanceof File) {
        fd.append("mobileImage", form.mobileImage);
      }

      if (editing?._id) {
        await api.put(`/api/sliders/${editing._id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success("Slider updated successfully");
      } else {
        await api.post("/api/sliders", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success("Slider created successfully");
      }

      await loadSliders();
      resetForm();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this slider?");
    if (!ok) return;

    try {
      await api.delete(`/api/sliders/${id}`);

      toast.success("Slider deleted successfully");
      setSliders((prev) => prev.filter((item) => item._id !== id));

      if (editing?._id === id) resetForm();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete slider");
    }
  };

  return (
    <div className="space-y-6 text-white">
      <section className="relative overflow-hidden rounded-3xl border border-[#1A79D3]/20 bg-gradient-to-r from-black/80 via-[#06182a] to-black/80 p-6 shadow-2xl shadow-black/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,121,211,0.30),transparent_35%)]" />

        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] shadow-lg shadow-[#1A79D3]/40">
              <Sliders className="h-9 w-9" />
            </div>

            <h1 className="text-3xl font-black md:text-4xl">
              Slider{" "}
              <span className="bg-gradient-to-r from-[#3ea0ff] to-blue-100 bg-clip-text text-transparent">
                Management
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Upload separate desktop and mobile slider images. Both previews
              are landscape, mobile preview is smaller.
            </p>
          </div>

          <div className="rounded-2xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 p-5">
            <p className="text-sm font-black text-blue-100">Total Sliders</p>
            <p className="mt-1 text-3xl font-black text-[#3ea0ff]">
              {sliders.length}
            </p>
          </div>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"
      >
        <div className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">
                {editing ? "Update Slider" : "Create Slider"}
              </h2>
              <p className="text-sm text-slate-400">
                Desktop image and mobile image both are required when creating.
              </p>
            </div>

            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-200 hover:bg-red-500/20"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className={labelClass}>Order Number</label>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
                placeholder="0"
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

            <div className="md:col-span-2">
              <LandscapeFileInput
                label="Desktop Slider Image"
                preview={desktopPreview}
                onChange={(file) => setForm({ ...form, desktopImage: file })}
                helpText="Landscape desktop image"
              />
            </div>

            <div className="md:col-span-2">
              <SmallLandscapeFileInput
                label="Mobile Slider Image"
                preview={mobilePreview}
                onChange={(file) => setForm({ ...form, mobileImage: file })}
                helpText="Landscape mobile image"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-[#1A79D3]/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : editing ? (
              <Save className="h-5 w-5" />
            ) : (
              <PlusCircle className="h-5 w-5" />
            )}

            {loading
              ? "Saving..."
              : editing
                ? "Update Slider"
                : "Create Slider"}
          </button>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
            <h2 className="text-xl font-black">Desktop Preview</h2>

            <div className="mt-5 aspect-video w-full overflow-hidden rounded-xl border border-[#1A79D3]/30 bg-[#06182a]">
              {desktopPreview ? (
                <img
                  src={desktopPreview}
                  alt="Desktop Slider"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImagePlus className="h-14 w-14 text-slate-500" />
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
            <h2 className="text-xl font-black">Mobile Preview</h2>

            <div className="mx-auto mt-5 aspect-video w-full max-w-[320px] overflow-hidden rounded-xl border border-[#1A79D3]/30 bg-[#06182a]">
              {mobilePreview ? (
                <img
                  src={mobilePreview}
                  alt="Mobile Slider"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImagePlus className="h-12 w-12 text-slate-500" />
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-center gap-2">
              <span className="rounded-lg bg-[#3ea0ff] px-3 py-1 text-xs font-black text-white">
                #{form.order || 0}
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
          </div>
        </div>
      </form>

      <section className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
        <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-xl font-black">Slider List</h2>
            <p className="text-sm text-slate-400">
              Total {sliders.length} sliders found
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-[150px_120px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`${inputClass} cursor-pointer`}
            >
              <option className="bg-[#050607]" value="">
                All Status
              </option>
              <option className="bg-[#050607]" value="active">
                Active
              </option>
              <option className="bg-[#050607]" value="inactive">
                Inactive
              </option>
            </select>

            <button
              type="button"
              onClick={loadSliders}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-4 py-3 text-sm font-black text-blue-100 hover:bg-[#1A79D3]/20"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {listLoading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#3ea0ff]" />
          </div>
        ) : sliders.length === 0 ? (
          <div className="rounded-2xl border border-[#1A79D3]/20 bg-black/30 p-10 text-center text-slate-400">
            No sliders found.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sliders.map((slider) => (
              <div
                key={slider._id}
                className="overflow-hidden rounded-2xl border border-[#1A79D3]/20 bg-black/30 shadow-xl transition hover:-translate-y-1 hover:border-[#3ea0ff]/50"
              >
                <div className="aspect-video w-full bg-[#06182a]">
                  {slider.desktopImageUrl || slider.desktopImage ? (
                    <img
                      src={
                        slider.desktopImageUrl || fileUrl(slider.desktopImage)
                      }
                      alt="Desktop Slider"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImagePlus className="h-12 w-12 text-slate-600" />
                    </div>
                  )}
                </div>

                <div className="p-5 text-center">
                  <div className="mx-auto mb-4 aspect-video w-full max-w-[220px] overflow-hidden rounded-xl border border-[#1A79D3]/25 bg-[#06182a]">
                    {slider.mobileImageUrl || slider.mobileImage ? (
                      <img
                        src={
                          slider.mobileImageUrl || fileUrl(slider.mobileImage)
                        }
                        alt="Mobile Slider"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImagePlus className="h-8 w-8 text-slate-600" />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center gap-2">
                    <span className="rounded-lg bg-[#3ea0ff] px-3 py-1 text-xs font-black text-white">
                      #{slider.order || 0}
                    </span>

                    <span
                      className={`rounded-lg px-3 py-1 text-xs font-black ${
                        slider.status === "active"
                          ? "bg-emerald-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {slider.status?.toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => startEdit(slider)}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-4 py-2.5 text-sm font-black text-blue-100 hover:bg-[#1A79D3]/20"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(slider._id)}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-black text-red-200 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>

                  <p className="mt-4 truncate text-[11px] text-slate-600">
                    ID: {slider._id}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const LandscapeFileInput = ({ label, preview, onChange, helpText }) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-blue-100">
        {label}
      </label>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#1A79D3]/40 bg-black/40 p-4 text-center transition hover:border-[#3ea0ff] hover:bg-[#1A79D3]/10">
        {preview ? (
          <img
            src={preview}
            alt="Desktop Preview"
            className="aspect-video w-full rounded-xl object-cover"
          />
        ) : (
          <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl bg-black/30">
            <ImagePlus className="mb-3 h-10 w-10 text-[#3ea0ff]" />
            <p className="text-sm font-black text-slate-100">
              Click to upload desktop image
            </p>
            <p className="mt-1 text-xs text-slate-500">{helpText}</p>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          className="hidden"
        />
      </label>
    </div>
  );
};

const SmallLandscapeFileInput = ({ label, preview, onChange, helpText }) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-blue-100">
        {label}
      </label>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#1A79D3]/40 bg-black/40 p-4 text-center transition hover:border-[#3ea0ff] hover:bg-[#1A79D3]/10">
        {preview ? (
          <img
            src={preview}
            alt="Mobile Preview"
            className="mx-auto aspect-video w-full max-w-[320px] rounded-xl object-cover"
          />
        ) : (
          <div className="mx-auto flex aspect-video w-full max-w-[320px] flex-col items-center justify-center rounded-xl bg-black/30">
            <ImagePlus className="mb-3 h-10 w-10 text-[#3ea0ff]" />
            <p className="text-sm font-black text-slate-100">
              Click to upload mobile image
            </p>
            <p className="mt-1 text-xs text-slate-500">{helpText}</p>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          className="hidden"
        />
      </label>
    </div>
  );
};

export default AddSlider;
