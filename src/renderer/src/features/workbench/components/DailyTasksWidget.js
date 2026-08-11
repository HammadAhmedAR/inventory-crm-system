import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { useDailyTasks, useCompleteTask } from "../../../hooks/useCrmQueries";
import { useAppStore } from "../../../store/useAppStore";
import { formatWhatsAppUrl } from "../../../lib/whatsapp";
const TaskCard = ({ task, onComplete, onSelectCustomer, selectedId, }) => {
    const isSelected = selectedId === task.customerId;
    const whatsAppUrl = useMemo(() => {
        const msg = `Hello ${task.customer.fullName}, following up regarding: "${task.title}". Please let us know if you have any questions!`;
        return formatWhatsAppUrl(task.customer.phone, msg);
    }, [task]);
    const showWhatsAppBtn = task.actionType === "WHATSAPP";
    return (_jsxs("div", { onClick: () => onSelectCustomer(task.customerId), className: `card p-4 transition-all duration-150 cursor-pointer flex items-center justify-between gap-4 border-l-4 hover:bg-surface-elevated/40 ${isSelected ? "border-l-accent bg-surface-elevated/20 shadow-glow" : "border-l-border"}`, children: [_jsxs("div", { className: "flex items-start gap-3 min-w-0", children: [_jsx("input", { type: "checkbox", id: `complete-task-${task.id}`, checked: task.status === "COMPLETED", onChange: (e) => {
                            e.stopPropagation();
                            onComplete(task.id);
                        }, className: "mt-1 w-4 h-4 rounded border-border text-accent bg-background focus:ring-accent focus:ring-offset-background", "aria-label": `Mark task as complete: ${task.title}` }), _jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-1.5 mb-1", children: [_jsx("span", { className: `text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${task.actionType === "WHATSAPP"
                                            ? "bg-success-muted text-success"
                                            : "bg-info-muted text-info"}`, children: task.actionType }), task.dueTime && (_jsx("span", { className: "badge-muted text-[9px]", children: task.dueTime }))] }), _jsx("h4", { className: "text-white text-sm font-semibold truncate leading-snug", children: task.title }), _jsxs("p", { className: "text-muted text-xs font-medium truncate mt-0.5", children: ["\uD83D\uDC64 ", task.customer.fullName, " \u2022 ", _jsx("span", { className: "font-mono text-subtle", children: task.customer.phone })] })] })] }), _jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", onClick: (e) => e.stopPropagation(), children: [showWhatsAppBtn && (_jsx("a", { href: whatsAppUrl, target: "_blank", rel: "noopener noreferrer", className: "flex items-center justify-center w-8 h-8 rounded-lg bg-success hover:bg-success/80 text-white transition-colors", title: "Send WhatsApp Follow-up", "aria-label": "Send WhatsApp message", children: "\uD83D\uDCAC" })), _jsx("button", { onClick: () => onSelectCustomer(task.customerId), className: "btn-ghost px-2.5 py-1 text-xs", "aria-label": "View customer details", children: "View \u2794" })] })] }));
};
const DailyTasksWidget = () => {
    const { data: tasks = [], isLoading } = useDailyTasks();
    const completeMutation = useCompleteTask();
    const { selectedCustomerId, setSelectedCustomerId } = useAppStore();
    const handleComplete = (taskId) => {
        completeMutation.mutate(taskId);
    };
    // Categorize tasks into OVERDUE, DUE TODAY, and UPCOMING
    const categorizedTasks = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const overdue = [];
        const dueToday = [];
        const upcoming = [];
        // Filter out completed tasks from the active view
        const activeTasks = tasks.filter((t) => t.status === "PENDING");
        activeTasks.forEach((task) => {
            const taskDate = new Date(task.dueDate);
            taskDate.setHours(0, 0, 0, 0);
            if (taskDate.getTime() < today.getTime()) {
                overdue.push(task);
            }
            else if (taskDate.getTime() === today.getTime()) {
                dueToday.push(task);
            }
            else {
                upcoming.push(task);
            }
        });
        return { overdue, dueToday, upcoming };
    }, [tasks]);
    if (isLoading) {
        return (_jsx("div", { className: "card p-6 h-[500px] flex items-center justify-center", children: _jsxs("div", { className: "flex flex-col items-center gap-2 text-muted", children: [_jsx("div", { className: "w-6 h-6 border-2 border-border border-t-accent rounded-full animate-spin" }), _jsx("p", { className: "text-xs", children: "Loading task queues\u2026" })] }) }));
    }
    const { overdue, dueToday, upcoming } = categorizedTasks;
    const totalActive = overdue.length + dueToday.length + upcoming.length;
    return (_jsxs("div", { className: "flex flex-col h-full bg-background space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-border pb-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-white font-bold text-base", children: "Active Task Queue" }), _jsx("p", { className: "text-subtle text-xs", children: "Today's actions, messages, and calls" })] }), _jsxs("span", { className: "badge-accent", children: [totalActive, " Pending"] })] }), _jsxs("div", { className: "flex-1 overflow-y-auto space-y-5 pr-1", children: [totalActive === 0 && (_jsxs("div", { className: "card p-8 text-center border-dashed border-2", children: [_jsx("span", { className: "text-3xl block mb-2", children: "\uD83C\uDF89" }), _jsx("h4", { className: "text-white font-semibold text-sm", children: "Inbox Zero!" }), _jsx("p", { className: "text-subtle text-xs mt-1", children: "All follow-ups and WhatsApp queues completed." })] })), overdue.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2 text-danger font-bold text-xs uppercase tracking-wider px-1", children: [_jsx("span", { children: "\uD83D\uDD34" }), _jsxs("span", { children: ["Overdue (", overdue.length, ")"] })] }), _jsx("div", { className: "space-y-2", children: overdue.map((task) => (_jsx(TaskCard, { task: task, onComplete: handleComplete, onSelectCustomer: setSelectedCustomerId, selectedId: selectedCustomerId }, task.id))) })] })), dueToday.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-wider px-1", children: [_jsx("span", { children: "\uD83D\uDFE1" }), _jsxs("span", { children: ["Due Today (", dueToday.length, ")"] })] }), _jsx("div", { className: "space-y-2", children: dueToday.map((task) => (_jsx(TaskCard, { task: task, onComplete: handleComplete, onSelectCustomer: setSelectedCustomerId, selectedId: selectedCustomerId }, task.id))) })] })), upcoming.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2 text-success font-bold text-xs uppercase tracking-wider px-1", children: [_jsx("span", { children: "\uD83D\uDFE2" }), _jsxs("span", { children: ["Upcoming (", upcoming.length, ")"] })] }), _jsx("div", { className: "space-y-2", children: upcoming.map((task) => (_jsx(TaskCard, { task: task, onComplete: handleComplete, onSelectCustomer: setSelectedCustomerId, selectedId: selectedCustomerId }, task.id))) })] }))] })] }));
};
export default DailyTasksWidget;
