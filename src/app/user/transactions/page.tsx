"use client";

import { useWallet } from "@/context/wallet-context";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);

export default function TransactionsPage() {
  const { transactions } = useWallet();

  return (
    <div className="card">
      <div className="section-hdr">
        <span className="section-title">Transaction history</span>
        <span style={{ fontSize: "13px", color: "var(--text3)" }}>
          {transactions.length} record{transactions.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Description</th>
              <th>Date</th>
              <th>Status</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.reference}>
                <td>{transaction.reference}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{transaction.name}</div>
                  <div style={{ color: "var(--text3)", fontSize: "12px" }}>{transaction.sub}</div>
                </td>
                <td>{transaction.date}</td>
                <td>
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
                </td>
                <td className={`tx-amount ${transaction.type}`}>
                  {transaction.type === "credit" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
