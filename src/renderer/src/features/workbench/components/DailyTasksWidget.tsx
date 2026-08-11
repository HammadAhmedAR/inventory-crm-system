import React, { useMemo } from "react";
import { useDailyTasks, useCompleteTask } from "../../../hooks/useCrmQueries";
import { useAppStore } from "../../../store/useAppStore";
import { formatWhatsAppUrl } from "../../../lib/whatsapp";

type Task = Awaited<ReturnType<Window["api"]["crm"]["getTasks"]>>[number];

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onSelectCustomer: (id: string) => void;
  selectedId: string | null;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onComplete,
  onSelectCustomer,
  selectedId,
}) => {
  const isSelected = selectedId === task.customerId;

  const whatsAppUrl = useMemo(() => {
    const msg = `Hello ${task.customer.fullName}, following up regarding: "${task.title}". Please let us know if you have any questions!`;
    return formatWhatsAppUrl(task.customer.phone, msg);
  }, [task]);

  const showWhatsAppBtn = task.actionType === "WHATSAPP";

  return (
    <div
      onClick={() => onSelectCustomer(task.customerId)}
      className={`card p-4 transition-all duration-150 cursor-pointer flex items-center justify-between gap-4 border-l-4 hover:bg-surface-elevated/40 ${
        isSelected ? "border-l-accent bg-surface-elevated/20 shadow-glow" : "border-l-border"
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        {/* Complete Checkbox */}
        <input
          type="checkbox"
          id={`complete-task-${task.id}`}
          checked={task.status === "COMPLETED"}
          onChange={(e) => {
            e.stopPropagation();
            onComplete(task.id);
          }}
          className="mt-1 w-4 h-4 rounded border-border text-accent bg-background focus:ring-accent focus:ring-offset-background"
          aria-label={`Mark task as complete: ${task.title}`}
        />
        <div className="min-w-0">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span
              className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                task.actionType === "WHATSAPP"
                  ? "bg-success-muted text-success"
                  : "bg-info-muted text-info"
              }`}
            >
              {task.actionType}
            </span>
            {task.dueTime && (
              <span className="badge-muted text-[9px]">{task.dueTime}</span>
            )}
          </div>

          <h4 className="text-white text-sm font-semibold truncate leading-snug">
            {task.title}
          </h4>
          <p className="text-muted text-xs font-medium truncate mt-0.5">
            👤 {task.customer.fullName} • <span className="font-mono text-subtle">{task.customer.phone}</span>
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        {showWhatsAppBtn && (
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-success hover:bg-success/80 text-white transition-colors"
            title="Send WhatsApp Follow-up"
            aria-label="Send WhatsApp message"
          >
            💬
          </a>
        )}
        <button
          onClick={() => onSelectCustomer(task.customerId)}
          className="btn-ghost px-2.5 py-1 text-xs"
          aria-label="View customer details"
        >
          View ➔
        </button>
      </div>
    </div>
  );
};

const DailyTasksWidget: React.FC = () => {
  const { data: tasks = [], isLoading } = useDailyTasks();
  const completeMutation = useCompleteTask();
  const { selectedCustomerId, setSelectedCustomerId } = useAppStore();

  const handleComplete = (taskId: string) => {
    completeMutation.mutate(taskId);
  };

  // Categorize tasks into OVERDUE, DUE TODAY, and UPCOMING
  const categorizedTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue: Task[] = [];
    const dueToday: Task[] = [];
    const upcoming: Task[] = [];

    // Filter out completed tasks from the active view
    const activeTasks = tasks.filter((t) => t.status === "PENDING");

    activeTasks.forEach((task) => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);

      if (taskDate.getTime() < today.getTime()) {
        overdue.push(task);
      } else if (taskDate.getTime() === today.getTime()) {
        dueToday.push(task);
      } else {
        upcoming.push(task);
      }
    });

    return { overdue, dueToday, upcoming };
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="card p-6 h-[500px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted">
          <div className="w-6 h-6 border-2 border-border border-t-accent rounded-full animate-spin" />
          <p className="text-xs">Loading task queues…</p>
        </div>
      </div>
    );
  }

  const { overdue, dueToday, upcoming } = categorizedTasks;
  const totalActive = overdue.length + dueToday.length + upcoming.length;

  return (
    <div className="flex flex-col h-full bg-background space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h3 className="text-white font-bold text-base">Active Task Queue</h3>
          <p className="text-subtle text-xs">Today&apos;s actions, messages, and calls</p>
        </div>
        <span className="badge-accent">{totalActive} Pending</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-5 pr-1">
        {totalActive === 0 && (
          <div className="card p-8 text-center border-dashed border-2">
            <span className="text-3xl block mb-2">🎉</span>
            <h4 className="text-white font-semibold text-sm">Inbox Zero!</h4>
            <p className="text-subtle text-xs mt-1">All follow-ups and WhatsApp queues completed.</p>
          </div>
        )}

        {/* OVERDUE SECTION */}
        {overdue.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-danger font-bold text-xs uppercase tracking-wider px-1">
              <span>🔴</span>
              <span>Overdue ({overdue.length})</span>
            </div>
            <div className="space-y-2">
              {overdue.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleComplete}
                  onSelectCustomer={setSelectedCustomerId}
                  selectedId={selectedCustomerId}
                />
              ))}
            </div>
          </div>
        )}

        {/* DUE TODAY SECTION */}
        {dueToday.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-wider px-1">
              <span>🟡</span>
              <span>Due Today ({dueToday.length})</span>
            </div>
            <div className="space-y-2">
              {dueToday.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleComplete}
                  onSelectCustomer={setSelectedCustomerId}
                  selectedId={selectedCustomerId}
                />
              ))}
            </div>
          </div>
        )}

        {/* UPCOMING SECTION */}
        {upcoming.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-success font-bold text-xs uppercase tracking-wider px-1">
              <span>🟢</span>
              <span>Upcoming ({upcoming.length})</span>
            </div>
            <div className="space-y-2">
              {upcoming.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleComplete}
                  onSelectCustomer={setSelectedCustomerId}
                  selectedId={selectedCustomerId}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyTasksWidget;
