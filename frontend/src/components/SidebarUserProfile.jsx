import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MoreVertical, Settings, Globe, LogOut, Check } from "lucide-react";
import api from "../api/axios";
import { useSettings } from "../contexts/SettingsContext";
import {
  readStoredUserProfile,
  getProfileInitialLetter,
  isAdminProfile,
  clearUserSession,
} from "../utils/userSession";

const iconSm = { size: 18, strokeWidth: 2, "aria-hidden": true };

export default function SidebarUserProfile({ settingsPath }) {
  const navigate = useNavigate();
  const { t, language, changeLanguage } = useSettings();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const rootRef = useRef(null);

  const profile = readStoredUserProfile();

  useEffect(() => {
    function handlePointerDown(e) {
      if (!open) return;
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const emailRaw = profile.email?.trim() || "";
  const emailDisplay = emailRaw || t("sidebar.profileEmailPlaceholder");
  const adminUser = isAdminProfile(profile);
  const roleLabel = adminUser ? t("sidebar.profileRoleAdmin") : t("sidebar.profileRoleUser");
  const hasIdentity = Boolean(profile.name?.trim() || emailRaw);
  const initial = hasIdentity
    ? getProfileInitialLetter(profile)
    : adminUser
      ? "A"
      : "U";

  const handleLogout = async () => {
    setOpen(false);
    setLangOpen(false);
    try {
      await api.post("/logout");
    } catch {
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("isAdmin");
      clearUserSession();
      navigate("/login", { replace: true });
    }
  };

  const toggleMenu = () => {
    setOpen((v) => !v);
    if (open) setLangOpen(false);
  };

  return (
    <div className="sidebar-user-profile" ref={rootRef}>
      <button
        type="button"
        className="sidebar-user-profile__trigger"
        onClick={toggleMenu}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={t("sidebar.profileOpenMenu")}
      >
        <span className="sidebar-user-profile__avatar" aria-hidden>
          {initial}
        </span>
        <span className="sidebar-user-profile__text">
          <span
            className={`sidebar-user-profile__email${emailRaw ? "" : " sidebar-user-profile__email--placeholder"}`}
            title={emailRaw || undefined}
          >
            {emailDisplay}
          </span>
          <span className="sidebar-user-profile__role">{roleLabel}</span>
        </span>
        <span className="sidebar-user-profile__dots" aria-hidden>
          <MoreVertical size={18} strokeWidth={2} />
        </span>
      </button>

      {open && (
        <div className="sidebar-user-profile__dropdown" role="menu">
          <Link
            to={settingsPath}
            role="menuitem"
            className="sidebar-user-profile__item"
            onClick={() => {
              setOpen(false);
              setLangOpen(false);
            }}
          >
            <Settings {...iconSm} />
            <span>{t("sidebar.profileMenuSettings")}</span>
          </Link>

          <div className="sidebar-user-profile__item-wrap">
            <button
              type="button"
              role="menuitem"
              className="sidebar-user-profile__item sidebar-user-profile__item--button"
              aria-expanded={langOpen}
              onClick={() => setLangOpen((v) => !v)}
            >
              <Globe {...iconSm} />
              <span>{t("sidebar.profileMenuLanguage")}</span>
              <span className="sidebar-user-profile__chevron" data-open={langOpen} aria-hidden>
                ›
              </span>
            </button>
            {langOpen && (
              <div className="sidebar-user-profile__sub" role="group">
                <button
                  type="button"
                  className="sidebar-user-profile__sub-item"
                  onClick={() => {
                    changeLanguage("fr");
                    setLangOpen(false);
                  }}
                >
                  <span>{t("settings.french")}</span>
                  {language === "fr" && <Check size={16} strokeWidth={2} aria-hidden />}
                </button>
                <button
                  type="button"
                  className="sidebar-user-profile__sub-item"
                  onClick={() => {
                    changeLanguage("en");
                    setLangOpen(false);
                  }}
                >
                  <span>{t("settings.english")}</span>
                  {language === "en" && <Check size={16} strokeWidth={2} aria-hidden />}
                </button>
              </div>
            )}
          </div>

          <button type="button" role="menuitem" className="sidebar-user-profile__item" onClick={handleLogout}>
            <LogOut {...iconSm} />
            <span>{t("sidebar.profileMenuLogout")}</span>
          </button>
        </div>
      )}
    </div>
  );
}
