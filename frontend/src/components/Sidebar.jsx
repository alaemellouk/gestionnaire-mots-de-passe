import { NavLink } from "react-router-dom";
import { useSettings } from "../contexts/SettingsContext";
import { useAppShell } from "../contexts/AppShellContext";
import SidebarUserProfile from "./SidebarUserProfile";
import PassGuardLogo from "./PassGuardLogo";

export default function Sidebar() {
  const { t } = useSettings();
  const { sidebarOpen } = useAppShell();

  const linkClass = ({ isActive }) => (isActive ? "active" : "");

  return (
    <aside className={`sidebar sidebar--with-profile${sidebarOpen ? " sidebar--open" : ""}`}>
      <PassGuardLogo as="h1" variant="sidebar" className="sidebar-title-wrap" />
      <p className="sidebar-subtitle">{t("sidebar.subtitle")}</p>

      <nav id="app-sidebar-nav" className="sidebar-nav">
        <NavLink to="/categories" className={linkClass}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
          </svg>
          {t("sidebar.categories")}
        </NavLink>
        <NavLink to="/passwords" className={linkClass}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
          </svg>
          {t("sidebar.passwords")}
        </NavLink>
        <NavLink to="/dashboard" className={linkClass}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
          </svg>
          {t("sidebar.dashboard")}
        </NavLink>

        <div className="sidebar-nav-spacer" aria-hidden />

        {localStorage.getItem("isAdmin") === "true" && (
          <div className="user-sidebar-admin-slot">
            <NavLink to="/admin/dashboard" className="user-sidebar-admin-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
              </svg>
              <span className="user-sidebar-admin-link__text">{t("sidebar.adminPanel")}</span>
            </NavLink>
          </div>
        )}
      </nav>

      <SidebarUserProfile settingsPath="/settings" />
    </aside>
  );
}
