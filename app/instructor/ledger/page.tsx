"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, DollarSign, Plus, X,
  Loader2, ChevronLeft, ChevronRight, Receipt,
} from "lucide-react";

interface LedgerEntry {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  date: string;
}

const INCOME_CATS = ["강사료", "교통비 지원", "재료비 지원", "기타 수입"];
const EXPENSE_CATS = ["교통비", "재료비", "교구 구입", "보험료", "통신비", "식비", "기타 지출"];

export default function LedgerPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formType, setFormType] = useState<"income" | "expense">("income");
  const [form, setForm] = useState({ amount: "", description: "", category: "", date: today.toISOString().slice(0, 10) });

  // 출강이력에서 수입 자동 로드
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/teaching-records?status=confirmed&limit=200");
      if (res.ok) {
        const json = await res.json();
        const incomes: LedgerEntry[] = (json.data || [])
          .filter((r: { fee: number | null }) => r.fee && r.fee > 0)
          .map((r: { id: string; fee: number; schoolName: string; date: string; subject: string }) => ({
            id: `tr-${r.id}`,
            type: "income" as const,
            amount: r.fee,
            description: `${r.schoolName} - ${r.subject}`,
            category: "강사료",
            date: r.date,
          }));
        // TODO: 지출은 별도 API에서 로드 (현재는 localStorage)
        const saved = localStorage.getItem("naisser_expenses");
        const expenses: LedgerEntry[] = saved ? JSON.parse(saved) : [];
        setEntries([...incomes, ...expenses]);
      }
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // 지출 추가
  const addEntry = () => {
    if (!form.amount || !form.category) return;
    const entry: LedgerEntry = {
      id: `exp-${Date.now()}`,
      type: formType,
      amount: parseInt(form.amount),
      description: form.description || form.category,
      category: form.category,
      date: form.date,
    };
    const newEntries = [...entries, entry];
    setEntries(newEntries);
    // localStorage에 지출만 저장
    const expenses = newEntries.filter((e) => e.type === "expense" || e.id.startsWith("exp-"));
    localStorage.setItem("naisser_expenses", JSON.stringify(expenses.filter((e) => e.type === "expense")));
    setShowAddForm(false);
    setForm({ amount: "", description: "", category: "", date: today.toISOString().slice(0, 10) });
  };

  // 월별 필터
  const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthEntries = useMemo(
    () => entries.filter((e) => e.date.startsWith(monthStr)).sort((a, b) => b.date.localeCompare(a.date)),
    [entries, monthStr]
  );

  const totalIncome = monthEntries.filter((e) => e.type === "income").reduce((s, e) => s + e.amount, 0);
  const totalExpense = monthEntries.filter((e) => e.type === "expense").reduce((s, e) => s + e.amount, 0);
  const netIncome = totalIncome - totalExpense;

  const prevMonth = () => { if (month === 0) { setYear(year - 1); setMonth(11); } else setMonth(month - 1); };
  const nextMonth = () => { if (month === 11) { setYear(year + 1); setMonth(0); } else setMonth(month + 1); };

  const formatWon = (n: number) => {
    if (n >= 10000) return `${(n / 10000).toFixed(n % 10000 === 0 ? 0 : 1)}만원`;
    return `${n.toLocaleString()}원`;
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-6 h-6 animate-spin text-[#0088ff]" /></div>;
  }

  return (
    <div className="min-h-screen page-bg-mesh page-bg-mesh-blue page-bg-dots px-5 pt-4 pb-24">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">수입/지출</h1>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white"
          style={{ background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)" }}>
          <Plus className="w-3.5 h-3.5" /> 추가
        </motion.button>
      </motion.div>

      {/* 월 네비 */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-bold text-gray-900">{year}년 {month + 1}월</span>
        <button onClick={nextMonth} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="p-3 rounded-2xl text-center" style={{ background: "rgba(37,99,235,0.06)" }}>
          <TrendingUp className="w-4 h-4 text-blue-500 mx-auto mb-1" />
          <p className="text-sm font-bold text-blue-600">{formatWon(totalIncome)}</p>
          <p className="text-[10px] text-gray-400">수입</p>
        </div>
        <div className="p-3 rounded-2xl text-center" style={{ background: "rgba(239,68,68,0.06)" }}>
          <TrendingDown className="w-4 h-4 text-red-500 mx-auto mb-1" />
          <p className="text-sm font-bold text-red-500">{formatWon(totalExpense)}</p>
          <p className="text-[10px] text-gray-400">지출</p>
        </div>
        <div className="p-3 rounded-2xl text-center" style={{ background: netIncome >= 0 ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.06)" }}>
          <DollarSign className={`w-4 h-4 mx-auto mb-1 ${netIncome >= 0 ? "text-emerald-500" : "text-red-500"}`} />
          <p className={`text-sm font-bold ${netIncome >= 0 ? "text-emerald-600" : "text-red-500"}`}>{formatWon(Math.abs(netIncome))}</p>
          <p className="text-[10px] text-gray-400">순수익</p>
        </div>
      </div>

      {/* 거래 내역 */}
      {monthEntries.length === 0 ? (
        <div className="text-center py-12">
          <Receipt className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">이번 달 내역이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-2">
          {monthEntries.map((e) => (
            <div key={e.id} className="flex items-center gap-3 p-3 rounded-2xl ds-card">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                e.type === "income" ? "bg-blue-50" : "bg-red-50"
              }`}>
                {e.type === "income"
                  ? <TrendingUp className="w-4 h-4 text-blue-500" />
                  : <TrendingDown className="w-4 h-4 text-red-500" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{e.description}</p>
                <p className="text-[10px] text-gray-400">{e.date} · {e.category}</p>
              </div>
              <span className={`text-sm font-bold ${e.type === "income" ? "text-blue-600" : "text-red-500"}`}>
                {e.type === "income" ? "+" : "-"}{formatWon(e.amount)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 추가 바텀시트 */}
      <AnimatePresence>
        {showAddForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-[60]" style={{ backdropFilter: "blur(8px)" }}
              onClick={() => setShowAddForm(false)} />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className="fixed bottom-0 left-0 right-0 z-[60] rounded-t-3xl"
              style={{ background: "#F8F9FC", paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0px))" }}>
              <div className="px-5 pt-4">
                <div className="flex justify-center mb-3">
                  <div className="w-10 h-1.5 rounded-full bg-gray-300/80" />
                </div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">내역 추가</h2>
                  <button onClick={() => setShowAddForm(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                {/* 수입/지출 탭 */}
                <div className="flex gap-2 mb-4">
                  {(["income", "expense"] as const).map((t) => (
                    <button key={t} onClick={() => setFormType(t)}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                        formType === t
                          ? t === "income" ? "bg-blue-500 text-white" : "bg-red-500 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                      {t === "income" ? "수입" : "지출"}
                    </button>
                  ))}
                </div>

                <div className="space-y-3 pb-4">
                  <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value.replace(/[^0-9]/g, "") })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="금액 (원)" inputMode="numeric" />
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white">
                    <option value="">카테고리 선택</option>
                    {(formType === "income" ? INCOME_CATS : EXPENSE_CATS).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="메모 (선택)" />
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" />
                  <motion.button whileTap={{ scale: 0.97 }} onClick={addEntry}
                    disabled={!form.amount || !form.category}
                    className="w-full py-3 rounded-2xl text-sm font-bold text-white disabled:opacity-40"
                    style={{ background: formType === "income" ? "linear-gradient(135deg, #3B6CF6, #5B8AFF)" : "linear-gradient(135deg, #EF4444, #F87171)" }}>
                    {formType === "income" ? "수입 추가" : "지출 추가"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
