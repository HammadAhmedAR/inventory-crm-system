import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCustomers } from "../../../hooks/useCrmQueries";
import { useInventoryList } from "../../../hooks/useInventoryQueries";
import type { CreateTaskPayload } from "../../../../../shared/ipc";

interface Props { open: boolean; onClose: () => void }
const tomorrow = () => { const date = new Date(); date.setDate(date.getDate() + 1); return date.toISOString().slice(0, 10); };

const AddTaskModal: React.FC<Props> = ({ open, onClose }) => {
  const client = useQueryClient();
  const { data: customers = [] } = useCustomers();
  const { data: vehicles = [] } = useInventoryList();
  const [target, setTarget] = useState<"CUSTOMER" | "VEHICLE">("CUSTOMER");
  const [form, setForm] = useState<CreateTaskPayload>({ title: "", actionType: "CALL", taskType: "SALES", priority: "MEDIUM", dueDate: tomorrow(), dueTime: "09:00" });
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  useEffect(() => { if (open) { setTarget("CUSTOMER"); setForm({ title: "", actionType: "CALL", taskType: "SALES", priority: "MEDIUM", dueDate: tomorrow(), dueTime: "09:00" }); setError(""); } }, [open]);
  if (!open) return null;
  const update = <K extends keyof CreateTaskPayload>(key: K, value: CreateTaskPayload[K]) => setForm((current) => ({ ...current, [key]: value }));
  const chooseTarget = (value: "CUSTOMER" | "VEHICLE") => { setTarget(value); setForm((current) => ({ ...current, customerId: undefined, chassisNumber: undefined, taskType: value === "CUSTOMER" ? "SALES" : "INVENTORY_REPAIR", actionType: value === "CUSTOMER" ? "CALL" : "REPAIR_DISPATCH" })); };
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4"><form onSubmit={async (e) => { e.preventDefault(); setBusy(true); setError(""); try { await window.api.tasks.create(form); await Promise.all([client.invalidateQueries({ queryKey: ["tasks"] }), client.invalidateQueries({ queryKey: ["dailyTasks"] })]); onClose(); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not create task."); } finally { setBusy(false); } }} className="card max-h-[90vh] w-full max-w-xl overflow-y-auto p-6">
    <div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-widest text-accent">Quick create</p><h2 className="mt-1 text-xl font-bold text-white">Add Custom Task</h2></div><button type="button" onClick={onClose} className="btn-ghost p-2">×</button></div>
    <div className="mt-5 grid grid-cols-2 gap-2">{(["CUSTOMER", "VEHICLE"] as const).map((value) => <button type="button" key={value} onClick={() => chooseTarget(value)} className={`rounded-lg border p-3 text-sm ${target === value ? "border-accent bg-accent/10 text-accent" : "border-border text-muted"}`}>{value === "CUSTOMER" ? "👥 Customer Lead" : "🚗 Vehicle Chassis Unit"}</button>)}</div>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <label className="text-xs text-muted sm:col-span-2">{target === "CUSTOMER" ? "Customer" : "Vehicle"}<select required value={target === "CUSTOMER" ? form.customerId ?? "" : form.chassisNumber ?? ""} onChange={(e) => update(target === "CUSTOMER" ? "customerId" : "chassisNumber", e.target.value)} className="input-dark mt-1.5 w-full"><option value="">Select {target === "CUSTOMER" ? "customer" : "chassis"}</option>{target === "CUSTOMER" ? customers.map((x) => <option key={x.id} value={x.id}>{x.fullName} · {x.phone}</option>) : vehicles.map((x) => <option key={x.chassisNumber} value={x.chassisNumber}>{x.model.make} {x.model.modelName} · {x.chassisNumber}</option>)}</select></label>
      <label className="text-xs text-muted sm:col-span-2">Title<input required value={form.title} onChange={(e) => update("title", e.target.value)} className="input-dark mt-1.5 w-full" placeholder="What needs to be done?" /></label>
      <label className="text-xs text-muted">Action Type<select value={form.actionType} onChange={(e) => { const action = e.target.value as CreateTaskPayload["actionType"]; update("actionType", action); if (action === "DOCUMENT_CHECK") update("taskType", "DOCUMENT_CHECK"); else if (["REPAIR_DISPATCH"].includes(action)) update("taskType", "INVENTORY_REPAIR"); }} className="input-dark mt-1.5 w-full"><option value="CALL">Phone Call</option><option value="WHATSAPP">WhatsApp Message</option><option value="REPAIR_DISPATCH">Repair Dispatch</option><option value="DOCUMENT_CHECK">Document Check</option><option value="VISIT">Visit</option></select></label>
      <label className="text-xs text-muted">Priority<select value={form.priority} onChange={(e) => update("priority", e.target.value as CreateTaskPayload["priority"])} className="input-dark mt-1.5 w-full"><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select></label>
      <label className="text-xs text-muted">Due Date<input type="date" required value={form.dueDate} onChange={(e) => update("dueDate", e.target.value)} className="input-dark mt-1.5 w-full" /></label><label className="text-xs text-muted">Due Time<input type="time" value={form.dueTime ?? ""} onChange={(e) => update("dueTime", e.target.value)} className="input-dark mt-1.5 w-full" /></label>
      <label className="text-xs text-muted sm:col-span-2">Notes<textarea rows={3} value={form.notes ?? ""} onChange={(e) => update("notes", e.target.value)} className="input-dark mt-1.5 w-full resize-none" /></label>
    </div>{error && <p className="mt-4 text-sm text-red-300">{error}</p>}<div className="mt-6 flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={onClose}>Cancel</button><button disabled={busy} className="btn-accent">{busy ? "Creating…" : "Create Task"}</button></div>
  </form></div>;
};
export default AddTaskModal;
