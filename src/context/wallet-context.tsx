"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { VerifyFundResult, WalletTransaction } from "@/dto/wallet";
import { useAuth } from "./auth-context";

interface WalletContextValue {
  balance: number;
  transactions: WalletTransaction[];
  applyVerifiedFunding: (result: VerifyFundResult) => void;
  resetWallet: () => void;
}

const MOCK_TRANSACTIONS: WalletTransaction[] = [
  {
    id: "mock-1",
    reference: "PVT-001",
    name: "Wallet Top-up",
    sub: "Bank transfer",
    type: "credit",
    amount: 100000,
    status: "success",
    date: "Apr 26",
    channel: "Transfer",
    isMock: true,
  },
  {
    id: "mock-2",
    reference: "PVT-002",
    name: "DStv Compact",
    sub: "Bill payment",
    type: "debit",
    amount: 9000,
    status: "success",
    date: "Apr 25",
    channel: "Bills",
    isMock: true,
  },
  {
    id: "mock-3",
    reference: "PVT-003",
    name: "MTN Airtime",
    sub: "08031234567",
    type: "debit",
    amount: 2500,
    status: "success",
    date: "Apr 24",
    channel: "Airtime",
    isMock: true,
  },
];

const DEFAULT_BALANCE = 247850;
const STORAGE_KEY = "walletState";

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

function formatTransactionDate(date = new Date()) {
  return date.toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
  });
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [balance, setBalance] = useState(DEFAULT_BALANCE);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(MOCK_TRANSACTIONS);

  const resetWallet = useCallback(() => {
    setBalance(DEFAULT_BALANCE);
    setTransactions(MOCK_TRANSACTIONS);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const applyVerifiedFunding = useCallback((result: VerifyFundResult) => {
    const amount = result.amount || 0;

    setBalance((currentBalance) => {
      if (typeof result.balance === "number" && Number.isFinite(result.balance)) {
        return result.balance;
      }

      return currentBalance + amount;
    });

    setTransactions((currentTransactions) => {
      const existing = currentTransactions.find(
        (item) => item.reference === result.reference
      );
      if (existing) {
        return currentTransactions;
      }

      const nextTransaction: WalletTransaction = {
        id: result.reference,
        reference: result.reference,
        name: result.transaction?.name || "Wallet Top-up",
        sub: result.transaction?.sub || "Paystack",
        type: "credit",
        amount,
        status: result.status || "success",
        date: result.transaction?.date || formatTransactionDate(),
        channel: result.transaction?.channel || "Paystack",
      };

      return [nextTransaction, ...currentTransactions];
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const cached = sessionStorage.getItem(STORAGE_KEY);
    if (!cached) {
      return;
    }

    try {
      const parsed = JSON.parse(cached) as {
        balance?: number;
        transactions?: WalletTransaction[];
      };

      if (typeof parsed.balance === "number") {
        setBalance(parsed.balance);
      }

      if (Array.isArray(parsed.transactions) && parsed.transactions.length) {
        setTransactions(parsed.transactions);
      }
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ balance, transactions })
    );
  }, [balance, transactions]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      resetWallet();
    }
  }, [isAuthenticated, isLoading, resetWallet]);

  const value = useMemo(
    () => ({
      balance,
      transactions,
      applyVerifiedFunding,
      resetWallet,
    }),
    [applyVerifiedFunding, balance, resetWallet, transactions]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used inside WalletProvider");
  }
  return context;
}
