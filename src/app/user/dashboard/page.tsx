"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import UserLayoutClient from "../UserLayoutClient";
import Link from "next/link";

// Mock transaction data
const TRANSACTIONS = [
  {
    id: "PVT001",
    name: "Wallet Top-up",
    sub: "Paystack · Card",
    type: "credit",
    amount: 50000,
    status: "success",
    date: "Today",
    icon: "💸",
  },
  {
    id: "PVT002",
    name: "MTN Airtime",
    sub: "08031234567",
    type: "debit",
    amount: 500,
    status: "success",
    date: "Today",
    icon: "📱",
  },
  {
    id: "PVT003",
    name: "IKEDC Electricity",
    sub: "Meter: 45071882200",
    type: "debit",
    amount: 5000,
    status: "success",
    date: "Yesterday",
    icon: "⚡",
  },
  {
    id: "PVT004",
    name: "Airtel 2GB Data",
    sub: "08091234567",
    type: "debit",
    amount: 1200,
    status: "success",
    date: "Yesterday",
    icon: "📡",
  },
  {
    id: "PVT005",
    name: "Wallet Top-up",
    sub: "Bank transfer",
    type: "credit",
    amount: 100000,
    status: "success",
    date: "Apr 11",
    icon: "💸",
  },
];

// Spending breakdown data
const BREAKDOWN = [
  { label: "Airtime & Data", val: "₦12,400", pct: 32, color: "var(--blue)" },
  { label: "Electricity", val: "₦18,200", pct: 48, color: "var(--amber)" },
  { label: "TV & Cable", val: "₦9,000", pct: 24, color: "var(--purple)" },
  { label: "Transfers", val: "₦25,000", pct: 65, color: "var(--green)" },
];

// Weekly spending chart data
const WEEKLY_DATA = [8200, 12400, 9800, 15600, 7200, 11300, 10900];
const MAX_WEEKLY = Math.max(...WEEKLY_DATA);

