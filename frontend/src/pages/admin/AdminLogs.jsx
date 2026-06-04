import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useSettings } from "../../contexts/SettingsContext";
import {
  formatLogAction,
  getLogActionClass,
  formatLogTypeLabel,
  getLogTypeClass,
} from "../../utils/activityLog";

export default function AdminLogs() {
  const { t } = useSettings();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/admin/logs");
      const rows = Array.isArray(response.data) ? response.data : [];
      setLogs(
        rows.map((log) => ({
          id: log.id,
          user: log.user ?? log.user_email ?? "",
          action: log.action ?? "",
          type: String(log.type ?? "").toLowerCase(),
          date: log.date ?? log.created_at ?? "",
        })),
      );
    } catch {
      setLogs([]);
      setError(t("admin.logs.errorFetch"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="vault-page">
      <div className="page-header">
        <div>
          <h2>{t("admin.logs.title")}</h2>
        </div>
      </div>

      {error && (
        <div className="auth-error-text" style={{ marginBottom: "12px" }}>
          {error}
        </div>
      )}

      <div className="admin-panel-table-wrap">
        {loading ? (
          <p className="empty-state">{t("admin.logs.loading")}</p>
        ) : logs.length === 0 ? (
          <p className="empty-state card-empty">{t("admin.logs.noLogs")}</p>
        ) : (
          <table className="admin-panel-table">
            <thead>
              <tr>
                <th>{t("admin.logs.date")}</th>
                <th>{t("admin.logs.user")}</th>
                <th>{t("admin.logs.action")}</th>
                <th>{t("admin.logs.type")}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="admin-panel-table__muted">{log.date}</td>
                  <td className="admin-panel-table__name">{log.user}</td>
                  <td className={getLogActionClass(log.action)}>{formatLogAction(log.action, t)}</td>
                  <td className={getLogTypeClass(log.type)}>{formatLogTypeLabel(log.type, t)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
