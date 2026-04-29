import { AxiosError } from "axios";
import { ErrorResponse } from "@/dto/auth";
import {
  AddFundDTO,
  AddFundResponse,
  VerifyFundResult,
  WalletTransaction,
} from "@/dto/wallet";
import http from "./http";

interface SuccessResponse<T> {
  message?: string;
  data?: T;
}

class WalletService {
  private handleError(err: unknown): never {
    const axiosError = err as AxiosError<ErrorResponse>;
    const data = axiosError.response?.data;

    if (data) {
      throw data;
    }

    throw {
      message: axiosError.message || "Network error",
      status: axiosError.response?.status,
    };
  }

  private unwrap<T>(payload: SuccessResponse<T> | T | undefined) {
    if (!payload || typeof payload !== "object") {
      return payload as T | undefined;
    }

    const root = payload as SuccessResponse<T>;
    return root.data ?? (payload as T);
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
    const status =
      (data?.status as WalletTransaction["status"] | undefined) ??
      transactionData?.status ??
      "success";

    return {
      reference:
        (data?.transactionReference as string | undefined) ??
        (data?.reference as string | undefined) ??
        reference,
      amount,
      balance: Number.isFinite(normalizedBalance) ? normalizedBalance : undefined,
      status,
      transaction: transactionData,
      raw: payload,
    };
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
        amount:
          Number(data?.amount ?? payload.amount) || payload.amount,
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
