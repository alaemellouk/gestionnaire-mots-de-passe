import {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
} from "react";
import translations from "../utils/translations";

const SettingsContext = createContext();

function normalizeLanguage(lang) {
  return lang === "en" ? "en" : "fr";
}

export function SettingsProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [language, setLanguage] = useState(() =>
    normalizeLanguage(localStorage.getItem("language")),
  );

  useLayoutEffect(() => {
    document.body.classList.toggle("light-mode", theme === "light");
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const changeLanguage = useCallback((lang) => {
    setLanguage(normalizeLanguage(lang));
  }, []);

  const t = useCallback((key, vars) => {
    const keyParts = key.split(".");
    let value = translations[language];
    for (const k of keyParts) {
      if (value[k] === undefined) return key;
      value = value[k];
    }
    if (typeof value !== "string") return key;
    if (!vars) return value;
    return value.replace(/\{\{(\w+)\}\}/g, (_, name) => {
      const v = vars[name];
      return v !== undefined && v !== null ? String(v) : "";
    });
  }, [language]);

  const value = useMemo(
    () => ({ theme, toggleTheme, language, changeLanguage, t }),
    [theme, toggleTheme, language, changeLanguage, t],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
