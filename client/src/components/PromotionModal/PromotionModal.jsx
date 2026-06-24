import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Gift,
  ChevronLeft,
  ChevronRight,
  Eye,
  ArrowLeft,
  Search,
} from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";
import { api } from "../../api/axios";

const PER_PAGE = 7;

const CATEGORIES = [
  "All",
  "Welcome Offer",
  "Slots",
  "Live Casino",
  "Sports",
  "Fishing",
  "Lottery",
  "Table",
  "Arcade",
  "Crash",
];

const PromotionModal = ({ open, onClose }) => {
  const { isBangla } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const t = {
    title: isBangla ? "প্রোমোশন" : "Promotions",
    loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
    empty: isBangla ? "কোন প্রোমোশন পাওয়া যায়নি" : "No promotion found",
    noCategory: isBangla
      ? "এই ক্যাটাগরিতে কোনো প্রোমোশন নেই"
      : "No promotion found in this category",
    noSearch: isBangla
      ? "এই নামে কোনো প্রোমোশন পাওয়া যায়নি"
      : "No promotion found by this title",
    view: isBangla ? "বিস্তারিত দেখুন" : "View Details",
    back: isBangla ? "ফিরে যান" : "Back",
    category: isBangla ? "ক্যাটাগরি" : "Category",
    all: isBangla ? "সব" : "All",
    searchPlaceholder: isBangla ? "টাইটেল দিয়ে সার্চ করুন" : "Search by title",
  };

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/promotions/active/list");
      setPromotions(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (error) {
      console.error("Failed to load promotions:", error);
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchPromotions();
      setPage(1);
      setSelected(null);
      setCategory("All");
      setSearch("");
    }
  }, [open]);

  const getTitle = (item) =>
    isBangla
      ? item?.title?.bn || item?.title?.en || ""
      : item?.title?.en || item?.title?.bn || "";

  const getDescription = (item) =>
    isBangla
      ? item?.description?.bn || item?.description?.en || ""
      : item?.description?.en || item?.description?.bn || "";

  const filteredPromotions = useMemo(() => {
    const s = String(search || "")
      .trim()
      .toLowerCase();

    return promotions.filter((item) => {
      const categoryOk = category === "All" || item?.category === category;

      const titleBn = String(item?.title?.bn || "").toLowerCase();
      const titleEn = String(item?.title?.en || "").toLowerCase();
      const titleOk = !s || titleBn.includes(s) || titleEn.includes(s);

      return categoryOk && titleOk;
    });
  }, [promotions, category, search]);

  useEffect(() => {
    setPage(1);
    setSelected(null);
  }, [category, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPromotions.length / PER_PAGE),
  );

  const pageItems = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filteredPromotions.slice(start, start + PER_PAGE);
  }, [filteredPromotions, page]);

  const emptyText = useMemo(() => {
    if (search.trim()) return t.noSearch;
    if (category !== "All") return t.noCategory;
    return t.empty;
  }, [search, category, t.noSearch, t.noCategory, t.empty]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/45 px-0 backdrop-blur-[3px] sm:px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative flex h-screen w-full flex-col overflow-hidden bg-[#f3f7fb] shadow-2xl sm:h-[700px] sm:max-w-[430px] sm:rounded-[8px]"
          >
            <div className="relative flex h-[50px] shrink-0 items-center justify-center bg-[#0865a9] text-white">
              {selected ? (
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="absolute left-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center text-white"
                >
                  <ArrowLeft size={24} />
                </button>
              ) : null}

              <h2 className="text-[18px] font-semibold">{t.title}</h2>

              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center text-white"
              >
                <X size={24} />
              </button>
            </div>

            {selected ? (
              <div className="flex-1 overflow-y-auto bg-[#f3f7fb] p-3">
                <div className="overflow-hidden rounded-[8px] bg-white shadow">
                  {selected?.imageUrl ? (
                    <img
                      src={selected.imageUrl}
                      alt={getTitle(selected)}
                      className="h-[180px] w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-[180px] w-full items-center justify-center bg-[#eaf4ff] text-[#0865a9]">
                      <Gift size={54} />
                    </div>
                  )}

                  <div className="p-4">
                    <div className="mb-2 inline-flex rounded-full bg-[#eaf4ff] px-3 py-1 text-[12px] font-semibold text-[#0865a9]">
                      {t.category}: {selected?.category || "-"}
                    </div>

                    <h3 className="text-[20px] font-bold leading-7 text-[#0865a9]">
                      {getTitle(selected)}
                    </h3>

                    <p className="mt-3 whitespace-pre-line text-[14px] leading-6 text-[#555]">
                      {getDescription(selected)}
                    </p>

                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[6px] bg-[#0865a9] px-4 py-3 text-[14px] font-semibold text-white"
                    >
                      <ArrowLeft size={18} />
                      {t.back}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="shrink-0 border-b border-[#d9e7f5] bg-white p-3">
                  <div className="grid grid-cols-1 gap-2">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="h-[38px] w-full cursor-pointer rounded-[6px] border border-[#d9e7f5] bg-[#f3f7fb] px-3 text-[13px] font-semibold text-[#0865a9] outline-none focus:border-[#0865a9]"
                    >
                      {CATEGORIES.map((item) => (
                        <option key={item} value={item}>
                          {item === "All" ? t.all : item}
                        </option>
                      ))}
                    </select>

                    <div className="relative">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0865a9]"
                      />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t.searchPlaceholder}
                        className="h-[38px] w-full rounded-[6px] border border-[#d9e7f5] bg-[#f3f7fb] pl-9 pr-3 text-[13px] font-semibold text-[#0865a9] outline-none placeholder:text-[#7ea6c5] focus:border-[#0865a9]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-[#f3f7fb] p-3">
                  {loading ? (
                    <div className="flex h-full items-center justify-center text-[#0865a9]">
                      {t.loading}
                    </div>
                  ) : pageItems.length === 0 ? (
                    <div className="flex h-full items-center justify-center px-5 text-center">
                      <div>
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#eaf4ff] text-[#0865a9]">
                          <Gift size={42} />
                        </div>
                        <h3 className="mt-5 text-[22px] font-bold text-[#0865a9]">
                          {emptyText}
                        </h3>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pageItems.map((item) => (
                        <div
                          key={item._id}
                          className="overflow-hidden rounded-[8px] bg-white shadow"
                        >
                          {item?.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={getTitle(item)}
                              className="h-[125px] w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-[125px] w-full items-center justify-center bg-[#eaf4ff] text-[#0865a9]">
                              <Gift size={42} />
                            </div>
                          )}

                          <div className="p-3">
                            <div className="mb-1 inline-flex rounded-full bg-[#eaf4ff] px-2 py-[2px] text-[11px] font-semibold text-[#0865a9]">
                              {item?.category || "-"}
                            </div>

                            <h3 className="line-clamp-2 text-[16px] font-bold leading-6 text-[#0865a9]">
                              {getTitle(item)}
                            </h3>

                            <button
                              type="button"
                              onClick={() => setSelected(item)}
                              className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[6px] bg-[#0865a9] px-4 py-2.5 text-[13px] font-semibold text-white"
                            >
                              <Eye size={16} />
                              {t.view}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex h-[54px] shrink-0 items-center justify-between border-t border-[#d9e7f5] bg-white px-3">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="flex cursor-pointer items-center gap-1 rounded-[6px] bg-[#0865a9] px-3 py-2 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                    Prev
                  </button>

                  <div className="text-[13px] font-semibold text-[#0865a9]">
                    {page} / {totalPages}
                  </div>

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="flex cursor-pointer items-center gap-1 rounded-[6px] bg-[#0865a9] px-3 py-2 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PromotionModal;
