import { useSettings } from "../../contexts/SettingsContext";
import { Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";

export default function AdminSettings() {
  const { theme, toggleTheme, language, changeLanguage, t } = useSettings();

  return (
    <div className="vault-page">
      <div className="page-header">
        <div>
          <h2>{t("admin.settings.title")}</h2>
          <p>{t("admin.settings.subtitle")}</p>
        </div>
      </div>

      <div className="admin-settings-stack">
        <section className="admin-settings-panel">
          <h3 className="admin-settings-panel__title">{t("admin.settings.appearance")}</h3>
          <div className="admin-settings-panel__row">
            <div>
              <p className="admin-settings-panel__label">{t("admin.settings.darkLabel")}</p>
              <p className="admin-settings-panel__hint">{t("admin.settings.darkDesc")}</p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="auth-button secondary admin-settings-panel__btn-inline"
            >
              {theme === "dark" ? (
                <>
                  <Sun size={16} strokeWidth={2} aria-hidden />
                  {t("admin.settings.switchToLight")}
                </>
              ) : (
                <>
                  <Moon size={16} strokeWidth={2} aria-hidden />
                  {t("admin.settings.switchToDark")}
                </>
              )}
            </button>
          </div>
        </section>

        <section className="admin-settings-panel">
          <h3 className="admin-settings-panel__title">{t("admin.settings.languageTitle")}</h3>
          <div className="admin-settings-panel__actions">
            <button
              type="button"
              onClick={() => changeLanguage("fr")}
              className={`auth-button admin-settings-panel__btn-lang ${language === "fr" ? "primary" : "secondary"}`}
            >
              🇫🇷 {t("admin.settings.french")}
            </button>
            <button
              type="button"
              onClick={() => changeLanguage("en")}
              className={`auth-button admin-settings-panel__btn-lang ${language === "en" ? "primary" : "secondary"}`}
            >
              🇬🇧 {t("admin.settings.english")}
            </button>
          </div>
        </section>

        <section className="admin-settings-vault-card">
          <h3 className="admin-settings-vault-card__title">{t("admin.settings.vaultTitle")}</h3>
          <p className="admin-settings-vault-card__desc">{t("admin.settings.vaultDesc")}</p>
          <Link to="/passwords" className="auth-button primary admin-settings-vault-card__btn">
            {t("admin.settings.accessVault")}
          </Link>
        </section>
      </div>
    </div>
  );
}
