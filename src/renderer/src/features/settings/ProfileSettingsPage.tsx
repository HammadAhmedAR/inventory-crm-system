import React, { useEffect, useState } from "react";
import type { DealershipProfileInput } from "../../../../shared/ipc";
import { useAuthStore } from "../../store/useAuthStore";

const emptyProfile: DealershipProfileInput = { companyName: "", regNumber: "", address: "", phone: "", email: "", website: "", bankName: "", bankBranch: "", accountName: "", accountNumber: "" };
const companyFields: Array<{ key: keyof DealershipProfileInput; label: string; type?: string; wide?: boolean }> = [
  { key: "companyName", label: "Company Name" }, { key: "regNumber", label: "Registration No." },
  { key: "address", label: "Address", wide: true }, { key: "phone", label: "Phone", type: "tel" },
  { key: "email", label: "Email", type: "email" }, { key: "website", label: "Website", type: "url" },
];
const bankFields: Array<{ key: keyof DealershipProfileInput; label: string }> = [
  { key: "bankName", label: "Bank Name" }, { key: "bankBranch", label: "Branch" },
  { key: "accountName", label: "Account Name" }, { key: "accountNumber", label: "Account Number" },
];

const ProfileSettingsPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordBusy, setPasswordBusy] = useState(false);
  useEffect(() => { window.api.profile.get().then(({ id: _id, ...data }) => setProfile(data)).catch(() => setMessage("Unable to load company profile.")).finally(() => setLoading(false)); }, []);
  const update = (key: keyof DealershipProfileInput, value: string) => setProfile((current) => ({ ...current, [key]: value }));
  const save = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true); setMessage(""); try { const { id: _id, ...saved } = await window.api.profile.update(profile); setProfile(saved); setMessage("Company Profile Saved"); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save company profile."); } finally { setSaving(false); } };
  const input = "input-dark mt-1.5 w-full";
  if (loading) return <div className="p-6 text-muted">Loading dealership settings…</div>;
  return <section className="h-full overflow-y-auto p-5 lg:p-7"><div className="mx-auto max-w-5xl"><p className="text-xs font-semibold uppercase tracking-[.2em] text-accent">Configuration</p><h2 className="mt-1 text-2xl font-bold text-white">Dealership Settings</h2><p className="mt-1 text-sm text-muted">These details automatically appear on generated dealership documents.</p>
    <form onSubmit={save} className="mt-6 space-y-5">
      <div className="card p-5"><div className="mb-5"><h3 className="font-semibold text-white">🏢 Company Information</h3><p className="mt-1 text-xs text-muted">Legal identity and customer contact details.</p></div><div className="grid gap-4 sm:grid-cols-2">{companyFields.map((item) => <label key={item.key} className={`text-xs font-medium text-muted ${item.wide ? "sm:col-span-2" : ""}`}>{item.label}{item.key === "address" ? <textarea rows={3} value={profile[item.key]} onChange={(e) => update(item.key, e.target.value)} className={`${input} resize-none`} /> : <input type={item.type ?? "text"} value={profile[item.key]} onChange={(e) => update(item.key, e.target.value)} className={input} required={item.key === "companyName"} />}</label>)}</div></div>
      <div className="card p-5"><div className="mb-5"><h3 className="font-semibold text-white">🏦 Bank Account Information</h3><p className="mt-1 text-xs text-muted">Payment instructions included in generated documents.</p></div><div className="grid gap-4 sm:grid-cols-2">{bankFields.map((item) => <label key={item.key} className="text-xs font-medium text-muted">{item.label}<input value={profile[item.key]} onChange={(e) => update(item.key, e.target.value)} className={input} /></label>)}</div></div>
      <div className="flex items-center justify-between gap-3"><p className={`text-sm ${message.includes("Saved") ? "text-emerald-300" : "text-red-300"}`}>{message}</p><button disabled={saving} className="btn-accent px-6">{saving ? "Saving…" : "Save Company Profile"}</button></div>
    </form>
    <form onSubmit={async (e) => { e.preventDefault(); setMessage(""); if (passwords.newPassword !== passwords.confirmPassword) return setMessage("New passwords do not match."); if (!user) return; setPasswordBusy(true); try { const ok = await window.api.auth.changePassword({ userId: user.id, currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }); if (!ok) setMessage("Current password is incorrect."); else { setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" }); setMessage("Password successfully updated."); } } catch (error) { setMessage(error instanceof Error ? error.message : "Could not change password."); } finally { setPasswordBusy(false); } }} className="card mt-6 p-5"><h3 className="font-semibold text-white">🔐 Account Security</h3><p className="mt-1 text-xs text-muted">Change the password for {user?.username}.</p><div className="mt-5 grid gap-4 sm:grid-cols-3"><label className="text-xs text-muted">Current Password<input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords((x) => ({ ...x, currentPassword: e.target.value }))} className={input} required /></label><label className="text-xs text-muted">New Password<input type="password" minLength={8} value={passwords.newPassword} onChange={(e) => setPasswords((x) => ({ ...x, newPassword: e.target.value }))} className={input} required /></label><label className="text-xs text-muted">Confirm Password<input type="password" minLength={8} value={passwords.confirmPassword} onChange={(e) => setPasswords((x) => ({ ...x, confirmPassword: e.target.value }))} className={input} required /></label></div><div className="mt-5 flex justify-end"><button disabled={passwordBusy} className="btn-ghost border border-border">{passwordBusy ? "Updating…" : "Change Password"}</button></div></form>
  </div></section>;
};

export default ProfileSettingsPage;
