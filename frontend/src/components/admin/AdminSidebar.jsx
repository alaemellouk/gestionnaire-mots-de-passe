import { NavLink } from "react-router-dom";
import { Users, Settings, Lock } from "lucide-react";
import { useSettings } from "../../contexts/SettingsContext";
import SidebarUserProfile from "../SidebarUserProfile";
import PassGuardLogo from "../PassGuardLogo";

const iconProps = { size: 18, strokeWidth: 2, "aria-hidden": true };

export default function AdminSidebar() {
  const { t } = useSettings();

  return (
    <aside className="sidebar sidebar--with-profile admin-sidebar-root">
      <div className="admin-sidebar-root__top">
        <PassGuardLogo as="h1" variant="sidebar" className="sidebar-title-wrap" />

        <nav className="sidebar-nav admin-sidebar-root__nav">
          <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
            </svg>
            {t("admin.sidebar.dashboard")}
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => (isActive ? "active" : "")}>
            <Users {...iconProps} />
            {t("admin.sidebar.users")}
          </NavLink>
          <NavLink to="/admin/security" className={({ isActive }) => (isActive ? "active" : "")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
            </svg>
            {t("admin.sidebar.security")}
          </NavLink>
          <NavLink to="/admin/logs" className={({ isActive }) => (isActive ? "active" : "")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
            </svg>
            {t("admin.sidebar.logs")}
          </NavLink>
          <NavLink to="/admin/settings" className={({ isActive }) => (isActive ? "active" : "")}>
            <Settings {...iconProps} />
            {t("admin.sidebar.settings")}
          </NavLink>
        </nav>
      </div>

      <div className="admin-sidebar-root__bottom">
        <NavLink to="/passwords" className="admin-sidebar-vault-link">
          <Lock size={18} strokeWidth={2} aria-hidden />
          <span className="admin-sidebar-vault-link__text">{t("admin.sidebar.myVault")}</span>
        </NavLink>
        <SidebarUserProfile settingsPath="/admin/settings" />
      </div>
    </aside>
  );
}
