export interface AddFundDTO {
  amount: number;
  fundType: "without_url";
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
  isMock?: boolean;
}

export interface AddFundResponse {
  transactionReference: string;
  amount?: number;
}

export interface VerifyFundResult {
  reference: string;
  amount: number;
  balance?: number;
  status: WalletTransactionStatus;
  transaction?: Partial<WalletTransaction>;
  raw?: unknown;
}
