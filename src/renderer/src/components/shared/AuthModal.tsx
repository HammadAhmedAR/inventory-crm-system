import React, { useEffect, useRef, useState } from "react";

interface Props { locked: boolean; onUnlock: () => void }
const AuthModal: React.FC<Props> = ({ locked, onUnlock }) => {
  const [pin, setPin] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const input = useRef<HTMLInputElement>(null);
  useEffect(() => { if (locked) { setPin(""); setError(""); setTimeout(() => input.current?.focus(), 0); } }, [locked]);
  if (!locked) return null;
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 p-4"><form onSubmit={async (e) => { e.preventDefault(); setBusy(true); setError(""); try { if (await window.api.auth.verifyPin(pin)) onUnlock(); else { setError("Incorrect PIN. Try again."); setPin(""); } } finally { setBusy(false); } }} className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-7 text-center shadow-2xl">
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-2xl">🔒</div><p className="text-[10px] uppercase tracking-[.25em] text-accent">OmniDrive Secure</p><h1 className="mt-1 text-xl font-bold text-white">Operations Locked</h1><p className="mt-2 text-sm text-slate-400">Enter your 4-digit access PIN to continue.</p>
    <input ref={input} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0,4))} inputMode="numeric" type="password" pattern="\d{4}" required maxLength={4} className="mt-6 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-center font-mono text-2xl tracking-[.7em] text-white outline-none focus:border-accent" aria-label="Four digit PIN" />
    {error && <p className="mt-3 text-xs text-red-300">{error}</p>}<button disabled={busy || pin.length !== 4} className="btn-accent mt-5 w-full">{busy ? "Verifying..." : "Unlock OmniDrive"}</button><p className="mt-4 text-[10px] text-slate-600">Default local PIN: 1234</p>
  </form></div>;
};
export default AuthModal;
