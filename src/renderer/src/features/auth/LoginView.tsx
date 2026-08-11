import React, { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";

const LoginView: React.FC = () => {
  const login = useAuthStore((state) => state.login);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const usernameInput = useRef<HTMLInputElement>(null);
  useEffect(() => { usernameInput.current?.focus(); }, []);
  return <main className="flex h-screen w-screen items-center justify-center bg-[#0f172a] p-5 text-white">
    <div className="absolute inset-0 overflow-hidden"><div className="absolute left-1/4 top-1/4 h-80 w-80 rounded-full bg-amber-400/5 blur-3xl" /><div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" /></div>
    <form onSubmit={async (e) => { e.preventDefault(); setBusy(true); setError(""); try { await login({ username: username.trim(), password }); } catch { setError("Invalid username or password."); } finally { setBusy(false); } }} className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900/95 p-8 shadow-2xl">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent font-black text-slate-950 shadow-glow">OD</div>
      <div className="mt-5 text-center"><p className="text-xs font-semibold uppercase tracking-[.25em] text-accent">OmniDrive</p><h1 className="mt-2 text-2xl font-bold">Welcome back</h1><p className="mt-1 text-sm text-slate-400">Sign in to dealership operations</p></div>
      <label className="mt-7 block text-xs font-medium text-slate-300">Username<input ref={usernameInput} autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} className="input-dark mt-2 w-full" required /></label>
      <label className="mt-4 block text-xs font-medium text-slate-300">Password<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-dark mt-2 w-full" required /></label>
      {error && <div role="alert" className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>}
      <button disabled={busy || !username.trim() || !password} className="btn-accent mt-6 w-full py-2.5">{busy ? "Signing in…" : "Sign In"}</button>
      <p className="mt-5 text-center text-[10px] text-slate-600">Default account: admin / admin123</p>
    </form>
  </main>;
};

export default LoginView;
