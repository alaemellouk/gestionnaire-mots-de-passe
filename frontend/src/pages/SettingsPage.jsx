import { useSettings } from "../contexts/SettingsContext";

export default function SettingsPage() {
  const { theme, toggleTheme, language, changeLanguage, t } = useSettings();

  return (
    <div className="vault-page">
      <div className="page-header">
        <div>
          <h2>{t("settings.title")}</h2>
          <p>{t("settings.subtitle")}</p>
        </div>
      </div>

      <div style={{ marginTop: "24px", background: "var(--surface-color)", borderRadius: "16px", padding: "32px", border: "1px solid var(--border-color)", maxWidth: "600px", boxShadow: "var(--shadow)" }}>
        
        <div style={{ marginBottom: "32px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>{t("settings.appearance")}</h3>
          
          <div style={{ display: "flex", gap: "16px" }}>
            <button 
              onClick={() => theme === "light" && toggleTheme()}
              style={{
                flex: 1,
                padding: "16px",
                borderRadius: "12px",
                background: theme === "dark" ? "var(--accent-color)" : "var(--surface-hover)",
                border: `2px solid ${theme === "dark" ? "var(--accent-color)" : "transparent"}`,
                color: theme === "dark" ? "#ffffff" : "var(--text-primary)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s ease",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              {t("settings.darkMode")}
            </button>
            
            <button 
              onClick={() => theme === "dark" && toggleTheme()}
              style={{
                flex: 1,
                padding: "16px",
                borderRadius: "12px",
                background: theme === "light" ? "var(--accent-color)" : "var(--surface-hover)",
                border: `2px solid ${theme === "light" ? "var(--accent-color)" : "transparent"}`,
                color: theme === "light" ? "#ffffff" : "var(--text-primary)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s ease",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              {t("settings.lightMode")}
            </button>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>{t("settings.language")}</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <label style={{
              display: "flex", alignItems: "center", gap: "12px", cursor: "pointer",
              padding: "12px 16px",
              background: language === "fr" ? "rgba(99,102,241,0.1)" : "var(--surface-hover)",
              border: `2px solid ${language === "fr" ? "var(--accent-color)" : "transparent"}`,
              borderRadius: "10px",
              transition: "all 0.2s ease",
            }}>
              <input 
                type="radio" 
                name="language" 
                value="fr" 
                checked={language === "fr"} 
                onChange={() => changeLanguage("fr")}
                style={{ accentColor: "var(--accent-color)", width: "18px", height: "18px" }}
              />
              <span style={{ fontSize: "15px", fontWeight: language === "fr" ? 600 : 400 }}>🇫🇷 {t("settings.french")}</span>
            </label>
            
            <label style={{
              display: "flex", alignItems: "center", gap: "12px", cursor: "pointer",
              padding: "12px 16px",
              background: language === "en" ? "rgba(99,102,241,0.1)" : "var(--surface-hover)",
              border: `2px solid ${language === "en" ? "var(--accent-color)" : "transparent"}`,
              borderRadius: "10px",
              transition: "all 0.2s ease",
            }}>
              <input 
                type="radio" 
                name="language" 
                value="en" 
                checked={language === "en"} 
                onChange={() => changeLanguage("en")}
                style={{ accentColor: "var(--accent-color)", width: "18px", height: "18px" }}
              />
              <span style={{ fontSize: "15px", fontWeight: language === "en" ? 600 : 400 }}>🇬🇧 {t("settings.english")}</span>
            </label>
          </div>
        </div>

      </div>
    </div>
  );
}
