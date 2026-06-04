import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Globe, Sun, Moon, Check, ChevronDown, PanelLeft, Search } from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";
import { useAppShell } from "../contexts/AppShellContext";
import { useVaultSearchOptional } from "../contexts/VaultSearchContext";
import { useAdminUsersSearchOptional } from "../contexts/AdminUsersSearchContext";
import HeaderUserProfile from "./HeaderUserProfile";

export default function Header({ isAdmin = false }) {
  const { language, changeLanguage, theme, toggleTheme, t } = useSettings();
  const { sidebarOpen, toggleSidebar } = useAppShell();
  const vaultSearchCtx = useVaultSearchOptional();
  const adminSearchCtx = useAdminUsersSearchOptional();
  const vaultSearch = vaultSearchCtx?.query ?? "";
  const setVaultSearch = vaultSearchCtx?.setQuery ?? (() => {});
  const adminUsersSearch = adminSearchCtx?.query ?? "";
  const setAdminUsersSearch = adminSearchCtx?.setQuery ?? (() => {});
  const location = useLocation();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);
  const isAdminUsersPage = isAdmin && location.pathname === "/admin/users";

  useEffect(() => {
    function handleClickOutside(e) {
      const target = e.target;
      if (langRef.current && !langRef.current.contains(target)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!langOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setLangOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [langOpen]);

  const renderLangAndProfile = (settingsPath, siblingOpen) => (
    <div className="app-header__actions">
      <div className="app-header-lang" ref={langRef}>
        <button
          type="button"
          className="app-header-lang__btn"
          onClick={() => setLangOpen((o) => !o)}
          aria-expanded={langOpen}
          aria-haspopup="listbox"
          aria-label={t("header.language")}
        >
          <Globe size={18} strokeWidth={2} aria-hidden />
          <span>{language === "fr" ? "FR" : "EN"}</span>
          <ChevronDown size={16} strokeWidth={2} aria-hidden className="app-header-lang__chev" />
        </button>

        {langOpen && (
          <div className="app-header-lang__panel" role="listbox" aria-label={t("header.language")}>
            {[
              { code: "fr", label: t("settings.french") },
              { code: "en", label: t("settings.english") },
            ].map(({ code, label }) => (
              <button
                key={code}
                type="button"
                role="option"
                aria-selected={language === code}
                data-active={language === code}
                className="app-header-lang__option"
                onClick={() => {
                  changeLanguage(code);
                  setLangOpen(false);
                }}
              >
                <span>{label}</span>
                {language === code && <Check size={18} strokeWidth={2} aria-hidden />}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        className="app-header-icon-btn"
        onClick={toggleTheme}
        title={theme === "dark" ? t("header.themeToLight") : t("header.themeToDark")}
        aria-label={theme === "dark" ? t("header.themeToLight") : t("header.themeToDark")}
      >
        {theme === "dark" ? (
          <Sun size={20} strokeWidth={2} aria-hidden />
        ) : (
          <Moon size={20} strokeWidth={2} aria-hidden />
        )}
      </button>

      <HeaderUserProfile
        settingsPath={settingsPath}
        siblingMenuOpen={langOpen || siblingOpen}
        onMenuOpenChange={(open) => {
          if (open) setLangOpen(false);
        }}
      />
    </div>
  );

  if (isAdmin) {
    return (
      <header className="app-header app-header--admin">
        <div className="app-header__center app-header__center--admin">
          {isAdminUsersPage ? (
            <div className="app-header-admin-users-search-wrap">
              <Search size={18} strokeWidth={2} aria-hidden className="app-header-admin-users-search__icon" />
              <input
                type="search"
                id="admin-users-navbar-search"
                className="app-header-admin-users-search"
                value={adminUsersSearch}
                onChange={(e) => setAdminUsersSearch(e.target.value)}
                placeholder={t("admin.users.searchNavbar")}
                aria-label={t("admin.users.searchLabel")}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          ) : null}
        </div>

        <div className="app-header__right">{renderLangAndProfile("/admin/settings", false)}</div>
      </header>
    );
  }

  return (
    <header className="app-header app-header--vault">
      <div className="app-header__left">
        <button
          type="button"
          className={`app-header-icon-btn${sidebarOpen ? " is-active" : ""}`}
          onClick={() => {
            setLangOpen(false);
            toggleSidebar();
          }}
          aria-expanded={sidebarOpen}
          aria-controls="app-sidebar-nav"
          aria-label={sidebarOpen ? t("header.closeMenu") : t("header.openMenu")}
        >
          <PanelLeft size={21} strokeWidth={2} aria-hidden />
        </button>
      </div>

      <div className="app-header__center app-header__center--vault-full">
        <div className="app-header-vault-search-wrap app-header-vault-search-wrap--full">
          <Search size={18} strokeWidth={2} aria-hidden className="app-header-vault-search__icon" />
          <input
            type="search"
            className="app-header-vault-search"
            value={vaultSearch}
            onChange={(e) => setVaultSearch(e.target.value)}
            placeholder={t("header.vaultSearchPlaceholder")}
            aria-label={t("header.vaultSearchAria")}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="app-header__right">{renderLangAndProfile("/settings", false)}</div>
    </header>
  );
}
