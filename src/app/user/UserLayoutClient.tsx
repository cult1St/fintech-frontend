"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useAuth } from "@/context/auth-context";

export default function UserLayoutClient({
  children,
  pageTitle = "Dashboard",
}: {
  children: React.ReactNode;
  pageTitle?: string;
}) {
  const router = useRouter();
  const { isLoading, isAuthenticated, refreshUser } = useAuth();

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
        <Topbar pageTitle={pageTitle} />
        <div className="content-area">{children}</div>
      </div>
    </div>
  );
}
