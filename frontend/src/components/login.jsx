import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { persistUserFromAuth } from "../utils/userSession";
import { useSettings } from "../contexts/SettingsContext";
import PassGuardLogo from "./PassGuardLogo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleChoice, setShowRoleChoice] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useSettings();
  const year = new Date().getFullYear();
  const registrationSuccess = location.state?.registrationSuccess ?? "";

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await api.post("/login", { email, password });
      const token =
        response?.data?.token ||
        response?.data?.access_token ||
        response?.data?.data?.token;

      if (!token) {
        throw new Error("Token manquant.");
      }

      const user = response?.data?.user;
      const isAdmin =
        user?.role === "admin" ||
        user?.role === "administrateur" ||
        user?.is_admin === true ||
        user?.isAdmin === true;

      localStorage.setItem("token", token);
      localStorage.setItem("isAdmin", isAdmin);
      persistUserFromAuth(user || {}, email);

      if (isAdmin) {
        setShowRoleChoice(true);
      } else {
        navigate("/categories", { replace: true });
      }
    } catch (error) {
      const message = error?.response?.data?.message || t("login.loginError");
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelection = (path) => {
    navigate(path, { replace: true });
  };

  if (showRoleChoice) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-card__brand">
            <PassGuardLogo as="h1" variant="auth" className="auth-card__logo" />
            <p className="auth-card__tagline">{t("login.adminChoiceTagline")}</p>
          </div>
          <h2 className="auth-card__title">{t("login.adminChoiceTitle")}</h2>
          <div className="auth-form-container" style={{ textAlign: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <button
                type="button"
                className="auth-button primary"
                onClick={() => handleRoleSelection("/admin/users")}
                style={{ background: "var(--accent-color)", borderColor: "var(--accent-color)" }}
              >
                {t("login.adminChoiceAdmin")}
              </button>
              <button type="button" className="auth-button secondary" onClick={() => handleRoleSelection("/categories")}>
                {t("login.adminChoiceVault")}
              </button>
            </div>
          </div>
          <p className="auth-card__footer">{t("auth.footer", { year })}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card auth-card--login">
        <div className="auth-card__brand">
          <PassGuardLogo as="h1" variant="auth" className="auth-card__logo" />
          <p className="auth-card__tagline">{t("login.tagline")}</p>
        </div>

        <h2 className="auth-card__title">{t("login.title")}</h2>

        {registrationSuccess ? (
          <div className="auth-banner--ok" role="status">
            {registrationSuccess}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="auth-alert" role="alert">
            <span className="auth-alert__icon" aria-hidden>
              !
            </span>
            <span>{errorMessage}</span>
          </div>
        ) : null}

        <div className="auth-form-container">
          <form className="auth-form auth-form--login" onSubmit={login}>
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="login-email">
                {t("login.emailLabel")}
              </label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </span>
                <input
                  id="login-email"
                  name="email"
                  autoComplete="email"
                  className="auth-input"
                  placeholder={t("login.email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-field__label" htmlFor="login-password">
                {t("login.passwordLabel")}
              </label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                  </svg>
                </span>
                <input
                  id="login-password"
                  name="password"
                  autoComplete="current-password"
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("login.password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span className="auth-input-eye" role="button" tabIndex={0} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                  )}
                </span>
              </div>
            </div>

            <div className="auth-row">
              <Link to="/forgot-password" className="auth-forgot">
                {t("login.forgotPassword")}
              </Link>
            </div>

            <button className="auth-button primary auth-button--login-submit" type="submit" disabled={loading}>
              {loading ? t("login.connecting") : t("login.submit")}
            </button>

            <div className="auth-divider">
              <span>{t("login.or")}</span>
            </div>

            <Link to="/register" className="auth-button secondary">
              {t("login.registerLink")}
            </Link>
          </form>
        </div>

        <p className="auth-card__footer">{t("auth.footer", { year })}</p>
      </div>
    </div>
  );
}
