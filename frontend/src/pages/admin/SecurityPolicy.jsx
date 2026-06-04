import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useSettings } from "../../contexts/SettingsContext";
import { getUserFacingApiError } from "../../utils/apiErrorMessage";

function mapApiToForm(data) {
  if (!data || typeof data !== "object") return null;
  const cq = !!data.complexiteRequise;
  const rawLen = Number(data.longueurMinimale);
  const rawDays = Number(data.dureeValiditeJours);
  return {
    longueurMinimale: Math.min(
      128,
      Math.max(8, Number.isFinite(rawLen) ? rawLen : 12),
    ),
    exigerMajuscules: data.exiger_majuscules ?? data.exigerMajuscules ?? cq,
    exigerMinuscules: data.exiger_minuscules ?? data.exigerMinuscules ?? cq,
    exigerChiffres: data.exiger_chiffres ?? data.exigerChiffres ?? cq,
    exigerSpecial: data.exiger_caracteres_speciaux ?? data.exigerSpecial ?? cq,
    dureeValiditeJours: Number.isFinite(rawDays)
      ? Math.max(0, Math.min(365, rawDays))
      : 90,
  };
}

function buildUpdatePayload(policy) {
  const longueurMinimale = Math.min(128, Math.max(8, Number(policy.longueurMinimale) || 8));
  const dureeValiditeJours = 0;
  const exigerMajuscules = !!policy.exigerMajuscules;
  const exigerMinuscules = !!policy.exigerMinuscules;
  const exigerChiffres = !!policy.exigerChiffres;
  const exigerSpecial = !!policy.exigerSpecial;
  const complexiteRequise =
    exigerMajuscules || exigerMinuscules || exigerChiffres || exigerSpecial;
  return {
    longueurMinimale,
    complexiteRequise,
    dureeValiditeJours,
    exiger_majuscules: exigerMajuscules,
    exiger_minuscules: exigerMinuscules,
    exiger_chiffres: exigerChiffres,
    exiger_caracteres_speciaux: exigerSpecial,
  };
}

export default function SecurityPolicy() {
  const { t } = useSettings();
  const [policy, setPolicy] = useState({
    longueurMinimale: 12,
    exigerMajuscules: true,
    exigerMinuscules: true,
    exigerChiffres: true,
    exigerSpecial: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await api.get("/admin/security-policy");
        const mapped = mapApiToForm(response.data);
        if (mapped) {
          setPolicy((prev) => ({ ...prev, ...mapped }));
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await api.put("/admin/security-policy", buildUpdatePayload(policy));
      setMessage({ type: "success", text: t("admin.security.successMsg") });
    } catch (err) {
      const text = getUserFacingApiError(err, {
        fallback: t("admin.security.errorValidation"),
        duplicateHint: t("admin.security.errorMsg"),
        technicalHint: t("admin.security.errorMsg"),
      });
      setMessage({ type: "error", text });
    } finally {
      setSaving(false);
    }
  };

  const CheckboxItem = ({ labelKey, descKey, field }) => (
    <label className="admin-security-check">
      <input
        type="checkbox"
        className="admin-security-check__input"
        checked={policy[field]}
        onChange={(e) => setPolicy({ ...policy, [field]: e.target.checked })}
      />
      <span className="admin-security-check__text">
        <span className="admin-security-check__label">{t(labelKey)}</span>
        <span className="admin-security-check__desc">{t(descKey)}</span>
      </span>
    </label>
  );

  return (
    <div className="vault-page">
      <div className="page-header">
        <div>
          <h2>{t("admin.security.title")}</h2>
        </div>
      </div>

      {loading ? (
        <p className="empty-state" style={{ marginTop: 24 }}>{t("admin.security.loading")}</p>
      ) : (
        <div className="admin-security-policy-form">
          
          {message.text && (
            <div style={{ padding: "12px 16px", borderRadius: "8px", marginBottom: "24px", fontSize: "14px", background: message.type === "success" ? "rgba(74, 222, 128, 0.1)" : "rgba(248, 113, 113, 0.1)", color: message.type === "success" ? "#4ade80" : "#ff6b6b", border: `1px solid ${message.type === "success" ? "rgba(74, 222, 128, 0.2)" : "rgba(248, 113, 113, 0.2)"}` }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSave}>
            
            <div className="admin-security-field">
              <label className="admin-security-field__label" htmlFor="policy-min-length">
                {t("admin.security.minLength")}
              </label>
              <input
                id="policy-min-length"
                type="number"
                className="admin-security-field__input"
                min="8"
                max="128"
                value={policy.longueurMinimale}
                onChange={(e) => setPolicy({ ...policy, longueurMinimale: parseInt(e.target.value, 10) || 8 })}
              />
            </div>

            <div className="admin-security-checks">
              <CheckboxItem labelKey="admin.security.uppercase" descKey="admin.security.uppercaseDesc" field="exigerMajuscules" />
              <CheckboxItem labelKey="admin.security.lowercase" descKey="admin.security.lowercaseDesc" field="exigerMinuscules" />
              <CheckboxItem labelKey="admin.security.numbers" descKey="admin.security.numbersDesc" field="exigerChiffres" />
              <CheckboxItem labelKey="admin.security.special" descKey="admin.security.specialDesc" field="exigerSpecial" />
            </div>

            <button type="submit" className="btn-admin-neutral admin-security-policy-form__submit" disabled={saving}>
              {saving ? t("admin.security.saving") : t("admin.security.save")}
            </button>

          </form>
        </div>
      )}
    </div>
  );
}
