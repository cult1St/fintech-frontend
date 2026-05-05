"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";
import type { ValidationErrors } from "@/dto/auth";
import type {
  ChangePasswordPayload,
  SecuritySettingsPayload,
  UserProfilePayload,
} from "@/dto/user";
import userService from "@/services/user.service";
import {
  clearFieldError,
  getApiErrorMessage,
  getApiValidationErrors,
} from "@/utils/api-error";

interface LoadedUserShape {
  full_name?: string;
  fullName?: string;
  name?: string;
  email?: string;
  username?: string;
  phone?: string;
  roleTitle?: string;
  role?: string;
  avatar?: string;
  avatar_url?: string;
  avatarUrl?: string;
  profile_image?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();
  const { toasts, showToast, removeToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileErrors, setProfileErrors] = useState<ValidationErrors>({});
  const [passwordErrors, setPasswordErrors] = useState<ValidationErrors>({});

  const [profile, setProfile] = useState<UserProfilePayload>({
    fullName: "",
    email: "",
    roleTitle: "",
    phone: "",
    avatarUrl: "",
  });

  const [security, setSecurity] = useState<SecuritySettingsPayload>({
    twoFactorAuth: false,
    loginAlerts: true,
  });

  const [passwordForm, setPasswordForm] = useState<ChangePasswordPayload>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const displayName = useMemo(
    () =>
      profile.fullName ||
      user?.fullName ||
      user?.full_name ||
      user?.name ||
      "PayVault User",
    [profile.fullName, user?.fullName, user?.full_name, user?.name]
  );

  const initials = useMemo(
    () =>
      displayName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "PV",
    [displayName]
  );

