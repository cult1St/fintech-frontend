"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/context/auth-context";
import { useWallet } from "@/context/wallet-context";

const WEEKLY_SPEND = [8500, 12400, 9100, 15600, 7300, 11800, 9800];
const SPENDING_BREAKDOWN = [
  { label: "Airtime and Data", value: 12400, pct: 28, color: "var(--blue)" },
  { label: "Electricity", value: 18200, pct: 42, color: "var(--amber)" },
  { label: "TV and Cable", value: 9000, pct: 21, color: "var(--purple)" },
  { label: "Transfers", value: 25000, pct: 58, color: "var(--green)" },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { balance, transactions } = useWallet();
  const { toasts, showToast, removeToast } = useToast();
  const [balanceHidden, setBalanceHidden] = useState(false);

  const displayName =
    user?.fullName || user?.full_name || user?.name || user?.username || "there";

  const creditVolume = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.type === "credit")
        .reduce((total, transaction) => total + transaction.amount, 0),
    [transactions]
  );

  const recentTransactions = transactions.slice(0, 5);
  const weeklyMax = Math.max(...WEEKLY_SPEND);

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <div className="two-col">
        <div>
          <div className="card balance-card" style={{ marginBottom: "1rem" }}>
            <div className="bal-label">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.8)" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Available Balance
              <button
                type="button"
                className="hide-bal-btn"
                onClick={() => setBalanceHidden((current) => !current)}
              >
                {balanceHidden ? "Show" : "Hide"}
              </button>
            </div>
            <div
              className="bal-amount"
              style={{
                filter: balanceHidden ? "blur(8px)" : "none",
                transition: "filter 0.2s ease",
              }}
            >
              {formatCurrency(balance)}
            </div>
            <div className="bal-meta">
              Account overview for {displayName}
            </div>
            <div className="enc-badge">Protected session</div>
          </div>

          <div className="quick-actions" style={{ marginBottom: "1rem" }}>
            <button className="action-btn" type="button" onClick={() => router.push("/user/wallet?fund=true")}>
              <div className="action-icon" style={{ background: "var(--green-light)" }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--green-dark)" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <span className="action-label">Add Money</span>
            </button>

            <button className="action-btn" type="button" onClick={() => router.push("/user/transactions")}>
              <div className="action-icon" style={{ background: "var(--blue-light)" }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--blue)" strokeWidth="2">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2" />
                </svg>
              </div>
              <span className="action-label">History</span>
            </button>

            <button
              className="action-btn"
              type="button"
              onClick={() => showToast("Airtime and bill payments are still in demo mode.", "info")}
            >
              <div className="action-icon" style={{ background: "var(--amber-light)" }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--amber)" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.72 19a19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <span className="action-label">Airtime</span>
            </button>

            <button
              className="action-btn"
              type="button"
              onClick={() => showToast("Bill payments are still in demo mode.", "info")}
            >
              <div className="action-icon" style={{ background: "var(--purple-light)" }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--purple)" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                </svg>
              </div>
              <span className="action-label">Bills</span>
            </button>
          </div>

          <div className="card">
            <div className="section-hdr">
              <span className="section-title">Recent transactions</span>
              <button type="button" className="see-all-btn" onClick={() => router.push("/user/transactions")}>
                See all
              </button>
            </div>

            {recentTransactions.map((transaction) => (
              <div key={transaction.reference} className="tx-item">
                <div
                  className="tx-icon-wrap"
                  style={{
                    background:
                      transaction.type === "credit" ? "var(--green-light)" : "var(--surface2)",
                  }}
                >
                  {transaction.type === "credit" ? "+" : "-"}
                </div>
                <div className="tx-info">
                  <div className="tx-name">{transaction.name}</div>
                  <div className="tx-sub">
                    {transaction.sub} - {transaction.date}
                  </div>
                </div>
                <div className="tx-right">
                  <div className={`tx-amount ${transaction.type}`}>
                    {transaction.type === "credit" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </div>
                  <span
                    className={`pill ${
                      transaction.status === "success"
                        ? "pill-success"
                        : transaction.status === "pending"
                          ? "pill-pending"
                          : "pill-failed"
                    }`}
                  >
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: "1rem" }}>
            <div className="section-title" style={{ marginBottom: "12px" }}>
              Wallet snapshot
            </div>

            <div className="grid-2">
              <div className="metric-card">
                <div className="metric-lbl">Credits processed</div>
                <div className="metric-val">{formatCurrency(creditVolume)}</div>
                <div className="metric-change metric-up">Live from wallet state</div>
              </div>

              <div className="metric-card">
                <div className="metric-lbl">Transactions</div>
                <div className="metric-val">{transactions.length}</div>
                <div className="metric-change metric-up">Latest wallet activity</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: "1rem" }}>
            <div className="section-title" style={{ marginBottom: "12px" }}>
              Spending this week
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "12px" }}>
              <div>
                <div style={{ fontSize: "24px", fontWeight: "700" }}>{formatCurrency(52400)}</div>
                <div style={{ fontSize: "12px", color: "var(--text3)" }}>Demo spending view</div>
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
                12% up
              </div>
            </div>

            <div className="mini-chart">
              {WEEKLY_SPEND.map((value, index) => (
                <div
                  key={index}
                  className="bar"
                  style={{
                    height: `${(value / weeklyMax) * 100}%`,
                    background: value === weeklyMax ? "var(--green)" : "var(--green-light)",
                  }}
                />
              ))}
            </div>

            <div className="chart-labels">
              {["M", "T", "W", "T", "F", "S", "S"].map((label, index) => (
                <span key={index} className="chart-label">
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="section-title" style={{ marginBottom: "12px" }}>
              Spending breakdown
            </div>

            {SPENDING_BREAKDOWN.map((item) => (
              <div key={item.label} className="progress-wrap">
                <div className="progress-row">
                  <span>{item.label}</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(item.value)}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${item.pct}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
