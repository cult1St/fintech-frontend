import {
  AddFundDTO,
  AddFundResponse,
  VerifyFundResult,
  WalletDetailsDTO,
  WalletTransaction,
  WalletTransactionItemDTO,
  WalletTransactionsResponse,
} from "@/dto/wallet";
import http from "./http";
import { normalizeApiError } from "@/utils/api-error";

interface SuccessResponse<T> {
  message?: string;
  data?: T;
  success?: boolean;
  status?: number;
}

class WalletService {
  private handleError(err: unknown): never {
    throw normalizeApiError(err);
  }

  private unwrap<T>(payload: SuccessResponse<T> | T | undefined) {
    if (!payload || typeof payload !== "object") {
      return payload as T | undefined;
    }

    const root = payload as SuccessResponse<T>;
    return root.data ?? (payload as T);
  }

  private normalizeTransactionStatus(
    value: string | boolean | null | undefined
  ): WalletTransaction["status"] {
    if (value === true) return "success";
    if (!value) return "success";

    const normalized = String(value).toLowerCase();
    if (normalized === "failed" || normalized === "failure") return "failed";
    if (normalized === "pending") return "pending";
    return "success";
  }

  private normalizeTransactionType(value: string | null | undefined) {
    return String(value || "CREDIT").toUpperCase() === "DEBIT" ? "debit" : "credit";
  }

  formatTransactionDate(createdAt?: string) {
    if (!createdAt) {
      return "";
    }

    const dateValue = new Date(createdAt);
    if (Number.isNaN(dateValue.getTime())) {
      return "";
    }

    return dateValue.toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  mapWalletTransaction(transaction: WalletTransactionItemDTO): WalletTransaction {
    const channel = transaction.service || "Wallet funding";
    const type = this.normalizeTransactionType(transaction.type);

    return {
      id: String(transaction.id ?? transaction.reference),
      reference: transaction.reference,
      name: type === "credit" ? "Wallet Top-up" : channel,
      sub: channel,
      type,
      amount: Number(transaction.amount || 0),
      status: this.normalizeTransactionStatus(transaction.status),
      date: this.formatTransactionDate(transaction.createdAt),
      channel,
      createdAt: transaction.createdAt,
    };
  }

  private normalizeVerifyResult(reference: string, payload: unknown): VerifyFundResult {
    const data = this.unwrap(payload as SuccessResponse<Record<string, unknown>>) as
      | Record<string, unknown>
      | undefined;

    const amount =
      Number(
        data?.amount ??
          data?.fundedAmount ??
          data?.transactionAmount ??
          (data?.transaction as Record<string, unknown> | undefined)?.amount ??
          0
      ) || 0;

    const balanceValue =
      data?.balance ??
      data?.walletBalance ??
      (data?.wallet as Record<string, unknown> | undefined)?.balance;
    const normalizedBalance =
      balanceValue === undefined || balanceValue === null ? undefined : Number(balanceValue);

    const transactionData =
      (data?.transaction as Partial<WalletTransaction> | undefined) ?? undefined;
    const rawStatus =
      (data?.status as string | boolean | undefined) ?? transactionData?.status ?? true;

    return {
      reference:
        (data?.transactionReference as string | undefined) ??
        (data?.reference as string | undefined) ??
        reference,
      amount,
      balance: Number.isFinite(normalizedBalance) ? normalizedBalance : undefined,
      status:
        rawStatus === true ? true : this.normalizeTransactionStatus(rawStatus),
      transaction: transactionData,
      raw: payload,
    };
  }

  private parseTransactionsPayload(payload: unknown, page: number, size: number): WalletTransactionsResponse {
    const data = this.unwrap(payload as SuccessResponse<Record<string, unknown>>) as
      | Record<string, unknown>
      | undefined;

    const listCandidate =
      (data?.content as WalletTransactionItemDTO[] | undefined) ??
      (data?.items as WalletTransactionItemDTO[] | undefined) ??
      (data?.transactions as WalletTransactionItemDTO[] | undefined) ??
      (data?.recentTransactions as WalletTransactionItemDTO[] | undefined) ??
      (Array.isArray(data) ? (data as WalletTransactionItemDTO[]) : undefined) ??
      [];

    const items = listCandidate.map((transaction) => this.mapWalletTransaction(transaction));

    const totalPages = Number(
      data?.totalPages ??
      data?.pages ??
      data?.pageCount ??
      0
    );

    const totalItems = Number(
      data?.totalElements ??
      data?.totalItems ??
      data?.count ??
      items.length
    );

    const currentPage = Number(
      data?.number ??
      data?.page ??
      page
    );

    const currentSize = Number(
      data?.size ??
      size
    );

    const hasNext =
      typeof data?.hasNext === "boolean"
        ? data.hasNext
        : totalPages > 0
          ? currentPage + 1 < totalPages
          : items.length >= currentSize;

    return {
      items,
      page: currentPage,
      size: currentSize,
      totalPages: totalPages > 0 ? totalPages : (hasNext ? currentPage + 2 : currentPage + 1),
      totalItems,
      hasNext,
    };
  }

  async getDetails() {
    try {
      const response = await http.get<SuccessResponse<WalletDetailsDTO>>("/wallet/details");
      return this.unwrap(response.data);
    } catch (err) {
      this.handleError(err);
    }
  }

  async getTransactions(page = 0, size = 10) {
    try {
      const response = await http.get("/wallet/transactions", {
        params: { page, size },
      });
      return this.parseTransactionsPayload(response.data, page, size);
    } catch (err) {
      this.handleError(err);
    }
  }

  async addFund(payload: AddFundDTO) {
    try {
      const response = await http.post("/wallets/fund/add-fund", payload);
      const data = this.unwrap(response.data as SuccessResponse<Record<string, unknown>>) as
        | Record<string, unknown>
        | undefined;

      return {
        transactionReference:
          (data?.transactionReference as string | undefined) ??
          (data?.reference as string | undefined) ??
          "",
        amount: Number(data?.amount ?? payload.amount) || payload.amount,
        raw: response.data,
        accessCode: data?.accessCode as string | undefined,
      } satisfies AddFundResponse;
    } catch (err) {
      this.handleError(err);
    }
  }

  async verifyFund(reference: string) {
    try {
      const response = await http.post(`/wallets/fund/verify-fund/${reference}`);
      return this.normalizeVerifyResult(reference, response.data);
    } catch (err) {
      this.handleError(err);
    }
  }
}

const walletService = new WalletService();
export default walletService;
