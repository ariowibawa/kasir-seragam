"use client";

import { useState } from "react";

interface CashBookEntry {
  id: number;
  entryDate: string;
  title: string;
  reference: string;
  refType: string;
  type: string;
  category: string;
  amount: number;
  runningBalance: number;
  description: string | null;
}

interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

interface Summary {
  currentBalance: number;
  thisMonth: {
    totalIncome: number;
    totalExpense: number;
    incomeVsLastMonth: string;
  };
}

interface Props {
  initialEntries: { data: CashBookEntry[]; meta: PaginationMeta };
  summary: Summary;
}

export default function KasPageClient({ initialEntries, summary }: Props) {
  const [entries, setEntries] = useState(initialEntries.data);
  const [meta, setMeta] = useState(initialEntries.meta);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID").format(amount);
  const formatBalance = (balance: number) => {
    if (balance < 0) return `−Rp ${formatCurrency(Math.abs(balance))}`;
    return `Rp ${formatCurrency(balance)}`;
  };
  const formatAmount = (amount: number) => {
    if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}M`;
    return `Rp ${formatCurrency(amount)}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  const fetchEntries = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cashbook?page=${page}`);
      const data = await res.json();
      setEntries(data.data);
      setMeta(data.meta);
    } finally {
      setLoading(false);
    }
  };

  const handleManualEntry = async (formData: {
    type: string;
    category: string;
    title: string;
    amount: number;
    description: string;
    entryDate: string;
  }) => {
    try {
      const res = await fetch("/api/cashbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }
      setShowModal(false);
      fetchEntries(1);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create entry");
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-10">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        {/* Page Header */}
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">Buku Kas</h2>
            <p className="font-body text-sm text-on-surface-variant mt-2">Monitor financial activity and maintain records of cash flow.</p>
          </div>
          <div className="flex gap-3">
            <button className="text-primary bg-transparent rounded-xl px-5 py-2.5 flex items-center gap-2 hover:bg-surface-container-high transition-colors font-label font-medium text-sm border border-outline-variant/20">
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filter
            </button>
            <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-xl px-5 py-2.5 flex items-center gap-2 hover:opacity-90 transition-opacity font-label font-medium text-sm ambient-shadow">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined text-sm text-on-primary-fixed">account_balance</span>
              </div>
              <span className="font-label text-sm text-on-surface-variant">Current Balance</span>
            </div>
            <div className="font-headline text-3xl font-extrabold text-on-surface">{formatAmount(summary.currentBalance)}</div>
            <p className="text-xs text-secondary mt-1 font-body">Updated just now</p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined text-sm text-on-tertiary-fixed">trending_up</span>
              </div>
              <span className="font-label text-sm text-on-surface-variant">Monthly Income</span>
            </div>
            <div className="font-headline text-3xl font-extrabold text-on-surface">{formatAmount(summary.thisMonth.totalIncome)}</div>
            <p className="text-xs font-body mt-1">
              <span className={`font-semibold ${summary.thisMonth.incomeVsLastMonth.startsWith("+") ? "text-green-600" : summary.thisMonth.incomeVsLastMonth.startsWith("-") ? "text-error" : "text-secondary"}`}>
                {summary.thisMonth.incomeVsLastMonth}
              </span>{" "}
              <span className="text-secondary">vs last month</span>
            </p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center">
                <span className="material-symbols-outlined text-sm text-on-error-container">trending_down</span>
              </div>
              <span className="font-label text-sm text-on-surface-variant">Monthly Expenses</span>
            </div>
            <div className="font-headline text-3xl font-extrabold text-on-surface">{formatAmount(summary.thisMonth.totalExpense)}</div>
            <p className="text-xs text-secondary mt-1 font-body">This month</p>
          </div>
        </div>

        {/* Cash Book Table */}
        <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline text-xl font-bold text-on-surface">Transaction Log</h3>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-lg px-4 py-2.5 flex items-center gap-2 hover:opacity-90 transition-opacity font-label font-medium text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Manual Entry
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-surface-variant">
                  <th className="pb-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-label">Date</th>
                  <th className="pb-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-label">Description</th>
                  <th className="pb-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-label text-right">Pemasukan</th>
                  <th className="pb-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-label text-right">Pengeluaran</th>
                  <th className="pb-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-label text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="font-body text-sm">
                {loading ? (
                  <tr><td colSpan={5} className="py-8 text-center text-on-surface-variant">Loading...</td></tr>
                ) : entries.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-on-surface-variant">No entries yet</td></tr>
                ) : (
                  entries.map((tx) => (
                    <tr key={tx.id} className="hover:bg-surface-container-highest transition-colors cursor-pointer group border-b border-outline-variant/10 last:border-none">
                      <td className="py-4 text-secondary whitespace-nowrap">{formatDate(tx.entryDate)}</td>
                      <td className="py-4">
                        <div className="font-medium text-on-surface">{tx.title}</div>
                        <div className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-2">
                          <span className="text-outline">{tx.reference}</span>
                          <span className="text-outline">•</span>
                          <span className={tx.refType === "automated" ? "text-primary" : "text-secondary"}>
                            {tx.refType === "automated" ? "Automated" : "Manual Entry"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 text-right font-medium whitespace-nowrap">
                        {tx.type === "income" ? (
                          <span className="text-green-700">Rp {formatCurrency(tx.amount)}</span>
                        ) : (
                          <span className="text-on-surface-variant">-</span>
                        )}
                      </td>
                      <td className="py-4 text-right font-medium whitespace-nowrap">
                        {tx.type === "expense" ? (
                          <span className="text-error">Rp {formatCurrency(tx.amount)}</span>
                        ) : (
                          <span className="text-on-surface-variant">-</span>
                        )}
                      </td>
                      <td className="py-4 text-right font-headline font-bold whitespace-nowrap">
                        <span className={tx.runningBalance < 0 ? "text-error" : "text-on-surface"}>
                          {formatBalance(tx.runningBalance)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 pt-6 flex items-center justify-between text-sm text-on-surface-variant font-body border-t border-outline-variant/10">
            <span>
              Showing {Math.min((meta.current_page - 1) * meta.per_page + 1, meta.total)} to{" "}
              {Math.min(meta.current_page * meta.per_page, meta.total)} of {meta.total} entries
            </span>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 rounded-md hover:bg-surface-container transition-colors disabled:opacity-50"
                disabled={meta.current_page <= 1}
                onClick={() => fetchEntries(meta.current_page - 1)}
              >
                Previous
              </button>
              {Array.from({ length: Math.min(meta.last_page, 5) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    p === meta.current_page ? "bg-surface-container text-on-surface font-medium" : "hover:bg-surface-container"
                  }`}
                  onClick={() => fetchEntries(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="px-3 py-1 rounded-md hover:bg-surface-container transition-colors disabled:opacity-50"
                disabled={meta.current_page >= meta.last_page}
                onClick={() => fetchEntries(meta.current_page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {showModal && (
        <ManualEntryModal
          onClose={() => setShowModal(false)}
          onSave={handleManualEntry}
        />
      )}
    </main>
  );
}

function ManualEntryModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: { type: string; category: string; title: string; amount: number; description: string; entryDate: string }) => void;
}) {
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [description, setDescription] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    if (rawValue === "") { setAmountStr(""); return; }
    setAmountStr(new Intl.NumberFormat("id-ID").format(Number(rawValue)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(amountStr.replace(/\./g, ""));
    if (!category || !title || !amount || !entryDate) {
      alert("Lengkapi semua field.");
      return;
    }
    onSave({ type, category, title, amount, description, entryDate });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-surface-container-lowest rounded-2xl p-8 w-full max-w-md ambient-shadow">
        <h3 className="font-headline text-xl font-bold text-on-surface mb-6">Manual Cash Book Entry</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={`py-2 px-4 rounded-md text-sm font-semibold transition-colors ${type === "expense" ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface hover:bg-surface-container-high"}`}
                onClick={() => setType("expense")}
              >
                Expense
              </button>
              <button
                type="button"
                className={`py-2 px-4 rounded-md text-sm font-semibold transition-colors ${type === "income" ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface hover:bg-surface-container-high"}`}
                onClick={() => setType("income")}
              >
                Income
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Category</label>
            <input className="bg-surface-container-low text-on-surface text-sm border-0 border-b-2 border-outline-variant/20 focus:ring-0 focus:border-primary py-2.5 px-3 rounded-t-md transition-all outline-none" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Biaya Operasional" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Title</label>
            <input className="bg-surface-container-low text-on-surface text-sm border-0 border-b-2 border-outline-variant/20 focus:ring-0 focus:border-primary py-2.5 px-3 rounded-t-md transition-all outline-none" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Description of the entry" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm font-semibold">Rp</span>
                <input className="bg-surface-container-low w-full text-on-surface text-sm border-0 border-b-2 border-outline-variant/20 focus:ring-0 focus:border-primary py-2.5 pl-10 pr-3 rounded-t-md transition-all outline-none" type="text" value={amountStr} onChange={handleAmountChange} placeholder="0" required />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Date</label>
              <input className="bg-surface-container-low text-on-surface text-sm border-0 border-b-2 border-outline-variant/20 focus:ring-0 focus:border-primary py-2.5 px-3 rounded-t-md transition-all outline-none" type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} required />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Description (Optional)</label>
            <input className="bg-surface-container-low text-on-surface text-sm border-0 border-b-2 border-outline-variant/20 focus:ring-0 focus:border-primary py-2.5 px-3 rounded-t-md transition-all outline-none" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Additional notes..." />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors">Cancel</button>
            <button type="submit" className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-5 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">Create Entry</button>
          </div>
        </form>
      </div>
    </div>
  );
}
