import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import api from "../../api/axios";
import { useSettings } from "../../contexts/SettingsContext";
import { extractArray } from "../../utils/passwordVault";
import { formatLogAction, resolveLogActionKey } from "../../utils/activityLog";

function isAdminRole(role) {
  const r = String(role ?? "").toLowerCase();
  return r === "admin" || r === "administrateur" || r === "administrator";
}

function accountDisplayName(userRef, users) {
  const email = String(userRef ?? "").trim().toLowerCase();
  if (!email) return "";
  const match = users.find((u) => String(u.email ?? "").trim().toLowerCase() === email);
  if (match?.username) return String(match.username).trim();
  const at = email.indexOf("@");
  return at > 0 ? email.slice(0, at) : email;
}

function formatActivityText(log, users, t) {
  const name = accountDisplayName(log.user, users);
  const actionLabel = formatLogAction(log.action, t);
  const key = resolveLogActionKey(log.action);

  if (key === "login.success") {
    return name ? t("admin.dashboard.activityLoginSuccess", { name }) : actionLabel;
  }
  if (key === "login.failed") {
    return name ? t("admin.dashboard.activityLoginFailed", { name }) : actionLabel;
  }
  if (name) {
    return t("admin.dashboard.activityByUser", { action: actionLabel, name });
  }
  return actionLabel;
}

function formatDashboardDate(date, locale) {
  try {
    return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return "";
  }
}

export default function AdminDashboard() {
  const { t, language } = useSettings();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const location = useLocation();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const [usersRes, logsRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/logs", { params: { limit: 5 } }).catch(() => ({ data: [] })),
      ]);

      setUsers(extractArray(usersRes.data));

      const logRows = extractArray(logsRes.data);
      setRecentLogs(logRows.slice(0, 5));
    } catch {
      setUsers([]);
      setRecentLogs([]);
      setFetchError(t("admin.dashboard.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchData();
  }, [fetchData, location.pathname]);

  const stats = useMemo(() => {
    const totalAccounts = users.length;
    const admins = users.filter((u) => isAdminRole(u.role)).length;
    const regularUsers = users.filter((u) => !isAdminRole(u.role)).length;
    const pctAdmins = totalAccounts > 0 ? Math.round((admins / totalAccounts) * 100) : 0;
    return { totalAccounts, regularUsers, admins, pctAdmins };
  }, [users]);

  const todayLabel = formatDashboardDate(new Date(), language);

  return (
    <div className="dashboard-page admin-dashboard">
      <div className="page-header admin-dashboard__header">
        <div>
          <h2>{t("admin.dashboard.title")}</h2>
        </div>
        {todayLabel && <time className="admin-dashboard__date">{todayLabel}</time>}
      </div>

      {loading ? (
        <div className="empty-state" style={{ marginTop: 20 }}>
          {t("admin.dashboard.loading")}
        </div>
      ) : (
        <>
          {fetchError ? (
            <p className="auth-error-text" role="alert" style={{ marginBottom: 16 }}>
              {fetchError}
            </p>
          ) : null}
          <div className="admin-dashboard-stats">
            <article className="admin-dashboard-stat admin-dashboard-stat--accent">
              <p className="admin-dashboard-stat__label">{t("admin.dashboard.statUsers")}</p>
              <p className="admin-dashboard-stat__value admin-dashboard-stat__value--accent">{stats.regularUsers}</p>
              <p className="admin-dashboard-stat__meta">{t("admin.dashboard.statUsersHint")}</p>
            </article>
            <article className="admin-dashboard-stat">
              <p className="admin-dashboard-stat__label">{t("admin.dashboard.statAdmins")}</p>
              <p className="admin-dashboard-stat__value">{stats.admins}</p>
              <p className="admin-dashboard-stat__meta">
                {t("admin.dashboard.percentAdmins", { pct: stats.pctAdmins })}
              </p>
            </article>
          </div>

          <section className="admin-dashboard-activity">
            <h3 className="admin-dashboard-activity__title">{t("admin.dashboard.recentActivity")}</h3>
            <div className="admin-dashboard-activity__panel">
              {recentLogs.length === 0 ? (
                <p className="admin-dashboard-activity__empty">{t("admin.dashboard.noActivity")}</p>
              ) : (
                <ul className="admin-dashboard-activity__list">
                  {recentLogs.map((log) => (
                    <li key={log.id} className="admin-dashboard-activity__item">
                      <span className="admin-dashboard-activity__text">
                        {formatActivityText(log, users, t)}
                      </span>
                      <time className="admin-dashboard-activity__time">
                        {log.date ?? log.created_at ?? ""}
                      </time>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
