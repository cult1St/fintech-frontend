"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        Pay<span>Vault</span>
      </div>

      <div className="sidebar-nav">
        {/* Main Section */}
        <div className="nav-section-lbl">Main</div>

        <Link
          href="/user/dashboard"
          className={`nav-item ${isActive("/user/dashboard") ? "active" : ""}`}
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          Dashboard
        </Link>

        <Link
          href="/user/wallet"
          className={`nav-item ${isActive("/user/wallet") ? "active" : ""}`}
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2" />
            <path d="M16 12h5v4h-5a2 2 0 0 1 0-4z" />
          </svg>
          Wallet
        </Link>

        <Link
          href="/user/transactions"
          className={`nav-item ${isActive("/user/transactions") ? "active" : ""}`}
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2" />
          </svg>
          Transactions
        </Link>

        {/* Services Section */}
        <div className="nav-section-lbl">Services</div>

        <Link
          href="/user/fund"
          className={`nav-item ${isActive("/user/fund") ? "active" : ""}`}
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Fund Wallet
        </Link>

        <Link
          href="/user/airtime"
          className={`nav-item ${isActive("/user/airtime") ? "active" : ""}`}
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.72 19a19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          Airtime
        </Link>

        <Link
          href="/user/data"
          className={`nav-item ${isActive("/user/data") ? "active" : ""}`}
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          Data
        </Link>

        <Link
          href="/user/bills"
          className={`nav-item ${isActive("/user/bills") ? "active" : ""}`}
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          Bill Payment
        </Link>

        {/* Account Section */}
        <div className="nav-section-lbl">Account</div>

        <Link
          href="/user/settings"
          className={`nav-item ${isActive("/user/settings") ? "active" : ""}`}
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
          Profile & Settings
        </Link>

        <Link
          href="/user/notifications"
          className={`nav-item ${isActive("/user/notifications") ? "active" : ""}`}
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          Notifications
        </Link>
      </div>

      <div className="sidebar-footer">
        <button
          onClick={handleLogout}
          className="nav-item"
          style={{ color: "var(--red)", width: "100%", textAlign: "left" }}
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}
