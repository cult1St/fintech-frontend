"use client";

import { useCallback, useEffect, useState } from "react";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";
import { useNotifications } from "@/context/notifications-context";
import notificationsService from "@/services/notifications.service";
import type { NotificationDTO } from "@/dto/notifications";

import { formatDateTime } from "@/utils/dateUtil";

function formatDate(value: string) {
  return formatDateTime(value);
}

export default function NotificationsPage() {
  const { toasts, showToast, removeToast } = useToast();
  const { markAsRead, markAllAsRead, notificationsVersion } = useNotifications();
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadNotifications = useCallback(
    async (unreadOnly: boolean, nextOffset = 0) => {
      setIsLoading(true);
      try {
        const data = await notificationsService.list({
          unreadOnly,
          limit: 50,
          offset: nextOffset,
        });
        const items = data || [];
        setHasMore(items.length === 50);

        setNotifications((prev) =>
          nextOffset === 0 ? items : [...prev, ...items]
        );
        setOffset(nextOffset);
      } catch (err) {
        const message =
          (err as { message?: string })?.message || "Failed to load notifications.";
        showToast(message, "error");
      } finally {
        setIsLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    void loadNotifications(showUnreadOnly);
  }, [loadNotifications, notificationsVersion, showUnreadOnly]);

  const handleMarkRead = async (notificationId: number) => {
    try {
      await markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId ? { ...item, read: true } : item
        )
      );
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Could not update notification.";
      showToast(message, "error");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
      showToast("All notifications marked as read.", "success");
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        "Could not mark notifications as read.";
      showToast(message, "error");
    }
  };

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <div className="notifications-page">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <div className="notifications-page-header">
        <div>
          <h1 className="notifications-page-title">Notifications</h1>
          <p className="notifications-page-subtitle">
            Stay updated on wallet activity, payments, and account alerts.
          </p>
        </div>

        <div className="notifications-page-summary">
          <span className="notifications-summary-label">Unread</span>
          <span className="notifications-summary-value">{unreadCount}</span>
        </div>
      </div>

      <div className="notifications-toolbar">
        <div className="notifications-filter-tabs">
          <button
            type="button"
            className={`notifications-filter-tab ${showUnreadOnly ? "active" : ""}`}
            onClick={() => setShowUnreadOnly(true)}
          >
            Unread
          </button>
          <button
            type="button"
            className={`notifications-filter-tab ${!showUnreadOnly ? "active" : ""}`}
            onClick={() => setShowUnreadOnly(false)}
          >
            All
          </button>
        </div>

        <button
          type="button"
          className="notifications-toolbar-button"
          onClick={() => void handleMarkAllRead()}
          disabled={!unreadCount}
        >
          Mark all read
        </button>
      </div>

      <div className="card notifications-card">
        <div className="notifications-card-header">
          <span className="notifications-card-title">
            {showUnreadOnly ? `Unread (${unreadCount})` : "Notification History"}
          </span>
        </div>
        <div className="notifications-card-body">
          {isLoading ? (
            <div className="notifications-empty-state">
              <div className="notifications-empty-desc">Loading notifications...</div>
            </div>
          ) : notifications.length ? (
            <div className="notifications-list">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={`notifications-item ${item.read ? "" : "unread"}`.trim()}
                >
                  <div className="notifications-item-copy">
                    <div className="notifications-item-topline">
                      <div className="notifications-item-title">
                        {item.title || "Notification"}
                      </div>
                      <div className="notifications-item-date">
                        {formatDate(item.createdAt)}
                      </div>
                    </div>
                    <div className="notifications-item-message">{item.message}</div>
                  </div>
                  {!item.read ? (
                    <button
                      type="button"
                      className="notifications-item-button"
                      onClick={() => void handleMarkRead(item.id)}
                    >
                      Mark read
                    </button>
                  ) : null}
                </div>
              ))}
              <div className="notifications-footer">
                {hasMore ? (
                  <button
                    type="button"
                    className="notifications-toolbar-button"
                    onClick={() => void loadNotifications(showUnreadOnly, offset + 50)}
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Load more"}
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="notifications-empty-state">
              <div className="notifications-empty-title">No notifications</div>
              <div className="notifications-empty-desc">You&apos;re all caught up.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
