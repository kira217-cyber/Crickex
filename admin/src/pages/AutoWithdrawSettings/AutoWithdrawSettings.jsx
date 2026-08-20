import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import {
  FaCog,
  FaKey,
  FaToggleOn,
  FaToggleOff,
  FaSave,
  FaSyncAlt,
  FaTrash,
  FaPlus,
  FaShieldAlt,
  FaMoneyBillWave,
  FaWallet,
  FaLink,
  FaCopy,
  FaImage,
} from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

const OPAY_METHODS = ["bkash", "nagad", "rocket", "upay"];

const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${import.meta.env.VITE_API_URL}${url}`;
};

const emptyMethod = () => ({
  _id: `${Date.now()}-${Math.random()}`,
  methodId: "",
  opayMethod: "bkash",
  name: { bn: "", en: "" },
  logoUrl: "",
  minAmount: 0,
  maxAmount: 0,
  isActive: true,
  order: 0,
});

const cardClass =
  "rounded-3xl border border-blue-200/15 bg-black/30 backdrop-blur-xl shadow-[0_20px_80px_rgba(47,121,201,0.18)]";

const inputClass =
  "w-full rounded-2xl border border-blue-200/15 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/25 placeholder:text-blue-100/35";

const labelClass =
  "text-[12px] font-extrabold uppercase tracking-wide text-blue-100/70";

const AutoWithdrawSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [methods, setMethods] = useState([]);
  const [deleteId, setDeleteId] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [uploadingId, setUploadingId] = useState("");

  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      businessToken: "",
      active: false,
      minAmount: 50,
      maxAmount: 500000,
    },
  });

  const active = watch("active");

  const loadSettings = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/api/auto-withdraw/admin");

      if (!data?.success) {
        throw new Error(data?.message || "Failed to load settings");
      }

      reset({
        businessToken: data?.data?.businessToken || "",
        active: !!data?.data?.active,
        minAmount: Number(data?.data?.minAmount || 50),
        maxAmount: Number(data?.data?.maxAmount || 500000),
      });

      setWebhookUrl(data?.data?.webhookUrl || "");

      setMethods(
        Array.isArray(data?.data?.methods)
          ? data.data.methods.map((item, idx) => ({
              _id: item?._id || `${Date.now()}-${idx}`,
              methodId: item?.methodId || "",
              opayMethod: OPAY_METHODS.includes(item?.opayMethod)
                ? item.opayMethod
                : "bkash",
              name: {
                bn: item?.name?.bn || "",
                en: item?.name?.en || "",
              },
              logoUrl: item?.logoUrl || "",
              minAmount: Number(item?.minAmount || 0),
              maxAmount: Number(item?.maxAmount || 0),
              isActive: item?.isActive !== false,
              order: Number(item?.order ?? idx),
            }))
          : [],
      );
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Load failed",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const addMethod = () => {
    setMethods((prev) => [...prev, { ...emptyMethod(), order: prev.length }]);
  };

  const updateMethod = (id, key, value) => {
    setMethods((prev) =>
      prev.map((item) => {
        if (item._id !== id) return item;

        if (key === "name.bn") {
          return { ...item, name: { ...item.name, bn: value } };
        }

        if (key === "name.en") {
          return { ...item, name: { ...item.name, en: value } };
        }

        return { ...item, [key]: value };
      }),
    );
  };

  const confirmDeleteMethod = () => {
    setMethods((prev) =>
      prev
        .filter((item) => item._id !== deleteId)
        .map((item, idx) => ({ ...item, order: idx })),
    );

    setDeleteId("");
    toast.info("Method removed");
  };

  const handleLogoUpload = async (id, file) => {
    if (!file) return;

    try {
      setUploadingId(id);

      const body = new FormData();
      body.append("logo", file);

      const { data } = await api.post(
        "/api/auto-withdraw/admin/upload-logo",
        body,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      if (!data?.success || !data?.data?.logoUrl) {
        throw new Error(data?.message || "Upload failed");
      }

      updateMethod(id, "logoUrl", data.data.logoUrl);
      toast.success("Logo uploaded");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Upload failed",
      );
    } finally {
      setUploadingId("");
    }
  };

  const copyWebhook = async () => {
    if (!webhookUrl) return;

    try {
      await navigator.clipboard.writeText(webhookUrl);
      toast.success("Webhook URL copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const onSubmit = async (values) => {
    try {
      setSaving(true);

      const min = Math.floor(Number(values.minAmount || 0));
      const max = Math.floor(Number(values.maxAmount || 0));

      if (!min || min < 1) {
        toast.error("Minimum amount invalid");
        return;
      }

      if (max > 0 && min > max) {
        toast.error("Minimum cannot be greater than maximum");
        return;
      }

      const sanitizedMethods = methods.map((item, idx) => ({
        methodId: String(item?.methodId || "").trim().toUpperCase(),
        opayMethod: OPAY_METHODS.includes(item?.opayMethod)
          ? item.opayMethod
          : "bkash",
        name: {
          bn: String(item?.name?.bn || "").trim(),
          en: String(item?.name?.en || "").trim(),
        },
        logoUrl: String(item?.logoUrl || "").trim(),
        minAmount: Math.max(0, Math.floor(Number(item?.minAmount || 0))),
        maxAmount: Math.max(0, Math.floor(Number(item?.maxAmount || 0))),
        isActive: item?.isActive !== false,
        order: idx,
      }));

      const seen = new Set();

      for (const item of sanitizedMethods) {
        if (!item.methodId) {
          toast.error("Every method needs a Method ID");
          return;
        }

        if (seen.has(item.methodId)) {
          toast.error(`Duplicate Method ID: ${item.methodId}`);
          return;
        }

        seen.add(item.methodId);

        if (!item.name.bn || !item.name.en) {
          toast.error(`${item.methodId} needs Bangla and English name`);
          return;
        }

        if (item.maxAmount > 0 && item.minAmount > item.maxAmount) {
          toast.error(`${item.methodId}: minimum cannot exceed maximum`);
          return;
        }
      }

      const { data } = await api.put("/api/auto-withdraw/admin", {
        businessToken: String(values.businessToken || "").trim(),
        active: !!values.active,
        minAmount: min,
        maxAmount: max,
        methods: sanitizedMethods,
      });

      if (!data?.success) {
        throw new Error(data?.message || "Save failed");
      }

      toast.success("Auto withdraw settings updated");
      await loadSettings();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Save failed",
      );
    } finally {
      setSaving(false);
    }
  };

  const activeCount = useMemo(
    () => methods.filter((item) => item.isActive).length,
    [methods],
  );

  if (loading) {
    return (
      <div className="p-4 lg:p-6">
        <div className={`${cardClass} p-8 text-center text-blue-100`}>
          Loading auto withdraw settings...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="overflow-hidden rounded-[28px] border border-blue-200/15 bg-gradient-to-r from-black/80 via-[#2f79c9]/40 to-black/80 text-white shadow-[0_20px_80px_rgba(47,121,201,0.22)] backdrop-blur-xl">
          <div className="px-5 py-5 md:px-6 md:py-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] shadow-lg shadow-blue-700/40">
                  <FaCog className="text-2xl text-white" />
                </div>

                <div>
                  <h1 className="text-2xl font-black tracking-tight md:text-3xl">
                    Auto Withdraw Settings
                  </h1>
                  <p className="mt-1 text-sm font-medium text-blue-100/75">
                    Manage OraclePay token, withdraw limits and wallet methods.
                  </p>
                </div>
              </div>

              <div
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black ${
                  active
                    ? "border-emerald-300/30 bg-emerald-400/15 text-emerald-200"
                    : "border-red-300/30 bg-red-400/15 text-red-200"
                }`}
              >
                {active ? <FaToggleOn /> : <FaToggleOff />}
                {active ? "AUTO WITHDRAW ACTIVE" : "AUTO WITHDRAW INACTIVE"}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className={`${cardClass} p-5 md:p-6`}>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] shadow-lg shadow-blue-700/30">
                  <FaKey className="text-lg text-white" />
                </div>

                <div>
                  <div className="text-lg font-black">Business Token</div>
                  <div className="text-xs font-medium text-blue-100/65">
                    OraclePay business token used to send money out.
                  </div>
                </div>
              </div>

              <div className="relative mt-5">
                <input
                  {...register("businessToken")}
                  type={showToken ? "text" : "password"}
                  placeholder="Paste your business token"
                  className={`${inputClass} pr-14 font-mono text-sm`}
                />

                <button
                  type="button"
                  onClick={() => setShowToken((v) => !v)}
                  className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-xl border border-blue-200/15 bg-white/5 text-blue-100 transition hover:bg-white/10"
                >
                  {showToken ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="mt-5 rounded-2xl border border-blue-200/10 bg-gradient-to-r from-[#63a8ee]/10 to-[#2f79c9]/10 p-4">
                <label className="inline-flex cursor-pointer items-center gap-3 font-bold text-white">
                  <input
                    type="checkbox"
                    {...register("active")}
                    className="h-5 w-5 cursor-pointer accent-[#2f79c9]"
                  />
                  <span>Enable Auto Withdraw</span>
                </label>

                <p className="mt-2 text-sm text-blue-100/65">
                  When enabled, users can send withdrawals straight to their
                  wallet without waiting for manual approval.
                </p>
              </div>

              <div className="mt-5 rounded-2xl border border-blue-200/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 font-bold text-white">
                  <FaLink className="text-[#8fc2f5]" />
                  Webhook URL
                </div>

                <p className="mt-2 text-sm text-blue-100/65">
                  OraclePay posts withdrawal updates here. It is generated
                  automatically and includes a secret, so keep it private.
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <input
                    readOnly
                    value={webhookUrl || "PUBLIC_BACKEND_URL is not configured"}
                    className={`${inputClass} font-mono text-xs`}
                  />

                  <button
                    type="button"
                    onClick={copyWebhook}
                    disabled={!webhookUrl}
                    className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-blue-200/15 bg-white/5 text-blue-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FaCopy />
                  </button>
                </div>
              </div>
            </div>

            <div className={`${cardClass} p-5 md:p-6`}>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] shadow-lg shadow-blue-700/30">
                  <FaMoneyBillWave className="text-lg text-white" />
                </div>

                <div>
                  <div className="text-lg font-black">Withdraw Limits</div>
                  <div className="text-xs font-medium text-blue-100/65">
                    Global minimum and maximum for every method.
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label className={labelClass}>Minimum Amount</label>
                  <input
                    {...register("minAmount")}
                    type="number"
                    placeholder="Minimum withdraw amount"
                    className={`${inputClass} mt-2`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Maximum Amount</label>
                  <input
                    {...register("maxAmount")}
                    type="number"
                    placeholder="Maximum withdraw amount"
                    className={`${inputClass} mt-2`}
                  />
                </div>

                <div className="rounded-2xl border border-blue-200/10 bg-white/5 p-4 text-sm text-blue-100/70">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <FaShieldAlt className="text-[#8fc2f5]" />
                    Limit Note
                  </div>
                  <p className="mt-2">
                    If maximum amount is 0, it will be treated as unlimited. A
                    method can tighten these limits but never loosen them.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={`${cardClass} overflow-hidden`}>
            <div className="flex flex-col gap-3 border-b border-blue-200/10 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
              <div>
                <h2 className="text-xl font-black">Withdraw Methods</h2>
                <p className="mt-1 text-sm text-blue-100/65">
                  Active method: {activeCount} / Total method: {methods.length}
                </p>
              </div>

              <button
                type="button"
                onClick={addMethod}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-5 py-3 font-extrabold text-white shadow-lg shadow-blue-700/30 transition hover:from-[#7bb7f1] hover:to-[#3b88db]"
              >
                <FaPlus />
                Add Method
              </button>
            </div>

            <div className="space-y-5 p-5 md:p-6">
              {methods.length === 0 ? (
                <div className="rounded-2xl border border-blue-200/10 bg-white/5 p-8 text-center text-blue-100/70">
                  No withdraw method added yet. Users will not see auto withdraw
                  until at least one active method exists.
                </div>
              ) : (
                methods.map((item, idx) => (
                  <div
                    key={item._id}
                    className="rounded-2xl border border-blue-200/10 bg-white/5 p-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] text-white">
                          <FaWallet />
                        </div>

                        <div>
                          <div className="font-black text-white">
                            {item.methodId || `Method ${idx + 1}`}
                          </div>
                          <div className="text-xs text-blue-100/60">
                            Sends to OraclePay as &quot;{item.opayMethod}&quot;
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-white">
                          <input
                            type="checkbox"
                            checked={item.isActive}
                            onChange={(e) =>
                              updateMethod(
                                item._id,
                                "isActive",
                                e.target.checked,
                              )
                            }
                            className="h-5 w-5 cursor-pointer accent-[#2f79c9]"
                          />
                          Active
                        </label>

                        <button
                          type="button"
                          onClick={() => setDeleteId(item._id)}
                          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-red-300/20 bg-red-400/10 text-red-200 transition hover:bg-red-400/20"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <div>
                        <label className={labelClass}>Method ID</label>
                        <input
                          value={item.methodId}
                          onChange={(e) =>
                            updateMethod(
                              item._id,
                              "methodId",
                              e.target.value.toUpperCase(),
                            )
                          }
                          placeholder="BKASH / NAGAD / ROCKET"
                          className={`${inputClass} mt-2`}
                        />
                        <p className="mt-2 text-[11px] text-blue-100/50">
                          Must match the method id on the user&apos;s saved
                          wallet.
                        </p>
                      </div>

                      <div>
                        <label className={labelClass}>Wallet Type</label>
                        <select
                          value={item.opayMethod}
                          onChange={(e) =>
                            updateMethod(item._id, "opayMethod", e.target.value)
                          }
                          className={`${inputClass} mt-2`}
                        >
                          {OPAY_METHODS.map((key) => (
                            <option key={key} value={key} className="bg-black">
                              {key}
                            </option>
                          ))}
                        </select>
                        <p className="mt-2 text-[11px] text-blue-100/50">
                          The wallet OraclePay will send the money to.
                        </p>
                      </div>

                      <div>
                        <label className={labelClass}>Logo</label>

                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-blue-200/15 bg-black/40">
                            {item.logoUrl ? (
                              <img
                                src={getImageUrl(item.logoUrl)}
                                alt={item.methodId || "logo"}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <FaImage className="text-blue-100/40" />
                            )}
                          </div>

                          <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-blue-200/25 bg-black/30 px-4 py-3 text-xs font-bold text-blue-100/75 transition hover:bg-white/5">
                            <FaImage />
                            {uploadingId === item._id
                              ? "Uploading..."
                              : item.logoUrl
                                ? "Change image"
                                : "Upload image"}

                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploadingId === item._id}
                              onChange={(e) => {
                                handleLogoUpload(item._id, e.target.files?.[0]);
                                e.target.value = "";
                              }}
                            />
                          </label>

                          {item.logoUrl ? (
                            <button
                              type="button"
                              onClick={() =>
                                updateMethod(item._id, "logoUrl", "")
                              }
                              className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-red-300/20 bg-red-400/10 text-red-200 transition hover:bg-red-400/20"
                            >
                              <FaTrash />
                            </button>
                          ) : null}
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Name (Bangla)</label>
                        <input
                          value={item.name.bn}
                          onChange={(e) =>
                            updateMethod(item._id, "name.bn", e.target.value)
                          }
                          placeholder="বিকাশ"
                          className={`${inputClass} mt-2`}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Name (English)</label>
                        <input
                          value={item.name.en}
                          onChange={(e) =>
                            updateMethod(item._id, "name.en", e.target.value)
                          }
                          placeholder="bKash"
                          className={`${inputClass} mt-2`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Min</label>
                          <input
                            type="number"
                            value={item.minAmount}
                            onChange={(e) =>
                              updateMethod(
                                item._id,
                                "minAmount",
                                e.target.value,
                              )
                            }
                            className={`${inputClass} mt-2`}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Max</label>
                          <input
                            type="number"
                            value={item.maxAmount}
                            onChange={(e) =>
                              updateMethod(
                                item._id,
                                "maxAmount",
                                e.target.value,
                              )
                            }
                            className={`${inputClass} mt-2`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={loadSettings}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-blue-200/15 bg-black/35 px-5 py-3 font-extrabold text-blue-50 transition hover:bg-white/10"
            >
              <FaSyncAlt />
              Refresh
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-6 py-3 font-extrabold text-white shadow-lg shadow-blue-700/30 transition hover:from-[#7bb7f1] hover:to-[#3b88db] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaSave />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>

      {deleteId ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setDeleteId("")}
          />

          <div className="relative w-full max-w-md rounded-[28px] border border-red-300/20 bg-gradient-to-br from-black via-[#2f79c9]/20 to-black p-6 text-white shadow-2xl">
            <div className="text-2xl font-black">Delete Method?</div>
            <div className="mt-2 text-sm text-blue-100/70">
              এই method delete করলে এটা permanently remove হয়ে যাবে।
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteId("")}
                className="cursor-pointer rounded-2xl border border-blue-200/15 bg-white/5 px-4 py-3 font-bold transition hover:bg-white/10"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteMethod}
                className="cursor-pointer rounded-2xl bg-red-500 px-4 py-3 font-extrabold text-white transition hover:bg-red-400"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AutoWithdrawSettings;
