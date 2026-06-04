import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Settings, LogOut } from "lucide-react";
import api from "../api/axios";
import { useSettings } from "../contexts/SettingsContext";
import {
  readStoredUserProfile,
  getProfileInitialLetter,
  isAdminProfile,
  clearUserSession,
} from "../utils/userSession";

const iconSm = { size: 18, strokeWidth: 2, "aria-hidden": true };

export default function HeaderUserProfile({ settingsPath, onMenuOpenChange, siblingMenuOpen = false }) {
  const navigate = useNavigate();
  const { t } = useSettings();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const prevSiblingOpen = useRef(false);

  const profile = readStoredUserProfile();

  useEffect(() => {
    function handlePointerDown(e) {
      if (!open) return;
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    onMenuOpenChange?.(open);
  }, [open, onMenuOpenChange]);

  useEffect(() => {
    if (siblingMenuOpen && !prevSiblingOpen.current) {
      setOpen(false);
    }
    prevSiblingOpen.current = siblingMenuOpen;
  }, [siblingMenuOpen]);

  const emailRaw = profile.email?.trim() || "";
  const adminUser = isAdminProfile(profile);
  const hasIdentity = Boolean(profile.name?.trim() || emailRaw);
  const initial = hasIdentity
    ? getProfileInitialLetter(profile)
    : adminUser
      ? "A"
      : "U";

  const handleLogout = async () => {
    setOpen(false);
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
  };

  return (
    <div className="header-user-profile" ref={rootRef}>
      <button
        type="button"
        className="header-user-profile__trigger"
        onClick={toggleMenu}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={t("sidebar.profileOpenMenu")}
        title={emailRaw || t("sidebar.profileOpenMenu")}
      >
        <span className="header-user-profile__avatar" aria-hidden>
          {initial}
        </span>
      </button>

      {open && (
        <div className="header-user-profile__dropdown" role="menu">
          <div className="header-user-profile__meta">
            <span className="header-user-profile__meta-email" title={emailRaw || undefined}>
              {emailRaw || t("sidebar.profileEmailPlaceholder")}
            </span>
            <span className="header-user-profile__meta-role">
              {adminUser ? t("sidebar.profileRoleAdmin") : t("sidebar.profileRoleUser")}
            </span>
          </div>
          <Link
            to={settingsPath}
            role="menuitem"
            className="header-user-profile__item"
            onClick={() => setOpen(false)}
          >
            <Settings {...iconSm} />
            <span>{t("sidebar.profileMenuSettings")}</span>
          </Link>
          <button type="button" role="menuitem" className="header-user-profile__item" onClick={handleLogout}>
            <LogOut {...iconSm} />
            <span>{t("sidebar.profileMenuLogout")}</span>
          </button>
        </div>
      )}
    </div>
  );
}