export default function DashboardPage() {
  const router = useRouter();
  const [balance, setBalance] = useState("247,850.00");
  const [balanceHidden, setBalanceHidden] = useState(false);

  return (
    <UserLayoutClient pageTitle="Dashboard">
      <div className="two-col">
        {/* Left column */}
        <div>
          {/* Balance Card */}
          <div className="card balance-card" style={{ marginBottom: "1rem" }}>
            <div className="bal-label">
              <svg
                width="13"
                height="13"
                fill="none"
                viewBox="0 0 24 24"
                stroke="rgba(255,255,255,0.8)"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Available Balance
              <button
                className="hide-bal-btn"
                onClick={() => setBalanceHidden(!balanceHidden)}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.8)",
                  cursor: "pointer",
                  fontSize: "12px",
                  marginLeft: "auto",
                }}
              >
                {balanceHidden ? "Show" : "Hide"}
              </button>
            </div>
            <div
              className="bal-amount"
              style={{
                filter: balanceHidden ? "blur(8px)" : "none",
                transition: "filter 0.3s",
              }}
            >
              ₦ {balance}
            </div>
            <div className="bal-meta">Last updated: Just now · Account: PV-7829045</div>
            <div className="enc-badge">
              <svg
                width="10"
                height="10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth="2.5"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              256-bit Encrypted
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions" style={{ marginBottom: "1rem" }}>
            <button
              className="action-btn"
              onClick={() => router.push("/user/fund")}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "1rem 0.5rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <div
                className="action-icon"
                style={{
                  background: "var(--green-light)",
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="var(--green-dark)"
                  strokeWidth="2.5"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <span
                className="action-label"
                style={{
                  fontSize: "12px",
                  fontWeight: "500",
                  color: "var(--text2)",
                }}
              >
                Fund
              </span>
            </button>

            <button
              className="action-btn"
              onClick={() => router.push("/user/airtime")}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "1rem 0.5rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <div
                className="action-icon"
                style={{
                  background: "var(--blue-light)",
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="var(--blue)"
                  strokeWidth="2"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.72 19a19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <span
                className="action-label"
                style={{
                  fontSize: "12px",
                  fontWeight: "500",
                  color: "var(--text2)",
                }}
              >
                Airtime
              </span>
            </button>

            <button
              className="action-btn"
              onClick={() => router.push("/user/data")}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "1rem 0.5rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <div
                className="action-icon"
                style={{
                  background: "var(--amber-light)",
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="var(--amber)"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <span
                className="action-label"
                style={{
                  fontSize: "12px",
                  fontWeight: "500",
                  color: "var(--text2)",
                }}
              >
                Data
              </span>
            </button>

            <button
              className="action-btn"
              onClick={() => router.push("/user/bills")}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "1rem 0.5rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <div
                className="action-icon"
                style={{
                  background: "var(--purple-light)",
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="var(--purple)"
                  strokeWidth="2"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                </svg>
              </div>
              <span
                className="action-label"
                style={{
                  fontSize: "12px",
                  fontWeight: "500",
                  color: "var(--text2)",
                }}
              >
                Bills
              </span>
            </button>
          </div>

          {/* Recent Transactions */}
          <div className="card">
            <div className="section-hdr">
              <span className="section-title">Recent transactions</span>
              <Link href="/user/transactions" className="see-all-btn">
                See all →
              </Link>
            </div>
            {TRANSACTIONS.slice(0, 5).map((tx) => (
              <div key={tx.id} className="tx-item">
                <div
                  className="tx-icon-wrap"
                  style={{
                    background: "var(--green-light)",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: "18px",
                  }}
                >
                  {tx.icon}
                </div>
                <div className="tx-info">
                  <div className="tx-name">{tx.name}</div>
                  <div className="tx-sub">{tx.sub}</div>
                </div>
                <div className="tx-right">
                  <div
                    className={`tx-amount ${tx.type}`}
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: tx.type === "credit" ? "var(--green-dark)" : "var(--red)",
                    }}
                  >
                    {tx.type === "credit" ? "+" : "-"}₦{tx.amount.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div>
          {/* Spending this week */}
          <div className="card" style={{ marginBottom: "1rem" }}>
            <div className="section-title" style={{ marginBottom: "12px" }}>
              Spending this week
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "12px" }}>
              <div>
                <div style={{ fontSize: "24px", fontWeight: "700" }}>₦52,400</div>
                <div style={{ fontSize: "12px", color: "var(--text3)" }}>Mon – Sun</div>
              </div>
              <div
                style={{
                  background: "var(--green-light)",
                  color: "var(--green-dark)",
                  fontSize: "12px",
                  fontWeight: "500",
                  padding: "4px 10px",
                  borderRadius: "20px",
                }}
              >
                ↑ 12%
              </div>
            </div>
            <div
              className="mini-chart"
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "5px",
                height: "56px",
              }}
            >
              {WEEKLY_DATA.map((val, idx) => (
                <div
                  key={idx}
                  className="bar"
                  style={{
                    flex: 1,
                    height: `${(val / MAX_WEEKLY) * 100}%`,
                    borderRadius: "3px 3px 0 0",
                    background: val === 15600 ? "var(--green)" : "var(--green-light)",
                    transition: "height 0.3s",
                  }}
                />
              ))}
            </div>
            <div
              className="chart-labels"
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "5px",
              }}
            >
              {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => (
                <span
                  key={idx}
                  className="chart-label"
                  style={{
                    fontSize: "10px",
                    color: "var(--text3)",
                    flex: 1,
                    textAlign: "center",
                  }}
                >
                  {day}
                </span>
              ))}
            </div>
          </div>

          {/* Spending breakdown */}
          <div className="card">
            <div className="section-title" style={{ marginBottom: "12px" }}>
              Spending breakdown
            </div>
            {BREAKDOWN.map((item, idx) => (
              <div key={idx} className="progress-wrap" style={{ marginBottom: "12px" }}>
                <div
                  className="progress-row"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "13px",
                    marginBottom: "5px",
                  }}
                >
                  <span>{item.label}</span>
                  <span style={{ fontWeight: "500" }}>{item.val}</span>
                </div>
                <div
                  className="progress-track"
                  style={{
                    height: "6px",
                    background: "var(--surface2)",
                    borderRadius: "3px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    className="progress-fill"
                    style={{
                      height: "100%",
                      borderRadius: "3px",
                      width: `${item.pct}%`,
                      background: item.color,
                      transition: "width 0.3s",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </UserLayoutClient>
  );
}

    when: formatShortDate(dateValue),
    whenColor: "var(--slate-400)",
    chipLabel: "On Track",
    chipClass: "tag-teal",
  };
};

const mapNotificationColor = (type: NotificationDTO["type"]) => {
  switch (type) {
    case "TASK_ASSIGNED":
      return "teal";
    case "TASK_UPDATED":
      return "violet";
    case "PROJECT_INVITE_SENT":
      return "amber";
    case "PROJECT_INVITE_ACCEPTED":
      return "teal";
    case "PROJECT_INVITE_REJECTED":
      return "rose";
    default:
      return "rose";
  }
};

const buildTaskList = (tasks: TaskDTO[], currentUserId?: number) => {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  const parseAssigneeId = (task: TaskDTO) => {
    if (typeof task.assignedToId === "number") return task.assignedToId;
    if (typeof task.assignee?.id === "number") return task.assignee.id;
    if (typeof task.assignee?.userId === "number") return task.assignee.userId;
    const parsed = Number(task.assignedToId ?? task.assignee?.id ?? task.assignee?.userId);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  return [...tasks]
    .sort((a, b) => {
      const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    })
    .slice(0, 6)
    .map((task) => {
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      const overdue =
        Boolean(dueDate) &&
        !Number.isNaN(dueDate?.getTime()) &&
        task.status !== "DONE" &&
        dueDate!.getTime() < startOfToday;

      const assigneeId = parseAssigneeId(task);
      const canToggle = currentUserId !== undefined && assigneeId !== undefined && currentUserId === assigneeId;

      return {
        id: task.id,
        name: task.title,
        done: task.status === "DONE",
        priority: task.priority,
        due: formatShortDate(task.dueDate),
        overdue,
        canToggle,
      };
    });
};

const buildProjectList = (projects: ProjectDTO[]) =>
  projects.slice(0, 4).map((project, index) => ({
    id: project.id,
    name: project.name,
    percent: Math.min(100, Math.max(0, project.progress || 0)),
    fillClass: PROJECT_FILL_CLASSES[index % PROJECT_FILL_CLASSES.length],
  }));

const buildDeadlines = (tasks: TaskDTO[]) => {
  const candidates = tasks
    .filter((task) => task.status !== "DONE")
    .filter((task) => task.dueDate)
    .sort((a, b) => {
      const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    })
    .slice(0, 4);

  return candidates.map((task) => {
    const meta = getDeadlineMeta(task.dueDate);
    return {
      id: task.id,
      name: task.title,
      ...meta,
    };
  });
};

const buildActivityItems = (notifications: NotificationDTO[]) =>
  notifications.slice(0, 6).map((notif) => ({
    id: notif.id,
    actor: notif.actorName || "System",
    actorIsYou: notif.actorName?.toLowerCase() === "you",
    text: notif.message,
    time: formatRelativeTime(notif.createdAt),
    color: mapNotificationColor(notif.type),
  }));

const loadProjectMembers = async (projects: ProjectDTO[], tasks: TaskDTO[]) => {
  if (!projects.length) return [] as TeamMember[];

  const tasksByAssignee = tasks.reduce<Record<number, number>>((acc, task) => {
    if (task.assignedToId) {
      acc[task.assignedToId] = (acc[task.assignedToId] || 0) + 1;
    }
    return acc;
  }, {});

  const memberLists = await Promise.all(
    projects.slice(0, 3).map((project) =>
      projectsService
        .listMembers(project.id)
        .then((data) => data || [])
        .catch(() => [])
    )
  );

  const unique = new Map<number, ProjectMemberDTO>();
  memberLists.flat().forEach((member) => {
    if (!member.userId) return;
    if (!unique.has(member.userId)) {
      unique.set(member.userId, member);
    }
  });

  return Array.from(unique.values()).map((member): TeamMember => {
    const name =
      member.fullName || member.full_name || member.name || member.email || "Team member";
    const status: "Online" | "Away" | "Offline" =
      member.status === "ACCEPTED"
        ? "Online"
        : member.status === "PENDING"
          ? "Away"
          : "Offline";

    return {
      id: member.userId,
      initials: toInitials(name),
      name,
      role: member.role || "Member",
      status,
      tasks: tasksByAssignee[member.userId] || 0,
    };
  });
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const router = useRouter();

  const [rawTasks, setRawTasks] = useState<TaskDTO[]>([]);
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef(true);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [taskData, projectData, notificationData] = await Promise.all([
        tasksService.list(),
        projectsService.list(),
        notificationsService.list({ limit: 8 }),
      ]);

      if (!isMounted.current) return;

      const safeTasks = taskData || [];
      const safeProjects = projectData || [];
      const safeNotifications = notificationData || [];

      setRawTasks(safeTasks);
      setProjects(buildProjectList(safeProjects));
      setActivityItems(buildActivityItems(safeNotifications));

      const members = await loadProjectMembers(safeProjects, safeTasks);
      if (!isMounted.current) return;
      setTeamMembers(members);
    } catch (err) {
      if (!isMounted.current) return;
      const message =
        (err as { message?: string })?.message ||
        "Unable to load dashboard data. Please try again.";
      setError(message);
      showToast(message, "error");
    } finally {
      if (!isMounted.current) return;
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    isMounted.current = true;
    void loadDashboard();
    return () => {
      isMounted.current = false;
    };
  }, [loadDashboard]);

  const displayName = user?.fullName || user?.full_name || user?.name || "Alex";

  const currentUserId = (() => {
    if (!user) return undefined;
    if (typeof user.id === "number") return user.id;
    const parsed = Number(user.id);
    return Number.isFinite(parsed) ? parsed : undefined;
  })();

  const tasks = useMemo(() => buildTaskList(rawTasks, currentUserId), [rawTasks, currentUserId]);
  const deadlines = useMemo(() => buildDeadlines(rawTasks), [rawTasks]);

  const stats = useMemo(() => {
    const total = rawTasks.length;
    const inProgress = rawTasks.filter((task) => task.status === "IN_PROGRESS").length;
    const completed = rawTasks.filter((task) => task.status === "DONE").length;
    const overdue = rawTasks.filter((task) => {
      if (!task.dueDate || task.status === "DONE") return false;
      const due = new Date(task.dueDate);
      if (Number.isNaN(due.getTime())) return false;
      const today = new Date();
      return due.getTime() < new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    }).length;

    const openTasks = rawTasks.filter((task) => task.status !== "DONE").length;
    return { total, inProgress, completed, overdue, openTasks };
  }, [rawTasks]);

  const handleToggleTask = async (taskId: number) => {
    const target = rawTasks.find((task) => task.id === taskId);
    if (!target) return;

    const nextStatus = target.status === "DONE" ? "IN_PROGRESS" : "DONE";

    // Optimistic UI update
    setRawTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: nextStatus } : task
      )
    );

    try {
      const updated = await tasksService.update(taskId, { status: nextStatus }, "status");
      if (updated) {
        setRawTasks((prev) =>
          prev.map((task) =>
            task.id === taskId ? { ...task, status: updated.status || nextStatus } : task
          )
        );
      }
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        "Unable to update task status. Please try again.";
      showToast(message, "error");

      // Revert optimistic update
      setRawTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: target.status } : task
        )
      );
    }
  };

  return (
    <div className="content-area">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Header */}
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1 className="page-title">Good morning, {displayName}</h1>
          <p className="page-subtitle">
            You have {stats.openTasks} open tasks and {deadlines.length} deadlines this week.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button className="btn btn-secondary btn-sm">?? Reports</button>
          <button className="btn btn-primary btn-sm" onClick={() => router.push('/user/tasks?create=true')}>+ Add Task</button>
        </div>
      </div>

      {error ? (
        <div className="card" style={{ marginBottom: "1.25rem", border: "1px solid var(--rose-500)" }}>
          <div className="card-header">
            <span className="card-title">Unable to load dashboard</span>
          </div>
          <div style={{ padding: "1rem" }}>
            <p style={{ margin: 0, color: "var(--rose-200)" }}>{error}</p>
            <button
              className="btn btn-secondary btn-sm"
              style={{ marginTop: "0.75rem" }}
              onClick={() => void loadDashboard()}
            >
              Retry
            </button>
          </div>
        </div>
      ) : null}

      {/* Stats row */}
      <div className="stats-grid">
        <StatCard
          variant="teal"
          icon="??"
          value={stats.total}
          label="Total Tasks"
          change={isLoading ? "Loading" : "Updated from backend"}
          changeDir="up"
        />
        <StatCard
          variant="amber"
          icon="??"
          value={stats.inProgress}
          label="In Progress"
          change={isLoading ? "Loading" : "Live status"}
          changeDir="up"
        />
        <StatCard
          variant="violet"
          icon="?"
          value={stats.completed}
          label="Completed"
          change={isLoading ? "Loading" : "This period"}
          changeDir="up"
        />
        <StatCard
          variant="rose"
          icon="?"
          value={stats.overdue}
          label="Overdue"
          change={isLoading ? "Loading" : "Needs attention"}
          changeDir="down"
        />
      </div>

      {/* Two-column grid */}
      <div className="dashboard-grid">
        {/* Left */}
        <div>
          <div className="card" style={{ marginBottom: "1.25rem" }}>
            <div className="card-header">
              <span className="card-title">?? My Tasks</span>
              <button className="btn btn-secondary btn-sm">View All ?</button>
            </div>
            <div style={{ padding: "0.25rem 1.5rem" }}>
              {tasks.length ? (
                tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={handleToggleTask}
                    canToggle={task.canToggle}
                  />
                ))
              ) : (
                <div style={{ padding: "0.75rem 0", color: "var(--slate-400)" }}>
                  No tasks to display.
                </div>
              )}
            </div>
          </div>
          <ActivityFeed items={activityItems} />
        </div>

        {/* Right */}
        <div>
          <ProjectProgress projects={projects} />
          <DeadlinesCard deadlines={deadlines} />
          {teamMembers.length ? <TeamCard members={teamMembers} /> : null}
        </div>
      </div>
    </div>
  );
}
