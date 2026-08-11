import React, { useEffect, useState } from "react";
import { useCustomerTimeline, useCustomers } from "../../hooks/useCrmQueries";

const lkr = (value: number | null) => new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(value ?? 0);
const badge = (status: string) => status === "ACCEPTED" ? "badge-success" : status === "ACTIVE" ? "badge-accent" : "badge-muted";

const ProspectsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: customers = [], isLoading } = useCustomers(search);
  const { data: profile, isLoading: profileLoading } = useCustomerTimeline(selectedId);
  useEffect(() => { if (!selectedId && customers[0]) setSelectedId(customers[0].id); }, [customers, selectedId]);

  return <div className="flex h-full min-h-0 animate-fade-in">
    <aside className="flex w-[340px] flex-shrink-0 flex-col border-r border-border bg-surface/50">
      <div className="border-b border-border p-5"><p className="text-[10px] uppercase tracking-[.2em] text-subtle">CRM Directory</p><h2 className="text-xl font-bold text-white">Prospects & Quotes</h2>
        <input value={search} onChange={(e) => setSearch(e.target.value)} className="input-dark mt-4 w-full" placeholder="Search name, phone or email" />
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {isLoading ? <p className="p-4 text-sm text-muted">Loading customers...</p> : customers.length === 0 ? <p className="p-4 text-sm text-muted">No customers found.</p> : customers.map((customer) =>
          <button key={customer.id} onClick={() => setSelectedId(customer.id)} className={`mb-2 w-full rounded-xl border p-3 text-left transition ${selectedId === customer.id ? "border-accent bg-accent/10" : "border-border bg-background/30 hover:bg-surface-elevated"}`}>
            <div className="flex items-start justify-between gap-2"><div><p className="text-sm font-semibold text-white">{customer.fullName}</p><p className="font-mono text-xs text-muted">{customer.phone}</p></div><span className="badge-muted">{customer.leadSource.replace(/_/g, " ")}</span></div>
            <p className="mt-2 text-[11px] text-subtle">{customer._count.interactions} interactions · {customer._count.quotes} quotes</p>
          </button>)}
      </div>
    </aside>
    <section className="min-w-0 flex-1 overflow-y-auto p-6">
      {profileLoading ? <div className="card p-8 text-muted">Loading customer profile...</div> : !profile ? <div className="card p-8 text-center text-muted">Select a customer to inspect their quote lineage.</div> : <>
        <div className="mb-5 flex items-start justify-between"><div><p className="text-[10px] uppercase tracking-[.2em] text-subtle">Customer Profile</p><h2 className="text-2xl font-bold text-white">{profile.fullName}</h2><p className="mt-1 text-sm text-muted">{profile.phone}{profile.email ? ` · ${profile.email}` : ""}</p></div><span className="badge-accent">{profile.leadSource.replace(/_/g, " ")}</span></div>
        <div className="grid gap-5 xl:grid-cols-[.85fr_1.4fr]">
          <div className="card overflow-hidden"><div className="border-b border-border px-4 py-3"><h3 className="text-sm font-semibold text-white">Conversation Timeline</h3></div><div className="max-h-[600px] space-y-3 overflow-y-auto p-4">
            {profile.interactions.length === 0 ? <p className="text-sm text-subtle">No remarks recorded.</p> : profile.interactions.map((item) => <div key={item.id} className="relative border-l-2 border-accent/40 pl-4"><div className="flex justify-between gap-3"><span className="badge-muted">{item.actionTag.replace(/_/g, " ")}</span><time className="text-[10px] text-subtle">{new Date(item.createdAt).toLocaleString()}</time></div><blockquote className="mt-2 text-sm text-white">“{item.customerRemark}”</blockquote>{item.salesNote && <p className="mt-1 text-xs text-muted">Sales note: {item.salesNote}</p>}</div>)}
          </div></div>
          <div className="card overflow-hidden"><div className="border-b border-border px-4 py-3"><h3 className="text-sm font-semibold text-white">Quoting History & Price Lineage</h3></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-background/40 text-left text-[10px] uppercase tracking-wider text-subtle"><tr><th className="px-4 py-3">Chassis</th><th className="px-4 py-3">Model</th><th className="px-4 py-3">Quoted</th><th className="px-4 py-3">Floor cap</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th></tr></thead><tbody>
            {profile.quotes.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-subtle">No quotes issued.</td></tr> : profile.quotes.map((quote) => <tr key={quote.id} className="border-t border-border/60"><td className="px-4 py-3 font-mono text-xs text-accent">{quote.chassis.chassisNumber}</td><td className="px-4 py-3 text-white">{quote.chassis.model.make} {quote.chassis.model.modelName} {quote.chassis.model.year}</td><td className="px-4 py-3 font-semibold text-white">{lkr(quote.quotedPrice)}</td><td className="px-4 py-3 text-muted">{lkr(quote.chassis.minSellingPrice)}</td><td className="px-4 py-3 text-muted">{new Date(quote.createdAt).toLocaleDateString()}</td><td className="px-4 py-3"><span className={badge(quote.status)}>{quote.status}</span></td></tr>)}
          </tbody></table></div></div>
        </div>
      </>}
    </section>
  </div>;
};
export default ProspectsPage;
