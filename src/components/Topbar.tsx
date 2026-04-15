"use client";

import { useAuth } from "@/context/auth-context";
import React, { useState } from "react";
import ThemeSwitcher from "./ThemeSwitcher";

interface TopbarProps {
  pageTitle: string;
}

export default function Topbar({ pageTitle }: TopbarProps) {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      icon: "💸",
      name: "Wallet funded",
      sub: "₦50,000 credited · Just now",
      type: "success",
    },
    {
      icon: "⚡",
      name: "Electricity reminder",
      sub: "Your token balance is low",
      type: "alert",
    },
    { icon: "🔒", name: "New login detected", sub: "Lagos, NG · 2 hours ago", type: "info" },
  ];

  const userName = user?.name || user?.fullName || user?.full_name || "User";
  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <div className="greeting">
            {new Date().getHours() < 12 ? "Good morning" : "Good afternoon"},
          </div>
          <div className="page-title">{pageTitle} 👋</div>
        </div>

        <div className="topbar-right">
          {/* Notifications */}
          <div
            className="icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ position: "relative" }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <div className="notif-dot"></div>

            {showNotifications && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  minWidth: "280px",
                  maxHeight: "400px",
                  overflowY: "auto",
                  boxShadow: "var(--shadow-lg)",
                  zIndex: 50,
                  marginTop: "8px",
                }}
              >
                <div style={{ padding: "12px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "14px", fontWeight: "600" }}>Notifications</div>
                </div>
                {notifications.map((notif, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px",
                      borderBottom: idx < notifications.length - 1 ? "1px solid var(--border)" : "none",
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--surface2)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    <div style={{ fontSize: "18px" }}>{notif.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: "500" }}>{notif.name}</div>
                      <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "2px" }}>
                        {notif.sub}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Theme Switcher */}
          <ThemeSwitcher />

          {/* User Avatar */}
          <div
            className="user-avatar"
            title={userName}
            style={{ cursor: "pointer" }}
          >
            {initials}
          </div>
        </div>
      </div>
    </>
  );
}
