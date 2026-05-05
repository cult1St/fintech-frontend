"use client";

import { useAuth } from "@/context/auth-context";
import ThemeSwitcher from "./ThemeSwitcher";
import Notifications from "@/app/user/components/Notifications";

interface TopbarProps {
  pageTitle: string;
}

export default function Topbar({ pageTitle }: TopbarProps) {
  const { user } = useAuth();

  const userName = user?.name || user?.fullName || user?.full_name || "User";
  const initials = userName
    .split(" ")
    .map((namePart: string) => namePart[0])
    .join("")
    .toUpperCase();

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="greeting">
          {new Date().getHours() < 12 ? "Good morning" : "Good afternoon"},
        </div>
        <div className="page-title">{pageTitle}</div>
      </div>

      <div className="topbar-right">
        <Notifications />
        <ThemeSwitcher />
        <div className="user-avatar" title={userName} style={{ cursor: "pointer" }}>
          {initials}
        </div>
      </div>
    </div>
  );
}
