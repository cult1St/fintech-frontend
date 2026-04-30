import http from "./http";
import type {
  ChangePasswordPayload,
  AppearanceSettingsPayload,
  IntegrationSettingsPayload,
  NotificationPreferencesPayload,
  SecuritySettingsPayload,
  UserProfilePayload,
} from "@/dto/user";
import { normalizeApiError } from "@/utils/api-error";

/**
 * Backend response wrapper:
 * SuccessResponse<T> {
 *   message: string;
 *   data: T;
 * }
 */
interface SuccessResponse<T> {
  message: string;
  data: T;
}

interface UserData {
  id?: string | number;
  fullName?: string;
  full_name?: string;
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  role?: string;
  roleTitle?: string;
  avatarUrl?: string;
  avatar_url?: string;
  avatar?: string;
  profile_image?: string;
}

interface SettingsData {
  notifications?: NotificationPreferencesPayload;
  security?: SecuritySettingsPayload;
  appearance?: AppearanceSettingsPayload;
  integrations?: IntegrationSettingsPayload;
}

class UserService {
  private handleError(err: unknown): never {
    throw normalizeApiError(err);
  }

  // ==============================
  // SETTINGS
  // ==============================

  async getCurrentUser() {
    try {
      const response =
        await http.get<SuccessResponse<UserData>>("/users/me");

      return response.data.data; // unwrap SuccessResponse
    } catch (err) {
      this.handleError(err);
    }
  }

  async updateProfile(payload: UserProfilePayload) {
    try {
      const response =
        await http.patch<SuccessResponse<UserData>>("/users/settings/profile", payload);

      return response.data.data; // unwrap SuccessResponse
    } catch (err) {
      console.log(err);
      this.handleError(err);
    }
  }

  async changePassword(payload: ChangePasswordPayload) {
    try {
      const response =
        await http.patch<SuccessResponse<{ success: boolean }>>(
          "/users/settings/password-update",
          payload
        );

      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async getSettings() {
    try {
      const response =
        await http.get<SuccessResponse<SettingsData>>("/users/settings");

      return response.data.data; // unwrap SuccessResponse
    } catch (err) {
      this.handleError(err);
    }
  }

  async updateNotifications(payload: NotificationPreferencesPayload) {
    try {
      const response =
        await http.patch<SuccessResponse<NotificationPreferencesPayload>>(
          "/users/me/settings/notifications",
          payload
        );

      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async updateSecurity(payload: SecuritySettingsPayload) {
    try {
      const response =
        await http.patch<SuccessResponse<SecuritySettingsPayload>>(
          "/users/me/settings/security",
          payload
        );

      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async updateAppearance(payload: AppearanceSettingsPayload) {
    try {
      const response =
        await http.patch<SuccessResponse<AppearanceSettingsPayload>>(
          "/users/me/settings/appearance",
          payload
        );

      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async updateIntegrations(payload: IntegrationSettingsPayload) {
    try {
      const response =
        await http.patch<SuccessResponse<IntegrationSettingsPayload>>(
          "/users/me/settings/integrations",
          payload
        );

      return response.data.data;
    } catch (err) {
      this.handleError(err);
    }
  }

}

const userService = new UserService();
export default userService;
