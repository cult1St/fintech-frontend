"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { NotificationDTO } from "@/dto/notifications";
import { useNotifications } from "@/context/notifications-context";

function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  const diffMs = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return "Just now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
  return `${Math.floor(diffMs / day)}d ago`;
}

function getNotificationTitle(notification: NotificationDTO) {
  return notification.title || "Notification";
}

export default function Notifications() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const {
    unreadNotifications,
    unreadCount,
    isPreviewLoading,
    markAsRead,
    markAllAsRead,
    refreshPreview,
  } = useNotifications();

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!rootRef.current) {
        return;
      }

      const target = event.target as Node;
      if (!rootRef.current.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    void refreshPreview();
  }, [open, refreshPreview]);

  const hasUnread = useMemo(() => unreadCount > 0, [unreadCount]);

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <button
        className="notif-btn"
        onClick={() => setOpen((current) => !current)}
        aria-label="Notifications"
        type="button"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {hasUnread ? <span className="notif-dot" /> : null}
        {hasUnread ? (
          <span className="notif-count" aria-live="polite">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="notif-dropdown open">
          <div className="notif-header">
            <span className="notif-title">Recent unread</span>
            <button
              className="notif-mark"
              onClick={() => void markAllAsRead()}
              type="button"
            >
              Mark all read
            </button>
          </div>

          {isPreviewLoading ? (
            <div className="notif-item">
              <div className="notif-text">
                <div className="notif-msg">Loading notifications...</div>
              </div>
            </div>
          ) : unreadNotifications.length ? (
            unreadNotifications.map((notification) => (
              <button
                key={notification.id}
                className="notif-item unread"
                onClick={() => void markAsRead(notification.id)}
                type="button"
              >
                <div className="notif-text">
                  <div className="notif-msg">{getNotificationTitle(notification)}</div>
                  <div className="notif-submsg">{notification.message}</div>
                  <div className="notif-time">{formatRelativeTime(notification.createdAt)}</div>
                </div>
              </button>
            ))
          ) : (
            <div className="notif-item">
              <div className="notif-text">
                <div className="notif-msg">No unread notifications</div>
                <div className="notif-time">You&apos;re all caught up.</div>
              </div>
            </div>
          )}

          <div className="notif-footer">
            <Link
              href="/user/notifications"
              onClick={() => setOpen(false)}
              className="notif-mark"
            >
              View all notifications
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