  const splitName = useMemo(() => {
    const parts = displayName.trim().split(/\s+/).filter(Boolean);
    return {
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" "),
    };
  }, [displayName]);

  useEffect(() => {
    const bootstrap = async () => {
      setIsLoading(true);

      try {
        const meResponse = (await userService.getCurrentUser()) as
          | LoadedUserShape
          | { data?: LoadedUserShape };
        const me: LoadedUserShape =
          "data" in meResponse && meResponse.data
            ? meResponse.data
            : (meResponse as LoadedUserShape);

        setProfile({
          fullName:
            me.fullName ||
            me.full_name ||
            me.name ||
            user?.fullName ||
            user?.full_name ||
            user?.name ||
            "",
          email: me.email || user?.email || "",
          roleTitle: me.roleTitle || me.role || user?.role || "",
          phone: me.phone || "",
          avatarUrl:
            me.avatarUrl || me.avatar_url || me.avatar || me.profile_image || "",
        });

        try {
          const settingsResponse: SecuritySettingsPayload = await userService.getSettings();
         
          setSecurity((current) => ({
              ...current,
              ...settingsResponse,
            }));
          
            
          
        } catch {
          // Security settings may not be available yet.
        }
      } catch (err) {
        showToast(getApiErrorMessage(err, "Unable to load your profile."), "error");
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, [
    showToast,
    user?.email,
    user?.fullName,
    user?.full_name,
    user?.name,
    user?.role,
  ]);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setProfileErrors({});

    try {
      await userService.updateProfile(profile);
      await refreshUser();
      showToast("Profile updated successfully.", "success");
    } catch (err) {
      setProfileErrors(getApiValidationErrors(err));
      showToast(getApiErrorMessage(err, "Could not save profile changes."), "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveSecurity = async () => {
    setIsSavingSecurity(true);

    try {
      await userService.updateSecurity(security);
      showToast("Security settings updated.", "success");
    } catch (err) {
      showToast(getApiErrorMessage(err, "Could not update security settings."), "error");
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("New passwords do not match.", "error");
      return;
    }

    setIsChangingPassword(true);
    setPasswordErrors({});

    try {
      await userService.changePassword(passwordForm);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      showToast("Password updated successfully.", "success");
    } catch (err) {
      setPasswordErrors(getApiValidationErrors(err));
      showToast(getApiErrorMessage(err, "Could not update your password."), "error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    router.replace("/login");
  };

  const handleNamePartChange = (key: "firstName" | "lastName", value: string) => {
    const nextFirstName = key === "firstName" ? value : splitName.firstName;
    const nextLastName = key === "lastName" ? value : splitName.lastName;

    setProfile((current) => ({
      ...current,
      fullName: [nextFirstName, nextLastName].filter(Boolean).join(" ").trim(),
    }));
  };

  return (
    <div>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your account details and security</p>
      </div>

      {isLoading ? (
        <div className="card">
          <div style={{ color: "var(--text3)" }}>Loading your profile...</div>
        </div>
      ) : (
        <div className="two-col">
          <div>
            <div className="card" style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "1.5rem" }}>
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: "var(--green-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "var(--green-dark)",
                    overflow: "hidden",
                  }}
                >
                  {profile.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatarUrl}
                      alt={displayName}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div>
                  <div style={{ fontSize: "17px", fontWeight: 700 }}>{displayName}</div>
                  <div style={{ fontSize: "13px", color: "var(--text3)" }}>{profile.email}</div>
                  <div style={{ marginTop: "6px" }}>
                    <span className="pill pill-success">Verified</span>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First name</label>
                  <input
                    className="form-input"
                    value={splitName.firstName}
                    onChange={(event) => {
                      setProfileErrors((current) => clearFieldError(current, "fullName"));
                      handleNamePartChange("firstName", event.target.value);
                    }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last name</label>
                  <input
                    className="form-input"
                    value={splitName.lastName}
                    onChange={(event) => {
                      setProfileErrors((current) => clearFieldError(current, "fullName"));
                      handleNamePartChange("lastName", event.target.value);
                    }}
                  />
                </div>
              </div>
              {profileErrors.fullName ? <small className="form-error">{profileErrors.fullName}</small> : null}

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  value={profile.email}
                  disabled={true}
                  onChange={(event) => {
                    setProfileErrors((current) => clearFieldError(current, "email"));
                    setProfile((current) => ({ ...current, email: event.target.value }));
                  }}
                />
                {profileErrors.email ? <small className="form-error">{profileErrors.email}</small> : null}
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  className="form-input"
                  value={profile.phone || ""}
                  onChange={(event) => {
                    setProfileErrors((current) => clearFieldError(current, "phone"));
                    setProfile((current) => ({ ...current, phone: event.target.value }));
                  }}
                />
                {profileErrors.phone ? <small className="form-error">{profileErrors.phone}</small> : null}
              </div>

             

              <button
                className="btn-primary"
                type="button"
                onClick={() => void handleSaveProfile()}
                disabled={isSavingProfile}
              >
                {isSavingProfile ? "Saving changes..." : "Save changes"}
              </button>
            </div>

            <div className="card">
              <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "1rem" }}>
                Change password
              </h3>
              <div className="form-group">
                <label className="form-label">Current password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.currentPassword}
                  onChange={(event) => {
                    setPasswordErrors((current) => clearFieldError(current, "currentPassword"));
                    setPasswordForm((current) => ({
                      ...current,
                      currentPassword: event.target.value,
                    }));
                  }}
                />
                {passwordErrors.currentPassword ? <small className="form-error">{passwordErrors.currentPassword}</small> : null}
              </div>
              <div className="form-group">
                <label className="form-label">New password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Min 8 characters"
                  value={passwordForm.newPassword}
                  onChange={(event) => {
                    setPasswordErrors((current) => clearFieldError(current, "newPassword"));
                    setPasswordForm((current) => ({
                      ...current,
                      newPassword: event.target.value,
                    }));
                  }}
                />
                {passwordErrors.newPassword ? <small className="form-error">{passwordErrors.newPassword}</small> : null}
              </div>
              <div className="form-group">
                <label className="form-label">Confirm new password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Re-enter new password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) => {
                    setPasswordErrors((current) => clearFieldError(current, "confirmPassword"));
                    setPasswordForm((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }));
                  }}
                />
                {passwordErrors.confirmPassword ? <small className="form-error">{passwordErrors.confirmPassword}</small> : null}
              </div>
              <button
                className="btn-primary"
                type="button"
                onClick={() => void handleChangePassword()}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? "Updating password..." : "Update password"}
              </button>
            </div>
          </div>

          <div>
            <div className="card" style={{ marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "1rem" }}>
                Security settings
              </h3>
              <div style={{ fontSize: "13px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>Two-factor auth</div>
                    <div style={{ color: "var(--text3)", fontSize: "12px", marginTop: "2px" }}>
                      Extra security on login
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`toggle ${security.twoFactorAuth ? "on" : "off"}`}
                    onClick={() =>
                      setSecurity((current) => ({
                        ...current,
                        twoFactorAuth: !current.twoFactorAuth,
                      }))
                    }
                  >
                    <div className="toggle-knob" />
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>Transaction PIN</div>
                    <div style={{ color: "var(--text3)", fontSize: "12px", marginTop: "2px" }}>
                      Required for payments
                    </div>
                  </div>
                  <span className="pill pill-success">Set</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>Login notifications</div>
                    <div style={{ color: "var(--text3)", fontSize: "12px", marginTop: "2px" }}>
                      Email alert on new login
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`toggle ${security.loginAlerts ? "on" : "off"}`}
                    onClick={() =>
                      setSecurity((current) => ({
                        ...current,
                        loginAlerts: !current.loginAlerts,
                      }))
                    }
                  >
                    <div className="toggle-knob" />
                  </button>
                </div>
              </div>

              <button
                className="btn-primary"
                type="button"
                style={{ marginTop: "1rem" }}
                onClick={() => void handleSaveSecurity()}
                disabled={isSavingSecurity}
              >
                {isSavingSecurity ? "Saving security..." : "Save security settings"}
              </button>
            </div>

            <div className="card">
              <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "1rem" }}>
                Account actions
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text2)", marginBottom: "1rem" }}>
                Sign out of this session if you are using a shared device.
              </p>
              <button
                className="btn-outline"
                type="button"
                onClick={() => void handleSignOut()}
                style={{ marginTop: 0 }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
