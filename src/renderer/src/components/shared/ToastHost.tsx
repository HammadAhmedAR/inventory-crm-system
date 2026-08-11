import React, { useEffect, useState } from "react";
type Toast = { message: string; actionLabel?: string; action?: () => void | Promise<void> };
const ToastHost: React.FC = () => {
  const [toast, setToast] = useState<Toast | null>(null);
  useEffect(() => { const listener = (event: Event) => { setToast((event as CustomEvent<Toast>).detail); setTimeout(() => setToast(null), 5000); }; window.addEventListener("omnidrive:toast", listener); return () => window.removeEventListener("omnidrive:toast", listener); }, []);
  if (!toast) return null;
  return <div className="fixed bottom-5 right-5 z-[200] flex items-center gap-4 rounded-xl border border-border bg-slate-900 px-4 py-3 text-sm text-white shadow-2xl"><span>{toast.message}</span>{toast.action && <button onClick={async () => { await toast.action?.(); setToast(null); }} className="font-semibold text-accent hover:underline">{toast.actionLabel}</button>}<button onClick={() => setToast(null)} className="text-muted">×</button></div>;
};
export default ToastHost;
