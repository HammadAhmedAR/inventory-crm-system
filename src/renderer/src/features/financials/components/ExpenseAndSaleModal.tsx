import React, { useMemo, useState } from "react";
import { useCustomers } from "../../../hooks/useCrmQueries";
import { useInventoryList } from "../../../hooks/useInventoryQueries";
import { useDailyExpenses, useLogExpense, useRecordSale } from "../../../hooks/useFinancialQueries";
import { useSoftDelete } from "../../../hooks/useRecycleBin";

type Tab = "EXPENSE" | "SALE";
interface Props { open: boolean; onClose: () => void }

const ExpenseAndSaleModal: React.FC<Props> = ({ open, onClose }) => {
  const [tab, setTab] = useState<Tab>("EXPENSE");
  const [category, setCategory] = useState("SHOWROOM_MAINTENANCE"); const [description, setDescription] = useState(""); const [amount, setAmount] = useState("");
  const [customerId, setCustomerId] = useState(""); const [chassisNumber, setChassisNumber] = useState(""); const [salePrice, setSalePrice] = useState(""); const [paymentMethod, setPaymentMethod] = useState("CASH"); const [notes, setNotes] = useState("");
  const { data: customers = [] } = useCustomers(); const { data: inventory = [] } = useInventoryList();
  const sellable = useMemo(() => inventory.filter((unit) => unit.saleStatus === "AVAILABLE" || unit.saleStatus === "RESERVED"), [inventory]);
  const expense = useLogExpense(); const sale = useRecordSale(); const mutation = tab === "EXPENSE" ? expense : sale;
  const { data: expenses = [] } = useDailyExpenses(); const softDelete = useSoftDelete();
  if (!open) return null;
  const error = mutation.error instanceof Error ? mutation.error.message : null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4" role="dialog" aria-modal="true">
    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface shadow-card">
      <div className="flex items-center justify-between border-b border-border px-6 py-4"><div><p className="text-[10px] uppercase tracking-[.2em] text-subtle">Financial Desk</p><h2 className="text-lg font-bold text-white">Expense & Sale Recorder</h2></div><button onClick={onClose} className="btn-ghost" aria-label="Close">×</button></div>
      <div className="flex border-b border-border px-6">{(["EXPENSE", "SALE"] as Tab[]).map((item) => <button key={item} onClick={() => setTab(item)} className={`border-b-2 px-4 py-3 text-xs font-semibold ${tab === item ? "border-accent text-accent" : "border-transparent text-muted"}`}>{item === "EXPENSE" ? "Log Daily Expense" : "Record Vehicle Sale"}</button>)}</div>
      <form className="space-y-4 p-6" onSubmit={async (event) => { event.preventDefault(); if (tab === "EXPENSE") { await expense.mutateAsync({ category, description, amount: Number(amount) }); setDescription(""); setAmount(""); } else { await sale.mutateAsync({ customerId, chassisNumber, finalSalePrice: Number(salePrice), paymentMethod, notes }); setCustomerId(""); setChassisNumber(""); setSalePrice(""); setNotes(""); } onClose(); }}>
        {tab === "EXPENSE" ? <><label className="block text-xs text-muted">Expense category<select className="input-dark mt-1 w-full" value={category} onChange={(e) => setCategory(e.target.value)}>{["SHOWROOM_MAINTENANCE","UTILITIES","TRANSPORT","TEA_HOSPITALITY","MARKETING","MISC"].map((x) => <option key={x}>{x.replace(/_/g," ")}</option>)}</select></label><label className="block text-xs text-muted">Description<input required className="input-dark mt-1 w-full" value={description} onChange={(e) => setDescription(e.target.value)} /></label><label className="block text-xs text-muted">Amount (LKR)<input required min="1" type="number" className="input-dark mt-1 w-full" value={amount} onChange={(e) => setAmount(e.target.value)} /></label></> : <>
          <div className="grid gap-4 md:grid-cols-2"><label className="block text-xs text-muted">Customer<select required className="input-dark mt-1 w-full" value={customerId} onChange={(e) => setCustomerId(e.target.value)}><option value="">Select customer</option>{customers.map((x) => <option key={x.id} value={x.id}>{x.fullName} · {x.phone}</option>)}</select></label><label className="block text-xs text-muted">Available / Reserved chassis<select required className="input-dark mt-1 w-full" value={chassisNumber} onChange={(e) => { setChassisNumber(e.target.value); const unit = sellable.find((x) => x.chassisNumber === e.target.value); if (unit) setSalePrice(String(unit.baseQuotingPrice)); }}><option value="">Select chassis</option>{sellable.map((x) => <option key={x.chassisNumber} value={x.chassisNumber}>{x.chassisNumber} · {x.model.make} {x.model.modelName} ({x.saleStatus})</option>)}</select></label></div>
          <div className="grid gap-4 md:grid-cols-2"><label className="block text-xs text-muted">Final agreed price (LKR)<input required min="1" type="number" className="input-dark mt-1 w-full" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} /></label><label className="block text-xs text-muted">Payment method<select className="input-dark mt-1 w-full" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>{["CASH","LEASING","BANK_TRANSFER","CHEQUE"].map((x) => <option key={x}>{x.replace(/_/g," ")}</option>)}</select></label></div><label className="block text-xs text-muted">Sale notes<textarea className="input-dark mt-1 w-full resize-none" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
        </>}
        {error && <p className="rounded-lg bg-red-500/10 p-2 text-xs text-red-300">{error}</p>}<div className="flex justify-end gap-3 border-t border-border pt-4"><button type="button" className="btn-ghost" onClick={onClose}>Cancel</button><button disabled={mutation.isPending} className="btn-accent">{mutation.isPending ? "Saving..." : tab === "EXPENSE" ? "Log Expense" : "Finalize Sale"}</button></div>
      </form>
      {tab === "EXPENSE" && expenses.length > 0 && <div className="border-t border-border px-6 py-4"><h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Recent Expenses</h3><div className="mt-3 max-h-44 divide-y divide-border overflow-y-auto">{expenses.slice(0, 20).map((item) => <div key={item.id} className="flex items-center justify-between gap-3 py-2 text-xs"><div><p className="font-medium text-white">{item.description}</p><p className="text-subtle">{item.category.replace(/_/g, " ")} · LKR {item.amount.toLocaleString()}</p></div><button onClick={() => softDelete.mutate({ entityType: "EXPENSE", id: item.id })} className="text-red-300 hover:underline">🗑️ Delete</button></div>)}</div></div>}
    </div>
  </div>;
};
export default ExpenseAndSaleModal;
