"use client";

import { useTheme } from "@/context/theme-context";
import React from "react";

export default function ThemeSwitcher() {
  const { theme, resolvedTheme, setTheme, isLoggedIn } = useTheme();

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="theme-switcher">
      <label htmlFor="theme-select" className="theme-switcher-label">
        Theme:
      </label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")}
        className="theme-select"
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
      <span className="theme-current">({resolvedTheme})</span>
    </div>
  );
}
