"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";

type NetworkOption = "MTN" | "Airtel" | "Glo" | "9Mobile";

const NETWORKS: NetworkOption[] = ["MTN", "Airtel", "Glo", "9Mobile"];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

function buildReference(prefix: string) {
  return `${prefix}-${Date.now()}`;
}

export default function AirtimePage() {
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [network, setNetwork] = useState<NetworkOption>("MTN");
  const [phone, setPhone] = useState("08031234567");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");

  const numericAmount = Number(amount || 0);

  const summary = useMemo(
    () => [
      { label: "Network", value: network },
      { label: "Phone number", value: phone },
      { label: "Amount", value: numericAmount ? formatCurrency(numericAmount) : "-" },
    ],
    [network, phone, numericAmount]
  );

  const handleContinue = () => {
    if (!phone || !numericAmount) {
      showToast("Enter a phone number and amount to continue.", "error");
      return;
    }

    setStep(2);
  };

  const handlePurchase = () => {
    setReference(buildReference("PVA"));
    setStep(3);
    showToast("Airtime purchase completed successfully.", "success");
  };

  const resetFlow = () => {
    setStep(1);
    setAmount("");
    setReference("");
  };

  return (
    <div style={{ maxWidth: "480px" }}>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {step === 1 ? (
        <div className="card">
          <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "1.25rem" }}>
            Buy airtime
          </h3>
          <div className="form-group">
            <label className="form-label">Select network</label>
            <div className="network-grid">
              {NETWORKS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`net-btn ${network === item ? "sel" : ""}`}
                  onClick={() => setNetwork(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Phone number</label>
            <input
              className="form-input"
              placeholder="+234 800 000 0000"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Amount (Naira)</label>
            <input
              className="form-input"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div className="chips-row">
            {[100, 200, 500, 1000].map((value) => (
              <button
                key={value}
                type="button"
                className="chip"
                onClick={() => setAmount(String(value))}
              >
                {formatCurrency(value)}
              </button>
            ))}
          </div>
          <button className="btn-primary" type="button" onClick={handleContinue}>
            Continue
          </button>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="card">
          <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "1.25rem" }}>
            Confirm airtime purchase
          </h3>
          <div className="summary-box">
            {summary.map((item) => (
              <div key={item.label} className="summary-row">
                <span>{item.label}</span>
                <span>{item.value}</span>
              </div>
            ))}
          </div>
          <button className="btn-primary" type="button" onClick={handlePurchase}>
            Buy airtime now
          </button>
          <button className="btn-outline" type="button" onClick={() => setStep(1)}>
            Edit
          </button>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="card success-screen">
          <div className="success-icon">P</div>
          <div className="success-title">Airtime sent!</div>
          <div className="success-sub">
            {formatCurrency(numericAmount)} of {network} airtime was sent to {phone}.
          </div>
          <div className="ref-box">
            <div className="ref-label">Reference</div>
            <div className="ref-value">{reference}</div>
          </div>
          <button className="btn-primary" type="button" onClick={resetFlow}>
            Buy again
          </button>
          <button className="btn-outline" type="button" onClick={() => router.push("/user/dashboard")}>
            Back to dashboard
          </button>
        </div>
      ) : null}
    </div>
  );
}
