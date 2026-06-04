import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useSettings } from "../contexts/SettingsContext";

export default function UserDashboard() {
  const [passwordsCount, setPasswordsCount] = useState(0);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { t } = useSettings();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/coffre/stats");
        setPasswordsCount(data?.passwords_count ?? 0);
        setCategoriesCount(data?.categories_count ?? 0);
      } catch {
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h2>{t("dashboard.title")}</h2>
          <p>{t("dashboard.subtitle")}</p>
        </div>
      </div>

      {loading ? (
        <div style={{ color: "rgba(255,255,255,0.7)", marginTop: 20 }}>Chargement des statistiques...</div>
      ) : (
        <div className="dashboard-stats">
          
          <div className="stat-card vault-stat-card">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ background: "rgba(255, 255, 255, 0.1)", padding: "12px", borderRadius: "12px", display: "flex" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" color="white"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", color: "inherit", opacity: 0.8, fontWeight: 500 }}>{t("dashboard.passwords")}</h3>
                <div style={{ fontSize: "32px", fontWeight: 700, color: "inherit", marginTop: "4px" }}>{passwordsCount}</div>
              </div>
            </div>
            <Link to="/passwords" className="stat-link" style={{ color: "inherit", textDecoration: "none", fontSize: "14px", marginTop: "8px", display: "flex", alignItems: "center", gap: "4px", opacity: 0.8 }}>
              {t("dashboard.viewPasswords")} <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>

          <div className="stat-card vault-stat-card">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ background: "rgba(255, 255, 255, 0.1)", padding: "12px", borderRadius: "12px", display: "flex" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" color="white"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", color: "inherit", opacity: 0.8, fontWeight: 500 }}>{t("dashboard.categories")}</h3>
                <div style={{ fontSize: "32px", fontWeight: 700, color: "inherit", marginTop: "4px" }}>{categoriesCount}</div>
              </div>
            </div>
            <Link to="/categories" className="stat-link" style={{ color: "inherit", textDecoration: "none", fontSize: "14px", marginTop: "8px", display: "flex", alignItems: "center", gap: "4px", opacity: 0.8 }}>
              {t("dashboard.viewCategories")} <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>

        </div>
      )}

      <div style={{ marginTop: "40px" }}>
        <h3 style={{ fontSize: "20px", marginBottom: "16px", fontWeight: 600 }}>{t("dashboard.quickActions")}</h3>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link to="/passwords" className="quick-action-btn">
            {t("dashboard.addPassword")}
          </Link>
        </div>
      </div>
    </div>
  );
}
