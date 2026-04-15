"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true);
    
    // Get saved theme preference
    const savedTheme = localStorage.getItem("app-theme") as Theme | null;
    if (savedTheme) {
      setThemeState(savedTheme);
    }

    // Check if user is logged in
    const token = localStorage.getItem("auth-token");
    setIsLoggedIn(!!token);
  }, []);

  // Update resolved theme and apply to document
  useEffect(() => {
    if (!mounted) return;

    let resolved: ResolvedTheme;

    if (theme === "system") {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      resolved = prefersDark ? "dark" : "light";
    } else {
      resolved = theme;
    }

    setResolvedTheme(resolved);

    // Apply theme to document
    const htmlElement = document.documentElement;
    htmlElement.setAttribute("data-theme", resolved);
    
    if (resolved === "dark") {
      htmlElement.classList.add("dark");
      htmlElement.style.colorScheme = "dark";
    } else {
      htmlElement.classList.remove("dark");
      htmlElement.style.colorScheme = "light";
    }
  }, [theme, mounted]);

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted || theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setResolvedTheme(e.matches ? "dark" : "light");
      const htmlElement = document.documentElement;
      htmlElement.setAttribute("data-theme", e.matches ? "dark" : "light");
      if (e.matches) {
        htmlElement.classList.add("dark");
      } else {
        htmlElement.classList.remove("dark");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    // Only allow theme change if logged in
    if (!isLoggedIn) return;
    
    setThemeState(newTheme);
    localStorage.setItem("app-theme", newTheme);
  };

  const handleSetIsLoggedIn = (loggedIn: boolean) => {
    setIsLoggedIn(loggedIn);
    if (loggedIn) {
      // Load user's saved theme preference when logging in
      const savedTheme = localStorage.getItem("app-theme") as Theme | null;
      if (savedTheme) {
        setThemeState(savedTheme);
      }
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        isLoggedIn,
        setIsLoggedIn: handleSetIsLoggedIn,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
