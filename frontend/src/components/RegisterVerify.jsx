import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useSettings } from "../contexts/SettingsContext";
import PassGuardLogo from "./PassGuardLogo";

export default function RegisterVerify() {
  const { t } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email ?? "";
  const year = new Date().getFullYear();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  useEffect(() => {
    if (!email) {
      navigate("/register", { replace: true });
    }
  }, [email, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    if (!code || code.length !== 6) {
      setError(t("registerVerify.codeRequired"));
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/register/verify", { email, code });
      navigate("/login", {
        replace: true,
        state: {
          registrationSuccess:
            response.data?.message ?? t("registerVerify.successLogin"),
        },
      });
    } catch (err) {
      const errorCode = err.response?.data?.error;
      if (errorCode === "expired") {
        setError(t("registerVerify.errorExpired"));
      } else if (errorCode === "incorrect") {
        setError(t("registerVerify.errorIncorrect"));
      } else {
        setError(err.response?.data?.message || t("registerVerify.errorGeneric"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setInfoMessage("");
    setResendLoading(true);

    try {
      const response = await api.post("/register/resend", { email });
      setInfoMessage(response.data?.message || t("registerVerify.resendSuccess"));
      setCode("");
    } catch (err) {
      setError(err.response?.data?.message || t("registerVerify.resendError"));
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-card__brand">
          <PassGuardLogo as="h1" variant="auth" className="auth-card__logo" />
          <p className="auth-card__tagline">{t("register.tagline")}</p>
        </div>

        <h2 className="auth-card__title">{t("registerVerify.title")}</h2>
        <p className="auth-card__subtitle">
          {t("registerVerify.subtitle")} <strong>{email}</strong>.
        </p>

        <div className="auth-form-container">
          <form className="auth-form" onSubmit={handleVerify}>
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="register-verify-code">
                {t("registerVerify.codeLabel")}
              </label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon" aria-hidden>
                  🔑
                </span>
                <input
                  id="register-verify-code"
                  type="text"
                  inputMode="numeric"
                  className="auth-input"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                  maxLength={6}
                  style={{ letterSpacing: "4px", fontWeight: 700 }}
                  autoComplete="one-time-code"
                />
              </div>
            </div>

            {error ? (
              <span className="auth-error-text" role="alert">
                {error}
              </span>
            ) : null}

            {infoMessage ? <div className="auth-banner--ok">{infoMessage}</div> : null}

            <button className="auth-button primary" type="submit" disabled={loading} style={{ marginTop: "8px" }}>
              {loading ? "..." : t("registerVerify.verify")}
            </button>

            <div style={{ textAlign: "center", marginTop: "16px" }}>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--accent-color)",
                  fontSize: "13px",
                  cursor: resendLoading ? "wait" : "pointer",
                  textDecoration: "underline",
                }}
              >
                {resendLoading ? t("registerVerify.resending") : t("registerVerify.resend")}
              </button>
            </div>

            <div className="auth-divider" style={{ marginTop: "16px" }}>
              <span>{t("register.or")}</span>
            </div>

            <Link to="/register" className="auth-button secondary">
              {t("registerVerify.backToRegister")}
            </Link>
          </form>
        </div>

        <p className="auth-card__footer">{t("auth.footer", { year })}</p>
      </div>
    </div>
  );
}
