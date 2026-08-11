import React, { useState } from "react";
import { useCreateInventoryUnit } from "../../../hooks/useInventoryQueries";

interface Props { open: boolean; onClose: () => void }
const BODY_TYPES = ["SUV", "SUBCOMPACT_SUV", "BIKE", "SCOOTER", "SEDAN", "HATCHBACK"];
const MAKES = ["Honda", "TVS", "Kia", "Suzuki", "Toyota", "Mazda", "Ford"];
const emptyForm = () => ({ chassisNumber: "", engineNumber: "", make: "Honda", modelName: "", bodyType: "BIKE", year: String(new Date().getFullYear()), color: "", baseQuotingPrice: "", minSellingPrice: "", costPrice: "", keysCount: "2", documentsPresent: false });

const AddUnitModal: React.FC<Props> = ({ open, onClose }) => {
  const [form, setForm] = useState(emptyForm); const createUnit = useCreateInventoryUnit();
  if (!open) return null;
  const input = (name: keyof ReturnType<typeof emptyForm>, label: string, type = "text", required = false) => <label className="block text-xs text-muted">{label}{required && " *"}<input required={required} min={type === "number" ? 0 : undefined} type={type} value={String(form[name])} onChange={(e) => setForm((old) => ({ ...old, [name]: e.target.value }))} className={`input-dark mt-1 w-full ${name === "chassisNumber" || name === "engineNumber" ? "font-mono uppercase" : ""}`} /></label>;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4" role="dialog" aria-modal="true"><div className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-surface shadow-card">
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-6 py-4"><div><p className="text-[10px] uppercase tracking-[.2em] text-subtle">Inventory Intake</p><h2 className="text-lg font-bold text-white">Add New Unit</h2></div><button className="btn-ghost" onClick={onClose} aria-label="Close">×</button></div>
    <form className="p-6" onSubmit={async (e) => { e.preventDefault(); await createUnit.mutateAsync({ chassisNumber: form.chassisNumber, engineNumber: form.engineNumber || undefined, make: form.make, modelName: form.modelName, bodyType: form.bodyType, year: Number(form.year), color: form.color, baseQuotingPrice: Number(form.baseQuotingPrice), minSellingPrice: form.minSellingPrice ? Number(form.minSellingPrice) : undefined, costPrice: form.costPrice ? Number(form.costPrice) : undefined, keysCount: Number(form.keysCount), documentsPresent: form.documentsPresent }); setForm(emptyForm()); onClose(); }}>
      <div className="grid gap-4 md:grid-cols-2"><label className="block text-xs text-muted">Make *<input required list="vehicle-makes" value={form.make} onChange={(e) => setForm((old) => ({ ...old, make: e.target.value }))} className="input-dark mt-1 w-full" /><datalist id="vehicle-makes">{MAKES.map((make) => <option key={make} value={make} />)}</datalist></label>{input("modelName", "Model name", "text", true)}
        <label className="block text-xs text-muted">Body type *<select className="input-dark mt-1 w-full" value={form.bodyType} onChange={(e) => setForm((old) => ({ ...old, bodyType: e.target.value }))}>{BODY_TYPES.map((type) => <option key={type} value={type}>{type.replace(/_/g, " ")}</option>)}</select></label>{input("year", "Year of manufacture", "number", true)}
        <div className="md:col-span-2">{input("chassisNumber", "Chassis number / VIN", "text", true)}</div>{input("engineNumber", "Engine number")}{input("color", "Color", "text", true)}
        {input("baseQuotingPrice", "Base quoting price (LKR)", "number", true)}{input("minSellingPrice", "Minimum selling floor price (LKR)", "number")}{input("costPrice", "Acquisition cost price (LKR)", "number")}
        <label className="block text-xs text-muted">Keys count<select className="input-dark mt-1 w-full" value={form.keysCount} onChange={(e) => setForm((old) => ({ ...old, keysCount: e.target.value }))}><option value="1">1 Key</option><option value="2">2 Keys</option></select></label>
        <label className="flex items-center gap-3 rounded-lg border border-border bg-background/40 p-3 text-sm text-white md:col-span-2"><input type="checkbox" checked={form.documentsPresent} onChange={(e) => setForm((old) => ({ ...old, documentsPresent: e.target.checked }))} className="h-4 w-4 accent-accent" />Transfer documents present</label>
      </div>
      <div className="mt-4 rounded-lg border border-amber-400/20 bg-amber-500/10 p-3 text-xs text-amber-200">New units enter inventory as AVAILABLE with health status PENDING CHECK.</div>{createUnit.error && <p className="mt-3 rounded-lg bg-red-500/10 p-3 text-xs text-red-300">{createUnit.error instanceof Error ? createUnit.error.message : "Unable to add unit."}</p>}
      <div className="mt-5 flex justify-end gap-3 border-t border-border pt-4"><button type="button" className="btn-ghost" onClick={onClose}>Cancel</button><button disabled={createUnit.isPending} className="btn-accent">{createUnit.isPending ? "Adding..." : "Add New Unit"}</button></div>
    </form></div></div>;
};
export default AddUnitModal;
