import { useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import IdleSessionGuard from "./IdleSessionGuard";
import { Outlet } from "react-router-dom";
import { useAppShell } from "../contexts/AppShellContext";
import { VaultSearchProvider } from "../contexts/VaultSearchContext";

export default function Layout() {
  const { sidebarOpen, closeSidebar } = useAppShell();

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeSidebar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen, closeSidebar]);

  return (
    <div
      className={`app-layout app-layout--drawer${sidebarOpen ? " app-layout--sidebar-open" : ""}`}
    >
      <Sidebar />
      <div className="main-wrapper">
        <VaultSearchProvider>
          <Header isAdmin={false} />
          <main className="main-content">
            <Outlet />
          </main>
        </VaultSearchProvider>
      </div>
      <IdleSessionGuard />
    </div>
  );
}