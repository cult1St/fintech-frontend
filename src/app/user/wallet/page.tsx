"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Modal from "@/components/Modal";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/context/auth-context";
import { useWallet } from "@/context/wallet-context";
import walletService from "@/services/wallet.service";
import PaystackPop from '@paystack/inline-js';

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: Record<string, unknown>) => { openIframe: () => void };
    };
  }
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);

function usePaystackScript() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.PaystackPop) {
      setIsReady(true);
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-paystack-script="true"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => setIsReady(true));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.dataset.paystackScript = "true";
    script.onload = () => setIsReady(true);
    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, []);

  return isReady;
}

export default function WalletPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paystackReady = usePaystackScript();
  const { user } = useAuth();
  const { balance, transactions, applyVerifiedFunding } = useWallet();
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
      applyVerifiedFunding(result);
      setIsModalOpen(false);
      setAmount("");
      showToast("Wallet funded successfully.", "success");
    } catch (err) {
      showToast(
        (err as { message?: string })?.message || "Unable to verify this funding attempt.",
        "error"
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAddMoney = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || isVerifying) return;

    const numericAmount = Number(amount);
    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    const email = user?.email;

    if (!numericAmount || numericAmount <= 0) {
      showToast("Enter a valid amount to continue.", "error");
      return;
    }

    if (!email) {
      showToast("Your profile is missing an email address.", "error");
      return;
    }

    if (!paystackKey) {
      showToast("NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not configured.", "error");
      return;
    }

    if (!paystackReady || !window.PaystackPop) {
      showToast("Paystack is still loading. Try again in a moment.", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await walletService.addFund({
        amount: numericAmount,
        fundType: "without_url",
      });

      if (!response.transactionReference) {
        throw new Error("No transaction reference returned from add-fund.");
      }

      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email,
        amount: numericAmount * 100,
        ref: response.transactionReference,
        callback: () => {
          void handleVerifyFunding(response.transactionReference);
        },
        onClose: () => {
          showToast("Payment window closed before verification.", "info");
        },
      });

      handler.openIframe();
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Unable to start wallet funding.";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
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
              {successfulCredits.length} successful funding transaction
              {successfulCredits.length === 1 ? "" : "s"}
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
              <button type="button" className="see-all-btn" onClick={() => router.push("/user/transactions")}>
                View full history
              </button>
            </div>

            {transactions.slice(0, 6).map((transaction) => (
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
                    {transaction.reference} - {transaction.channel}
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
              Funding guide
            </div>
            <div className="summary-box">
              <div className="summary-row">
                <span>Step 1</span>
                <span>Create a funding request</span>
              </div>
              <div className="summary-row">
                <span>Step 2</span>
                <span>Complete payment in Paystack</span>
              </div>
              <div className="summary-row total">
                <span>Step 3</span>
                <span>Verify and update wallet state</span>
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text2)" }}>
              Verified Paystack payments are appended to wallet state automatically,
              so your balance and transaction list stay in sync.
            </p>
          </div>

          <div className="card">
            <div className="section-title" style={{ marginBottom: "12px" }}>
              Wallet summary
            </div>
            <div className="metric-card" style={{ marginBottom: "0.75rem" }}>
              <div className="metric-lbl">Available balance</div>
              <div className="metric-val">{formatCurrency(balance)}</div>
              <div className="metric-change metric-up">Live wallet state</div>
            </div>
            <div className="metric-card">
              <div className="metric-lbl">Recorded transactions</div>
              <div className="metric-val">{transactions.length}</div>
              <div className="metric-change metric-up">Mock activity plus verified funding</div>
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
            <small className="form-hint">Funding requests use the existing wallet service flow.</small>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting || isVerifying}
            style={{ opacity: isSubmitting || isVerifying ? 0.6 : 1 }}
          >
            {isSubmitting
              ? "Opening Paystack..."
              : isVerifying
                ? "Verifying payment..."
                : "Continue to Paystack"}
          </button>
        </form>
      </Modal>
    </>
  );
}
