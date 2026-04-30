"use client";

import { useState } from "react";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";

type BillType = "electricity" | "tv";

export default function BillsPage() {
  const { toasts, showToast, removeToast } = useToast();
  const [billType, setBillType] = useState<BillType>("electricity");
  const [electricityAmount, setElectricityAmount] = useState("5000");
  const [tvPackage, setTvPackage] = useState("DStv Compact - N9,000/mo");

  return (
    <div style={{ maxWidth: "480px" }}>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <div className="grid-2" style={{ marginBottom: "1rem" }}>
        <button
          type="button"
          className="action-btn"
          onClick={() => setBillType("electricity")}
          style={
            billType === "electricity"
              ? { borderColor: "var(--green)", background: "var(--green-light)" }
              : undefined
          }
        >
          <div className="action-icon" style={{ background: "var(--amber-light)", fontSize: "22px" }}>
            E
          </div>
          <span className="action-label" style={{ fontSize: "13px" }}>
            Electricity
          </span>
        </button>

        <button
          type="button"
          className="action-btn"
          onClick={() => setBillType("tv")}
          style={
            billType === "tv"
              ? { borderColor: "var(--green)", background: "var(--green-light)" }
              : undefined
          }
        >
          <div className="action-icon" style={{ background: "var(--blue-light)", fontSize: "22px" }}>
            TV
          </div>
          <span className="action-label" style={{ fontSize: "13px" }}>
            TV / Cable
          </span>
        </button>
      </div>

      {billType === "electricity" ? (
        <div className="card">
          <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "1rem" }}>
            Electricity payment
          </h3>
          <div className="form-group">
            <label className="form-label">Provider</label>
            <select className="form-input" defaultValue="Ikeja Electric (IKEDC)">
              <option>Ikeja Electric (IKEDC)</option>
              <option>Eko Electricity (EKEDC)</option>
              <option>Abuja Electricity (AEDC)</option>
              <option>Enugu Electricity (EEDC)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Meter type</label>
            <select className="form-input" defaultValue="Prepaid">
              <option>Prepaid</option>
              <option>Postpaid</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Meter number</label>
            <input className="form-input" defaultValue="45071882200" />
          </div>
          <div className="customer-box">
            <span>
              Customer verified: <strong>ADAOBI NKEM OKONKWO</strong>
            </span>
          </div>
          <div className="form-group">
            <label className="form-label">Amount (Naira)</label>
            <input
              className="form-input"
              type="number"
              value={electricityAmount}
              onChange={(event) => setElectricityAmount(event.target.value)}
            />
          </div>
          <button
            className="btn-primary"
            type="button"
            onClick={() => showToast("Token sent to your phone via SMS.", "success")}
          >
            Pay N{Number(electricityAmount || 0).toLocaleString()}
          </button>
        </div>
      ) : null}

      {billType === "tv" ? (
        <div className="card">
          <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "1rem" }}>
            TV / Cable subscription
          </h3>
          <div className="form-group">
            <label className="form-label">Provider</label>
            <select className="form-input" defaultValue="DStv">
              <option>DStv</option>
              <option>GOtv</option>
              <option>Startimes</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Smart card number</label>
            <input className="form-input" defaultValue="7042819234" />
          </div>
          <div className="customer-box">
            <span>
              Customer: <strong>JAMES OKONKWO</strong> - Current: Compact
            </span>
          </div>
          <div className="form-group">
            <label className="form-label">Package</label>
            <select
              className="form-input"
              value={tvPackage}
              onChange={(event) => setTvPackage(event.target.value)}
            >
              <option>DStv Compact - N9,000/mo</option>
              <option>DStv Premium - N24,500/mo</option>
              <option>DStv Yanga - N2,950/mo</option>
            </select>
          </div>
          <button
            className="btn-primary"
            type="button"
            onClick={() => showToast("TV subscription renewed successfully.", "success")}
          >
            Pay {tvPackage.split(" - ")[1]?.replace("/mo", "") || "N9,000"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
