import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useSettings } from "../contexts/SettingsContext";
import { getUserFacingApiError } from "../utils/apiErrorMessage";
import PassGuardLogo from "./PassGuardLogo";

export default function ForgotPassword() {
  const { t } = useSettings();
  const year = new Date().getFullYear();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Veuillez entrer votre adresse email.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/forgot-password", { email });
      setStep(2);
    } catch (err) {
      if (err.response?.status === 422) {
        setError(err.response.data?.message || t("forgotPassword.errorInvalidEmail"));
      } else if (!err.response) {
        if (err.code === "ECONNABORTED") {
          setError(t("forgotPassword.errorSendTimeout"));
        } else if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
          setError(t("forgotPassword.errorSendNetwork"));
        } else {
          setError(
            getUserFacingApiError(err, {
              fallback: t("forgotPassword.errorSendGeneric"),
              duplicateHint: t("forgotPassword.errorSendGeneric"),
              technicalHint: t("forgotPassword.errorSendGeneric"),
            }),
          );
        }
      } else {
        setError(
          getUserFacingApiError(err, {
            fallback: t("forgotPassword.errorSendGeneric"),
            duplicateHint: t("forgotPassword.errorInvalidEmail"),
            technicalHint: t("forgotPassword.errorSendGeneric"),
          }),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!code || code.length !== 6) {
      setError("Veuillez entrer le code à 6 chiffres.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/verify-reset-code", { email, code });
      setStep(3);
    } catch (err) {
      if (err.response?.status === 422) {
        setError(err.response.data.message || "Code invalide ou expiré.");
      } else {
        setError("Une erreur s'est produite lors de la vérification.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await api.post("/forgot-password", { email });
      setCode("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          getUserFacingApiError(err, {
            fallback: t("forgotPassword.errorSendGeneric"),
            duplicateHint: t("forgotPassword.errorInvalidEmail"),
            technicalHint: t("forgotPassword.errorSendGeneric"),
          }),
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!password || password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/reset-password", { email, code, password });
      setMessage(response.data.message || "Mot de passe réinitialisé avec succès.");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      if (err.response?.status === 422 || err.response?.status === 404) {
        setError(err.response.data.message || "Erreur de réinitialisation.");
      } else {
        setError("Une erreur s'est produite. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderEyeIcon = (isVisible) => (
    isVisible ? (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" /></svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" /></svg>
    )
  );

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-card__brand">
          <PassGuardLogo as="h1" variant="auth" className="auth-card__logo" />
          <p className="auth-card__tagline">{t("login.tagline")}</p>
        </div>

        <h2 className="auth-card__title">{t("forgotPassword.title")}</h2>

        <div className="auth-form-container">
          {step === 1 && (
            <form className="auth-form" onSubmit={handleEmailSubmit}>
              <div className="auth-field">
                <label className="auth-field__label" htmlFor="forgot-email">
                  {t("forgotPassword.emailLabel")}
                </label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon" aria-hidden>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                  </span>
                  <input
                    id="forgot-email"
                    type="email"
                    className="auth-input"
                    placeholder={t("forgotPassword.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              {error ? (
                <div className="auth-alert" role="alert">
                  <span className="auth-alert__icon" aria-hidden>
                    !
                  </span>
                  <span>{error}</span>
                </div>
              ) : null}

              <button className="auth-button primary" type="submit" disabled={loading}>
                {loading ? t("forgotPassword.sending") : t("forgotPassword.sendCode")}
              </button>

              <div className="auth-divider" style={{ marginTop: "16px" }}>
                <span>{t("login.or")}</span>
              </div>

              <Link to="/login" className="auth-button secondary">
                {t("forgotPassword.backToLogin")}
              </Link>
            </form>
          )}

          {step === 2 && (
            <form className="auth-form" onSubmit={handleCodeSubmit}>
              <p className="forgot-verify-intro">
                {t("forgotPassword.codeSent")} <strong>{email}</strong>.
              </p>

              <div className="auth-field">
                <label className="auth-field__label" htmlFor="forgot-code">
                  {t("forgotPassword.codeLabel")}
                </label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">🔑</span>
                  <input
                    id="forgot-code"
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
                <button
                  type="button"
                  className="forgot-resend-link"
                  onClick={() => void handleResendCode()}
                  disabled={loading}
                >
                  {loading ? t("forgotPassword.sending") : t("forgotPassword.resendCode")}
                </button>
              </div>

              {error ? (
                <div className="auth-alert" role="alert">
                  <span className="auth-alert__icon" aria-hidden>
                    !
                  </span>
                  <span>{error}</span>
                </div>
              ) : null}

              <button className="auth-button primary" type="submit" disabled={loading}>
                {loading ? t("forgotPassword.verifying") : t("forgotPassword.verifyCode")}
              </button>

              <div style={{ textAlign: "center", marginTop: "12px" }}>
                <button
                  type="button"
                  className="forgot-change-email-link"
                  onClick={() => {
                    setStep(1);
                    setCode("");
                    setError("");
                  }}
                >
                  {t("forgotPassword.changeEmail")}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form className="auth-form" onSubmit={handlePasswordSubmit}>
              <div className="auth-field">
                <label className="auth-field__label" htmlFor="forgot-pass">
                  {t("forgotPassword.passLabel")}
                </label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    id="forgot-pass"
                    className="auth-input"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("forgotPassword.passLabel")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <span className="auth-input-eye" role="button" tabIndex={0} onClick={() => setShowPassword(!showPassword)}>
                    {renderEyeIcon(showPassword)}
                  </span>
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-field__label" htmlFor="forgot-confirm">
                  {t("forgotPassword.confirmLabel")}
                </label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    id="forgot-confirm"
                    className="auth-input"
                    type={showConfirm ? "text" : "password"}
                    placeholder={t("forgotPassword.confirmLabel")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <span className="auth-input-eye" role="button" tabIndex={0} onClick={() => setShowConfirm(!showConfirm)}>
                    {renderEyeIcon(showConfirm)}
                  </span>
                </div>
              </div>

              {error ? (
                <div className="auth-alert" role="alert">
                  <span className="auth-alert__icon" aria-hidden>
                    !
                  </span>
                  <span>{error}</span>
                </div>
              ) : null}
              {message ? <div className="auth-banner--ok">{message}</div> : null}

              <button className="auth-button primary" type="submit" disabled={loading}>
                {loading ? t("forgotPassword.updating") : t("forgotPassword.resetPass")}
              </button>
            </form>
          )}
        </div>

        <p className="auth-card__footer">{t("auth.footer", { year })}</p>
      </div>
    </div>
  );
}