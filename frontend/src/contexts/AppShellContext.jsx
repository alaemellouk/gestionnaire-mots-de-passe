import { createContext, useCallback, useContext, useMemo, useState } from "react";

const AppShellContext = createContext(null);

const SIDEBAR_STORAGE_KEY = "sidebar_open";

function readStoredSidebarOpen() {
  try {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored === "false") return false;
    if (stored === "true") return true;
  } catch {
  }
  return true;
}

function writeStoredSidebarOpen(open) {
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, open ? "true" : "false");
  } catch {
  }
}

export function AppShellProvider({ children }) {
  const [sidebarOpen, setSidebarOpenState] = useState(readStoredSidebarOpen);

  const setSidebarOpen = useCallback((value) => {
    setSidebarOpenState((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      writeStoredSidebarOpen(next);
      return next;
    });
  }, []);

  const openSidebar = useCallback(() => setSidebarOpen(true), [setSidebarOpen]);
  const closeSidebar = useCallback(() => setSidebarOpen(false), [setSidebarOpen]);
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), [setSidebarOpen]);

  const value = useMemo(
    () => ({
      sidebarOpen,
      setSidebarOpen,
      openSidebar,
      closeSidebar,
      toggleSidebar,
    }),
    [sidebarOpen, setSidebarOpen, openSidebar, closeSidebar, toggleSidebar],
  );

  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>;
}

export function useAppShell() {
  const ctx = useContext(AppShellContext);
  if (!ctx) {
    throw new Error("useAppShell must be used within AppShellProvider");
  }
  return ctx;
}
