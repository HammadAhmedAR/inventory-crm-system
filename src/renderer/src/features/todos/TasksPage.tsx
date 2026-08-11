import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TaskFilters } from "../../../../shared/ipc";
import type { Route } from "../../components/Sidebar";
import { useAppStore } from "../../store/useAppStore";
import AddTaskModal from "./components/AddTaskModal";
import TaskCard from "./components/TaskCard";
import { useSoftDelete } from "../../hooks/useRecycleBin";

interface Props { onNavigate: (route: Route) => void }
const categories: Array<{ value: NonNullable<TaskFilters["category"]>; label: string }> = [{ value: "ALL", label: "All Tasks" }, { value: "SALES", label: "👥 Sales Follow-ups" }, { value: "INVENTORY", label: "🚗 Vehicle Repairs & Custody" }];
const timelines: Array<{ value: NonNullable<TaskFilters["timeline"]>; label: string }> = [{ value: "ALL", label: "All" }, { value: "OVERDUE", label: "🔴 Overdue" }, { value: "TODAY", label: "🟡 Due Today" }, { value: "UPCOMING", label: "🟢 Upcoming" }, { value: "COMPLETED", label: "✔️ Completed" }];

const TasksPage: React.FC<Props> = ({ onNavigate }) => {
  const [filters, setFilters] = useState<TaskFilters>({ category: "ALL", timeline: "ALL" });
  const [addOpen, setAddOpen] = useState(false);
  const client = useQueryClient();
  const setCustomer = useAppStore((state) => state.setSelectedCustomerId);
  const setChassis = useAppStore((state) => state.setSelectedChassisNumber);
  const softDelete = useSoftDelete();
  const { data: tasks = [], isLoading, error } = useQuery({ queryKey: ["tasks", filters], queryFn: () => window.api.tasks.getAll(filters) });
  const update = useMutation({ mutationFn: window.api.tasks.updateStatus, onSuccess: () => Promise.all([client.invalidateQueries({ queryKey: ["tasks"] }), client.invalidateQueries({ queryKey: ["dailyTasks"] })]) });
  return <section className="h-full overflow-y-auto p-5 lg:p-7"><div className="mx-auto max-w-[1500px]"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-accent">Unified workspace</p><h2 className="mt-1 text-2xl font-bold text-white">Tasks & Reminders</h2><p className="mt-1 text-sm text-muted">Sales follow-ups, repair dispatches, and vehicle custody checks in one queue.</p></div><button onClick={() => setAddOpen(true)} className="btn-accent">+ Add Custom Task</button></div>
    <div className="card mt-6 p-4"><div className="flex flex-wrap gap-2">{categories.map((item) => <button key={item.value} onClick={() => setFilters((x) => ({ ...x, category: item.value }))} className={`rounded-full border px-4 py-2 text-xs font-semibold ${filters.category === item.value ? "border-accent bg-accent/10 text-accent" : "border-border text-muted hover:text-white"}`}>{item.label}</button>)}</div><div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">{timelines.map((item) => <button key={item.value} onClick={() => setFilters((x) => ({ ...x, timeline: item.value }))} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${filters.timeline === item.value ? "bg-surface-elevated text-white ring-1 ring-accent/40" : "text-muted hover:bg-surface-elevated"}`}>{item.label}</button>)}</div></div>
    {error && <div className="mt-5 rounded-lg bg-red-500/10 p-4 text-sm text-red-300">Unable to load tasks.</div>}{isLoading ? <div className="mt-5 text-sm text-muted">Loading tasks…</div> : tasks.length === 0 ? <div className="card mt-5 p-12 text-center text-muted">No tasks match the selected filters.</div> : <div className="mt-5 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">{tasks.map((task) => <TaskCard key={task.id} task={task} busy={update.isPending && update.variables?.taskId === task.id} onStatus={(status) => update.mutate({ taskId: task.id, status })} onDelete={() => softDelete.mutate({ entityType: "TASK", id: task.id })} onDetails={() => { if (task.customerId) { setCustomer(task.customerId); onNavigate("/prospects"); } else if (task.chassisNumber) { setChassis(task.chassisNumber); onNavigate("/inventory"); } }} />)}</div>}
  </div><AddTaskModal open={addOpen} onClose={() => setAddOpen(false)} /></section>;
};
export default TasksPage;
