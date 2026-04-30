"use client";

import { useCallback, useEffect, useState } from "react";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";
import walletService from "@/services/wallet.service";
import { WalletTransaction } from "@/dto/wallet";
import { getApiErrorMessage } from "@/utils/api-error";

const PAGE_SIZE = 10;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);

export default function TransactionsPage() {
  const { toasts, showToast, removeToast } = useToast();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  const loadTransactions = useCallback(
    async (nextPage = 0) => {
      setIsLoading(true);

      try {
        const response = await walletService.getTransactions(nextPage, PAGE_SIZE);
        setTransactions(response?.items || []);
        setPage(response?.page || 0);
        setTotalPages(response?.totalPages || 1);
        setTotalItems(response?.totalItems || 0);
        setHasNext(Boolean(response?.hasNext));
      } catch (err) {
        showToast(getApiErrorMessage(err, "Unable to load transactions."), "error");
      } finally {
        setIsLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    void loadTransactions(0);
  }, [loadTransactions]);

  return (
    <div className="card">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <div className="section-hdr">
        <span className="section-title">Transaction history</span>
        <span style={{ fontSize: "13px", color: "var(--text3)" }}>
          {totalItems} record{totalItems === 1 ? "" : "s"}
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
            {isLoading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "1rem" }}>
                  Loading transactions...
                </td>
              </tr>
            ) : transactions.length ? (
              transactions.map((transaction) => (
                <tr key={transaction.reference}>
                  <td>{transaction.reference}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{transaction.name}</div>
                    <div style={{ color: "var(--text3)", fontSize: "12px" }}>{transaction.sub}</div>
                  </td>
                  <td>{walletService.formatTransactionDate(transaction.createdAt)}</td>
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
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "1rem", color: "var(--text3)" }}>
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "1rem",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: "13px", color: "var(--text3)" }}>
          Page {page + 1} of {Math.max(totalPages, 1)}
        </span>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            type="button"
            className="btn-outline"
            style={{ width: "auto", marginTop: 0 }}
            onClick={() => void loadTransactions(page - 1)}
            disabled={isLoading || page === 0}
          >
            Previous
          </button>
          <button
            type="button"
            className="btn-primary"
            style={{ width: "auto", marginTop: 0 }}
            onClick={() => void loadTransactions(page + 1)}
            disabled={isLoading || !hasNext}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
