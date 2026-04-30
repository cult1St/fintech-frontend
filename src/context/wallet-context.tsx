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
import walletService from "@/services/wallet.service";

interface WalletContextValue {
  balance: number;
  transactions: WalletTransaction[];
  isLoading: boolean;
  applyVerifiedFunding: (result: VerifyFundResult) => Promise<void>;
  resetWallet: () => void;
}

const DEFAULT_BALANCE = 0;
const STORAGE_KEY = "walletState";

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [balance, setBalance] = useState(DEFAULT_BALANCE);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const resetWallet = useCallback(() => {
    setBalance(DEFAULT_BALANCE);
    setTransactions([]);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const refreshWallet = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    setIsLoading(true);

    try {
      const details = await walletService.getDetails();
      const mappedTransactions = (details?.recentTransactions || []).map((transaction) =>
        walletService.mapWalletTransaction(transaction)
      );

      setBalance(Number(details?.balance || 0));
      setTransactions(mappedTransactions);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const applyVerifiedFunding = useCallback(
    async (result: VerifyFundResult) => {
      const normalizedStatus = result.status === true ? "success" : result.status;

      if (normalizedStatus === "success") {
        await refreshWallet();
        return;
      }

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

        return [
          {
            id: result.reference,
            reference: result.reference,
            name: result.transaction?.name || "Wallet Top-up",
            sub: result.transaction?.sub || "Wallet funding",
            type: "credit",
            amount,
            status: normalizedStatus || "pending",
            date: result.transaction?.date || "",
            channel: result.transaction?.channel || "Wallet funding",
            createdAt: result.transaction?.createdAt,
          },
          ...currentTransactions,
        ];
      });
    },
    [refreshWallet]
  );

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
    if (!isAuthLoading && isAuthenticated) {
      void refreshWallet();
    }
  }, [isAuthenticated, isAuthLoading, refreshWallet]);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      resetWallet();
    }
  }, [isAuthenticated, isAuthLoading, resetWallet]);

  const value = useMemo(
    () => ({
      balance,
      transactions,
      isLoading,
      applyVerifiedFunding,
      resetWallet,
    }),
    [applyVerifiedFunding, balance, isLoading, resetWallet, transactions]
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
