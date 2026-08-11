import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAppStore } from "../../../store/useAppStore";
import { useAvailableVehicles, useQuickLogLead } from "../../../hooks/useCrmQueries";

const QUICK_REMARKS = [
  "Send WhatsApp Quote",
  "Discussing with spouse",
  "Needs leasing options",
  "Needs test drive session",
];

const ACTION_TAGS = [
  { value: "SEND_WHATSAPP_DETAILS", label: "💬 Send WhatsApp Details" },
  { value: "SEND_PRICE", label: "💰 Send Price Quote" },
  { value: "CALL_BACK", label: "📞 Call Back" },
  { value: "TEST_DRIVE", label: "🚗 Arrange Test Drive" },
];

const getToday5PM = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}T17:00`;
};

interface WalkInLoggerModalProps {
  open?: boolean;
  onClose?: () => void;
}

const WalkInLoggerModal: React.FC<WalkInLoggerModalProps> = ({ open, onClose }) => {
  const { isWalkInModalOpen, closeWalkInModal } = useAppStore();
  const isOpen = open ?? isWalkInModalOpen;
  const { data: vehicles = [] } = useAvailableVehicles();
  const logMutation = useQuickLogLead();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [chassisNumber, setChassisNumber] = useState("");
  const [quotedPrice, setQuotedPrice] = useState("");
  const [customerRemark, setCustomerRemark] = useState("");
  const [actionTag, setActionTag] = useState("SEND_WHATSAPP_DETAILS");
  const [dueDate, setDueDate] = useState(getToday5PM());

  const nameInputRef = useRef<HTMLInputElement>(null);

  // Autofocus name input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 80);
    }
  }, [isOpen]);

  // Reset form helper
  const resetForm = useCallback(() => {
    setFullName("");
    setPhone("");
    setChassisNumber("");
    setQuotedPrice("");
    setCustomerRemark("");
    setActionTag("SEND_WHATSAPP_DETAILS");
    setDueDate(getToday5PM());
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    if (onClose) {
      onClose();
      return;
    }
    closeWalkInModal();
  }, [closeWalkInModal, onClose, resetForm]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!fullName.trim() || !phone.trim()) return;

      await logMutation.mutateAsync({
        fullName,
        phone,
        chassisNumber: chassisNumber || undefined,
        quotedPrice: quotedPrice ? parseFloat(quotedPrice) : undefined,
        customerRemark: customerRemark || undefined,
        actionTag,
        dueDate,
      });

      handleClose();
    },
    [fullName, phone, chassisNumber, quotedPrice, customerRemark, actionTag, dueDate, logMutation, handleClose]
  );

  // Ctrl+Enter or Enter (in inputs) submission support
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  // Close on Escape key press
  useEffect(() => {
    const handleGlobalEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleGlobalEsc);
    return () => window.removeEventListener("keydown", handleGlobalEsc);
  }, [handleClose, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal Box */}
      <div className="relative z-10 w-full max-w-xl bg-surface border border-border rounded-2xl shadow-card animate-slide-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50">
          <div className="flex items-center gap-3">
            <span className="text-xl">🚶</span>
            <div>
              <h2 id="modal-title" className="text-white font-bold text-base leading-tight">
                Quick Walk-In Logger
              </h2>
              <p className="text-subtle text-xs">Instantly log visit details & actions</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted hover:text-white hover:bg-surface-elevated transition-colors"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Customer Name */}
            <div>
              <label htmlFor="customer-name" className="block text-xs font-semibold text-muted mb-1">
                Customer Name *
              </label>
              <input
                ref={nameInputRef}
                id="customer-name"
                type="text"
                required
                placeholder="David Perera"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full input-dark py-2"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="customer-phone" className="block text-xs font-semibold text-muted mb-1">
                Phone Number *
              </label>
              <input
                id="customer-phone"
                type="tel"
                required
                placeholder="0771234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full input-dark py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Interested Vehicle */}
            <div>
              <label htmlFor="vehicle-chassis" className="block text-xs font-semibold text-muted mb-1">
                Vehicle of Interest
              </label>
              <select
                id="vehicle-chassis"
                value={chassisNumber}
                onChange={(e) => setChassisNumber(e.target.value)}
                className="w-full input-dark py-2 bg-surface text-white"
              >
                <option value="">-- Select Vehicle --</option>
                {vehicles.map((v) => (
                  <option key={v.chassisNumber} value={v.chassisNumber}>
                    {v.model.make} {v.model.modelName} ({v.chassisNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* Quoted Price */}
            <div>
              <label htmlFor="quoted-price" className="block text-xs font-semibold text-muted mb-1">
                Quoted Price (LKR)
              </label>
              <input
                id="quoted-price"
                type="number"
                placeholder="e.g. 10500000"
                value={quotedPrice}
                onChange={(e) => setQuotedPrice(e.target.value)}
                className="w-full input-dark py-2"
              />
            </div>
          </div>

          {/* Action Pills */}
          <div>
            <span className="block text-xs font-semibold text-muted mb-2">Required Next Action</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ACTION_TAGS.map((tag) => (
                <button
                  key={tag.value}
                  type="button"
                  onClick={() => setActionTag(tag.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-center transition-all border ${
                    actionTag === tag.value
                      ? "bg-accent/10 border-accent text-accent shadow-glow"
                      : "bg-surface-elevated border-border text-muted hover:text-white"
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea Remark */}
          <div>
            <label htmlFor="customer-remark" className="block text-xs font-semibold text-muted mb-1">
              Verbatim Customer Remark
            </label>
            <textarea
              id="customer-remark"
              rows={2}
              placeholder="e.g. Needs pricing details sent on WhatsApp..."
              value={customerRemark}
              onChange={(e) => setCustomerRemark(e.target.value)}
              className="w-full input-dark py-2 resize-none"
            />
            {/* Quick remark pills */}
            <div className="flex flex-wrap gap-2 mt-2">
              {QUICK_REMARKS.map((rem) => (
                <button
                  key={rem}
                  type="button"
                  onClick={() => setCustomerRemark(rem)}
                  className="px-2.5 py-1 bg-background hover:bg-surface-elevated text-subtle hover:text-muted rounded text-[10px] transition-colors border border-border"
                >
                  {rem}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date & Time */}
          <div>
            <label htmlFor="followup-due" className="block text-xs font-semibold text-muted mb-1">
              Follow-Up Action Due Date & Time
            </label>
            <input
              id="followup-due"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full input-dark py-2"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button
              type="button"
              onClick={handleClose}
              className="btn-ghost"
              disabled={logMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-accent flex items-center gap-2"
              disabled={logMutation.isPending}
            >
              {logMutation.isPending ? "Saving..." : "Save Walk-In Log"}
              <span className="text-[10px] opacity-75 font-mono">(Ctrl+Enter)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WalkInLoggerModal;
