import { AxiosError } from "axios";
import http from "./http";
import { logError } from "@/utils/telemetry";
import { NotificationDTO } from "@/dto/notifications";
import { normalizeApiError } from "@/utils/api-error";

interface SuccessResponse<T> {
  message: string;
  data: T;
}

class NotificationsService {
  private handleError(err: unknown): never {
    logError(err, { service: "notifications" });
    throw normalizeApiError(err);
  }

  async list(params?: { unreadOnly?: boolean; limit?: number; offset?: number }) {
    try {
      const response = await http.get<SuccessResponse<NotificationDTO[]>>(
        "/notifications",
        { params }
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async unreadCount() {
    try {
      const response = await http.get<SuccessResponse<{ count: number }>>(
        "/notifications/unread-count"
      );
      return response.data.data.count;
    } catch (err) {
      this.handleError(err);
    }
  }

  async markRead(notificationId: number) {
    try {
      const response = await http.patch<SuccessResponse<NotificationDTO>>(
        `/notifications/${notificationId}/read`
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async markAllRead() {
    try {
      const response = await http.patch<SuccessResponse<{ success: true }>>(
        "/notifications/read-all"
      );
      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }
}

const notificationsService = new NotificationsService();
export default notificationsService;
