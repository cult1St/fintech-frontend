export interface AddFundDTO {
  amount: number;
  fundType: "without_url" | "with_url";
}

export type WalletTransactionStatus = "success" | "pending" | "failed";

export interface WalletTransaction {
  id: string;
  reference: string;
  name: string;
  sub: string;
  type: "credit" | "debit";
  amount: number;
  status: WalletTransactionStatus;
  date: string;
  channel: string;
  createdAt?: string;
}

export interface WalletDetailsUser {
  avatarUrl?: string | null;
  email?: string;
  fullName?: string;
  id?: number | string;
  lastLoginAt?: string;
  username?: string;
}

export interface WalletTransactionItemDTO {
  amount: number;
  createdAt: string;
  id: number | string | null;
  reference: string;
  service: string | null;
  status: string | null;
  type: string | null;
}

export interface WalletDetailsDTO {
  balance: number;
  recentTransactions: WalletTransactionItemDTO[];
  user?: WalletDetailsUser;
}

export interface WalletTransactionsResponse {
  items: WalletTransaction[];
  page: number;
  size: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
}

export interface AddFundResponse {
  transactionReference: string;
  amount?: number;
  accessCode?: string;
  raw?: unknown;
}

export interface VerifyFundResult {
  reference: string;
  amount: number;
  balance?: number;
  status: true | "success" | "pending" | "failed";
  transaction?: Partial<WalletTransaction>;
  raw?: unknown;
}
