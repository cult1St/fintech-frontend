"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useAuth } from "@/context/auth-context";

const PAGE_TITLES: Record<string, string> = {
  "/user/dashboard": "Dashboard",
  "/user/wallet": "Wallet",
  "/user/transactions": "Transactions",
  "/user/fund": "Fund Wallet",
  "/user/airtime": "Airtime",
  "/user/data": "Data",
  "/user/bills": "Bill Payment",
  "/user/settings": "Profile",
  "/user/notifications": "Notifications",
};

export default function UserLayoutClient({
  children,
  pageTitle = "Dashboard",
}: {
  children: React.ReactNode;
  pageTitle?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoading, isAuthenticated, refreshUser } = useAuth();
  const resolvedPageTitle = PAGE_TITLES[pathname] || pageTitle;

  useEffect(() => {
    if (isLoading || isAuthenticated) {
      return;
    }

    const hasToken =
      typeof window !== "undefined" && Boolean(sessionStorage.getItem("authToken"));

    if (hasToken) {
      void refreshUser();
      return;
    }

    router.replace("/login");
  }, [isAuthenticated, isLoading, refreshUser, router]);

  if (isLoading) {
    return (
      <div className="user-auth-loading">
        <div className="hero-badge">
          <div className="hero-badge-dot" />
          Loading your workspace...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="user-layout">
      <Sidebar />
      <div className="main-area">
        <Topbar pageTitle={resolvedPageTitle} />
        <div className="content-area">{children}</div>
      </div>
    </div>
  );
}
