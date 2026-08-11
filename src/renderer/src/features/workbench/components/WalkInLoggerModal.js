import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef, useCallback } from "react";
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
const WalkInLoggerModal = ({ open, onClose }) => {
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
    const nameInputRef = useRef(null);
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
    const handleSubmit = useCallback(async (e) => {
        e?.preventDefault();
        if (!fullName.trim() || !phone.trim())
            return;
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
    }, [fullName, phone, chassisNumber, quotedPrice, customerRemark, actionTag, dueDate, logMutation, handleClose]);
    // Ctrl+Enter or Enter (in inputs) submission support
    const handleKeyDown = useCallback((e) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSubmit();
        }
    }, [handleSubmit]);
    // Close on Escape key press
    useEffect(() => {
        const handleGlobalEsc = (e) => {
            if (e.key === "Escape" && isOpen) {
                handleClose();
            }
        };
        window.addEventListener("keydown", handleGlobalEsc);
        return () => window.removeEventListener("keydown", handleGlobalEsc);
    }, [handleClose, isOpen]);
    if (!isOpen)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto", role: "dialog", "aria-modal": "true", "aria-labelledby": "modal-title", children: [_jsx("div", { className: "absolute inset-0 bg-slate-950/70 backdrop-blur-sm animate-fade-in", onClick: handleClose }), _jsxs("div", { className: "relative z-10 w-full max-w-xl bg-surface border border-border rounded-2xl shadow-card animate-slide-in overflow-hidden", children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-border bg-background/50", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-xl", children: "\uD83D\uDEB6" }), _jsxs("div", { children: [_jsx("h2", { id: "modal-title", className: "text-white font-bold text-base leading-tight", children: "Quick Walk-In Logger" }), _jsx("p", { className: "text-subtle text-xs", children: "Instantly log visit details & actions" })] })] }), _jsx("button", { onClick: handleClose, className: "w-7 h-7 flex items-center justify-center rounded-lg text-muted hover:text-white hover:bg-surface-elevated transition-colors", "aria-label": "Close modal", children: "\u00D7" })] }), _jsxs("form", { onSubmit: handleSubmit, onKeyDown: handleKeyDown, className: "p-6 space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "customer-name", className: "block text-xs font-semibold text-muted mb-1", children: "Customer Name *" }), _jsx("input", { ref: nameInputRef, id: "customer-name", type: "text", required: true, placeholder: "David Perera", value: fullName, onChange: (e) => setFullName(e.target.value), className: "w-full input-dark py-2" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "customer-phone", className: "block text-xs font-semibold text-muted mb-1", children: "Phone Number *" }), _jsx("input", { id: "customer-phone", type: "tel", required: true, placeholder: "0771234567", value: phone, onChange: (e) => setPhone(e.target.value), className: "w-full input-dark py-2" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "vehicle-chassis", className: "block text-xs font-semibold text-muted mb-1", children: "Vehicle of Interest" }), _jsxs("select", { id: "vehicle-chassis", value: chassisNumber, onChange: (e) => setChassisNumber(e.target.value), className: "w-full input-dark py-2 bg-surface text-white", children: [_jsx("option", { value: "", children: "-- Select Vehicle --" }), vehicles.map((v) => (_jsxs("option", { value: v.chassisNumber, children: [v.model.make, " ", v.model.modelName, " (", v.chassisNumber, ")"] }, v.chassisNumber)))] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "quoted-price", className: "block text-xs font-semibold text-muted mb-1", children: "Quoted Price (LKR)" }), _jsx("input", { id: "quoted-price", type: "number", placeholder: "e.g. 10500000", value: quotedPrice, onChange: (e) => setQuotedPrice(e.target.value), className: "w-full input-dark py-2" })] })] }), _jsxs("div", { children: [_jsx("span", { className: "block text-xs font-semibold text-muted mb-2", children: "Required Next Action" }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2", children: ACTION_TAGS.map((tag) => (_jsx("button", { type: "button", onClick: () => setActionTag(tag.value), className: `px-3 py-2 rounded-lg text-xs font-medium text-center transition-all border ${actionTag === tag.value
                                                ? "bg-accent/10 border-accent text-accent shadow-glow"
                                                : "bg-surface-elevated border-border text-muted hover:text-white"}`, children: tag.label }, tag.value))) })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "customer-remark", className: "block text-xs font-semibold text-muted mb-1", children: "Verbatim Customer Remark" }), _jsx("textarea", { id: "customer-remark", rows: 2, placeholder: "e.g. Needs pricing details sent on WhatsApp...", value: customerRemark, onChange: (e) => setCustomerRemark(e.target.value), className: "w-full input-dark py-2 resize-none" }), _jsx("div", { className: "flex flex-wrap gap-2 mt-2", children: QUICK_REMARKS.map((rem) => (_jsx("button", { type: "button", onClick: () => setCustomerRemark(rem), className: "px-2.5 py-1 bg-background hover:bg-surface-elevated text-subtle hover:text-muted rounded text-[10px] transition-colors border border-border", children: rem }, rem))) })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "followup-due", className: "block text-xs font-semibold text-muted mb-1", children: "Follow-Up Action Due Date & Time" }), _jsx("input", { id: "followup-due", type: "datetime-local", value: dueDate, onChange: (e) => setDueDate(e.target.value), className: "w-full input-dark py-2" })] }), _jsxs("div", { className: "flex justify-end gap-3 pt-2 border-t border-border", children: [_jsx("button", { type: "button", onClick: handleClose, className: "btn-ghost", disabled: logMutation.isPending, children: "Cancel" }), _jsxs("button", { type: "submit", className: "btn-accent flex items-center gap-2", disabled: logMutation.isPending, children: [logMutation.isPending ? "Saving..." : "Save Walk-In Log", _jsx("span", { className: "text-[10px] opacity-75 font-mono", children: "(Ctrl+Enter)" })] })] })] })] })] }));
};
export default WalkInLoggerModal;
