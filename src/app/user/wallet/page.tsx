"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PaystackPop from "@paystack/inline-js";
import Modal from "@/components/Modal";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/context/auth-context";
import { useWallet } from "@/context/wallet-context";
import walletService from "@/services/wallet.service";
import { getApiErrorMessage } from "@/utils/api-error";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);

export default function WalletPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { balance, transactions, isLoading, applyVerifiedFunding } = useWallet();
  const { toasts, showToast, removeToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const successfulCredits = useMemo(
    () => transactions.filter((item) => item.type === "credit" && item.status === "success"),
    [transactions]
  );

  useEffect(() => {
    if (searchParams.get("fund") === "true") {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const closeModal = () => {
    if (isSubmitting || isVerifying) return;
    setIsModalOpen(false);
    setAmount("");
  };

  const handleVerifyFunding = async (reference: string) => {
    setIsVerifying(true);

    try {
      const result = await walletService.verifyFund(reference);
      await applyVerifiedFunding(result);
      setIsModalOpen(false);
      setAmount("");
      showToast("Wallet funded successfully.", "success");
    } catch (err) {
      showToast(getApiErrorMessage(err, "Unable to verify this funding attempt."), "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAddMoney = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || isVerifying) return;

    const numericAmount = Number(amount);
    const email = user?.email;

    if (!numericAmount || numericAmount <= 0) {
      showToast("Enter a valid amount to continue.", "error");
      return;
    }

    if (!email) {
      showToast("Your profile is missing an email address.", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await walletService.addFund({
        amount: numericAmount,
        fundType: "with_url",
      });

      if (!response.accessCode) {
        throw new Error("No access code returned from backend.");
      }

      const popup = new PaystackPop();
      popup.resumeTransaction(response.accessCode);
      startVerificationPolling(response.transactionReference);
    } catch (err) {
      showToast(getApiErrorMessage(err, "Unable to start wallet funding."), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startVerificationPolling = (reference: string) => {
    const interval = setInterval(async () => {
      try {
        const result = await walletService.verifyFund(reference);

        if (result.status === true || result.status === "success") {
          await applyVerifiedFunding(result);
          showToast("Wallet funded successfully.", "success");
          clearInterval(interval);
          setIsModalOpen(false);
          setAmount("");
        }
      } catch {
        // Poll quietly until the funding is confirmed or timeout is reached.
      }
    }, 3000);

    setTimeout(() => clearInterval(interval), 60000);
  };

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <div className="two-col">
        <div>
          <div className="card balance-card" style={{ marginBottom: "1rem" }}>
            <div className="bal-label">Current wallet balance</div>
            <div className="bal-amount">{formatCurrency(balance)}</div>
            <div className="bal-meta">
              {isLoading
                ? "Loading your latest wallet activity..."
                : `${successfulCredits.length} successful funding transaction${successfulCredits.length === 1 ? "" : "s"}`}
            </div>
            <div style={{ marginTop: "1rem" }}>
              <button
                type="button"
                className="btn-primary"
                style={{ maxWidth: "220px", marginTop: 0 }}
                onClick={() => setIsModalOpen(true)}
              >
                Add money
              </button>
            </div>
          </div>

          <div className="card">
            <div className="section-hdr">
              <span className="section-title">Recent wallet transactions</span>
              <button
                type="button"
                className="see-all-btn"
                onClick={() => router.push("/user/transactions")}
              >
                View full history
              </button>
            </div>

            {transactions.length ? (
              transactions.slice(0, 6).map((transaction) => (
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
                      {transaction.reference} - {transaction.date}
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
              ))
            ) : (
              <div style={{ padding: "0.75rem 0", color: "var(--text3)" }}>
                No wallet transactions yet.
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: "1rem" }}>
            <div className="section-title" style={{ marginBottom: "12px" }}>
              How funding works
            </div>
            <div className="summary-box">
              <div className="summary-row">
                <span>Step 1</span>
                <span>Add funds</span>
              </div>
              <div className="summary-row">
                <span>Step 2</span>
                <span>Process payment from the gateway</span>
              </div>
              <div className="summary-row total">
                <span>Step 3</span>
                <span>Funds credited successfully</span>
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text2)" }}>
              Complete your payment and your wallet will update as soon as the funding is confirmed.
            </p>
          </div>

          <div className="card">
            <div className="section-title" style={{ marginBottom: "12px" }}>
              Wallet summary
            </div>
            <div className="metric-card" style={{ marginBottom: "0.75rem" }}>
              <div className="metric-lbl">Available balance</div>
              <div className="metric-val">{formatCurrency(balance)}</div>
              <div className="metric-change metric-up">Available for your next payment</div>
            </div>
            <div className="metric-card">
              <div className="metric-lbl">Recorded transactions</div>
              <div className="metric-val">{transactions.length}</div>
              <div className="metric-change metric-up">Latest wallet activity</div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <div className="modal-hdr">
          <div className="modal-title">Add money to wallet</div>
        </div>

        <form onSubmit={handleAddMoney}>
          <div className="form-group">
            <label className="form-label">Amount</label>
            <input
              className="form-input"
              type="number"
              min="100"
              step="100"
              inputMode="numeric"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="5000"
            />
            <small className="form-hint">Enter the amount you want to add to your wallet.</small>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting || isVerifying}
            style={{ opacity: isSubmitting || isVerifying ? 0.6 : 1 }}
          >
            {isSubmitting
              ? "Opening payment gateway..."
              : isVerifying
                ? "Confirming payment..."
                : "Continue to payment"}
          </button>
        </form>
      </Modal>
    </>
  );
}
