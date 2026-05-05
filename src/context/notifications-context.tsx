"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import type { NotificationDTO } from "@/dto/notifications";
import { useAuth } from "@/context/auth-context";
import notificationsService from "@/services/notifications.service";
import { createStompClient, notificationsDestination } from "@/utils/stomp";

interface NotificationPayload {
  notification?: NotificationDTO;
}

interface NotificationPopupItem {
  id: number;
  notification: NotificationDTO;
}

interface NotificationsContextValue {
  unreadNotifications: NotificationDTO[];
  unreadCount: number;
  isPreviewLoading: boolean;
  notificationsVersion: number;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshPreview: () => Promise<void>;
  dismissPopup: (notificationId: number) => void;
}

const PREVIEW_LIMIT = 6;

const NotificationsContext = createContext<NotificationsContextValue | undefined>(
  undefined
);

function getPopupText(notification: NotificationDTO) {
  return notification.title || notification.message || "New notification";
}

function getPopupSubtext(notification: NotificationDTO) {
  if (notification.title && notification.message) {
    return notification.message;
  }

  return "Open notifications to view details.";
}

function parseNotificationPayload(body: string) {
  const payload: NotificationPayload = JSON.parse(body || "{}");
  return payload.notification ?? (payload as NotificationDTO | undefined);
}

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState<NotificationDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [popupNotifications, setPopupNotifications] = useState<NotificationPopupItem[]>([]);
  const [notificationsVersion, setNotificationsVersion] = useState(0);
  const popupTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const unreadIdsRef = useRef<Set<number>>(new Set());

  const userId = useMemo(() => {
    if (!user?.id) {
      return null;
    }

    if (typeof user.id === "number") {
      return user.id;
    }

    const parsed = Number(user.id);
    return Number.isFinite(parsed) ? parsed : null;
  }, [user?.id]);

  const bumpVersion = useCallback(() => {
    setNotificationsVersion((current) => current + 1);
  }, []);

  const dismissPopup = useCallback((notificationId: number) => {
    setPopupNotifications((current) =>
      current.filter((item) => item.notification.id !== notificationId)
    );

    const timer = popupTimersRef.current[notificationId];
    if (timer) {
      clearTimeout(timer);
      delete popupTimersRef.current[notificationId];
    }
  }, []);

  const schedulePopupDismiss = useCallback(
    (notificationId: number) => {
      const existingTimer = popupTimersRef.current[notificationId];
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      popupTimersRef.current[notificationId] = setTimeout(() => {
        dismissPopup(notificationId);
      }, 5000);
    },
    [dismissPopup]
  );

  const refreshPreview = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadNotifications([]);
      setUnreadCount(0);
      return;
    }

    setIsPreviewLoading(true);

    try {
      const [count, list] = await Promise.all([
        notificationsService.unreadCount(),
        notificationsService.list({ unreadOnly: true, limit: PREVIEW_LIMIT, offset: 0 }),
      ]);

      setUnreadCount(count || 0);
      setUnreadNotifications(list || []);
      unreadIdsRef.current = new Set((list || []).map((item) => item.id));
    } catch {
      setUnreadCount(0);
      setUnreadNotifications([]);
      unreadIdsRef.current = new Set();
    } finally {
      setIsPreviewLoading(false);
    }
  }, [isAuthenticated]);

  const markAsRead = useCallback(
    async (notificationId: number) => {
      await notificationsService.markRead(notificationId);

      setUnreadNotifications((current) =>
        current.filter((item) => item.id !== notificationId)
      );
      unreadIdsRef.current.delete(notificationId);
      setUnreadCount((current) => Math.max(0, current - 1));
      dismissPopup(notificationId);
      bumpVersion();
    },
    [bumpVersion, dismissPopup]
  );

  const markAllAsRead = useCallback(async () => {
    await notificationsService.markAllRead();
    setUnreadNotifications([]);
    setUnreadCount(0);
    unreadIdsRef.current = new Set();
    setPopupNotifications([]);

    Object.values(popupTimersRef.current).forEach((timer) => clearTimeout(timer));
    popupTimersRef.current = {};

    bumpVersion();
  }, [bumpVersion]);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      void refreshPreview();
    }
  }, [isAuthenticated, isAuthLoading, refreshPreview]);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      setUnreadNotifications([]);
      setUnreadCount(0);
      unreadIdsRef.current = new Set();
      setPopupNotifications([]);
      Object.values(popupTimersRef.current).forEach((timer) => clearTimeout(timer));
      popupTimersRef.current = {};
    }
  }, [isAuthenticated, isAuthLoading]);

  useEffect(() => {
    if (!userId || !isAuthenticated) {
      return;
    }

    let isMounted = true;
    let client: Client | null = null;
    let subscription: StompSubscription | null = null;

    const handleIncomingNotification = (notification: NotificationDTO) => {
      if (!isMounted || !notification?.id) {
        return;
      }

      if (notification.userId && notification.userId !== userId) {
        return;
      }

      setUnreadNotifications((current) => {
        const withoutDuplicate = current.filter((item) => item.id !== notification.id);
        return [notification, ...withoutDuplicate].slice(0, PREVIEW_LIMIT);
      });
      const alreadyUnread = unreadIdsRef.current.has(notification.id);
      unreadIdsRef.current.add(notification.id);

      setUnreadCount((current) => {
        return alreadyUnread ? current : current + 1;
      });

      setPopupNotifications((current) => {
        const withoutDuplicate = current.filter(
          (item) => item.notification.id !== notification.id
        );

        return [{ id: notification.id, notification }, ...withoutDuplicate].slice(0, 3);
      });

      schedulePopupDismiss(notification.id);
      bumpVersion();
    };

    const handleMessage = (message: IMessage) => {
      try {
        const notification = parseNotificationPayload(message.body);

        if (!notification?.id) {
          return;
        }

        handleIncomingNotification(notification);
      } catch {
        // Ignore malformed notification payloads.
      }
    };

    try {
      client = createStompClient();
      client.onConnect = () => {
        if (!isMounted || !client) {
          return;
        }

        subscription = client.subscribe(notificationsDestination, handleMessage);
      };
      client.activate();
    } catch {
      // Websocket is optional for the rest of the app to remain usable.
    }

    return () => {
      isMounted = false;

      if (subscription) {
        subscription.unsubscribe();
      }

      if (client) {
        void client.deactivate();
      }
    };
  }, [
    bumpVersion,
    isAuthenticated,
    schedulePopupDismiss,
    userId,
  ]);

  useEffect(() => {
    return () => {
      Object.values(popupTimersRef.current).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      unreadNotifications,
      unreadCount,
      isPreviewLoading,
      notificationsVersion,
      markAsRead,
      markAllAsRead,
      refreshPreview,
      dismissPopup,
    }),
    [
      dismissPopup,
      isPreviewLoading,
      markAllAsRead,
      markAsRead,
      notificationsVersion,
      refreshPreview,
      unreadCount,
      unreadNotifications,
    ]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      {popupNotifications.length ? (
        <div className="notif-popup-stack" aria-live="polite" aria-atomic="true">
          {popupNotifications.map(({ notification }) => (
            <div key={notification.id} className="notif-popup-card" role="status">
              <div className="notif-popup-copy">
                <div className="notif-popup-title">{getPopupText(notification)}</div>
                <div className="notif-popup-desc">{getPopupSubtext(notification)}</div>
              </div>
              <button
                type="button"
                className="notif-popup-dismiss"
                onClick={() => dismissPopup(notification.id)}
                aria-label="Dismiss notification popup"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error("useNotifications must be used inside NotificationsProvider");
  }

  return context;
}
