"use client";

import { useMemo, useState } from "react";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";

type NetworkOption = "MTN" | "Airtel" | "Glo" | "9Mobile";

const NETWORKS: NetworkOption[] = ["MTN", "Airtel", "Glo", "9Mobile"];

const DATA_PLANS: Record<
  NetworkOption,
  Array<{ id: string; size: string; meta: string; price: number }>
> = {
  MTN: [
    { id: "mtn-1", size: "1.5GB", meta: "30 days", price: 1200 },
    { id: "mtn-2", size: "3GB", meta: "30 days", price: 2000 },
    { id: "mtn-3", size: "10GB", meta: "30 days", price: 5000 },
  ],
  Airtel: [
    { id: "airtel-1", size: "1GB", meta: "7 days", price: 500 },
    { id: "airtel-2", size: "4GB", meta: "30 days", price: 2000 },
    { id: "airtel-3", size: "15GB", meta: "30 days", price: 6000 },
  ],
  Glo: [
    { id: "glo-1", size: "1.8GB", meta: "14 days", price: 500 },
    { id: "glo-2", size: "5GB", meta: "30 days", price: 1500 },
    { id: "glo-3", size: "12.5GB", meta: "30 days", price: 5000 },
  ],
  "9Mobile": [
    { id: "9mobile-1", size: "1GB", meta: "30 days", price: 1000 },
    { id: "9mobile-2", size: "5GB", meta: "30 days", price: 3500 },
    { id: "9mobile-3", size: "11GB", meta: "30 days", price: 8000 },
  ],
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function DataPage() {
  const { toasts, showToast, removeToast } = useToast();
  const [network, setNetwork] = useState<NetworkOption>("MTN");
  const [phone, setPhone] = useState("08031234567");
  const [selectedPlanId, setSelectedPlanId] = useState(DATA_PLANS.MTN[0].id);

  const plans = DATA_PLANS[network];
  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) || plans[0],
    [plans, selectedPlanId]
  );

  const handleNetworkChange = (value: NetworkOption) => {
    setNetwork(value);
    setSelectedPlanId(DATA_PLANS[value][0].id);
  };

  const handlePurchase = () => {
    if (!phone || !selectedPlan) {
      showToast("Choose a plan and enter a phone number.", "error");
      return;
    }

    showToast(
      `${selectedPlan.size} data bundle purchase completed for ${phone}.`,
      "success"
    );
  };

  return (
    <div style={{ maxWidth: "480px" }}>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      <div className="card">
        <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "1.25rem" }}>
          Buy data bundle
        </h3>
        <div className="form-group">
          <label className="form-label">Select network</label>
          <div className="network-grid">
            {NETWORKS.map((item) => (
              <button
                key={item}
                type="button"
                className={`net-btn ${network === item ? "sel" : ""}`}
                onClick={() => handleNetworkChange(item)}
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
            placeholder="Enter phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Choose a plan</label>
          <div>
            {plans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                className={`plan-item ${selectedPlanId === plan.id ? "sel" : ""}`}
                style={{ width: "100%", background: "var(--surface)" }}
                onClick={() => setSelectedPlanId(plan.id)}
              >
                <div style={{ textAlign: "left" }}>
                  <div className="plan-size">{plan.size}</div>
                  <div className="plan-meta">{plan.meta}</div>
                </div>
                <div className="plan-price">{formatCurrency(plan.price)}</div>
              </button>
            ))}
          </div>
        </div>
        <button className="btn-primary" type="button" onClick={handlePurchase}>
          Buy data plan
        </button>
      </div>
    </div>
  );
}
