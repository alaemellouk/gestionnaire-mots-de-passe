export function looksLikeTechnicalOrSqlError(message) {
  if (!message || typeof message !== "string") return false;
  const s = message.toLowerCase();
  return (
    s.includes("sql") ||
    s.includes("insert into") ||
    s.includes("update ") ||
    s.includes("delete from") ||
    s.includes("database:") ||
    s.includes("sqlstate") ||
    s.includes("syntax error") ||
    s.includes("mysql") ||
    s.includes("sqlite") ||
    s.includes("postgresql") ||
    s.includes("exception") ||
    s.includes("stack trace") ||
    (s.includes("line ") && s.includes(".php"))
  );
}

export function getUserFacingApiError(err, { fallback, duplicateHint, technicalHint }) {
  const data = err?.response?.data;
  const status = err?.response?.status;

  if (data?.errors && typeof data.errors === "object") {
    const first = Object.values(data.errors)[0];
    const m = Array.isArray(first) ? first[0] : first;
    if (typeof m === "string" && m.trim() && !looksLikeTechnicalOrSqlError(m)) return m.trim();
  }

  if (typeof data?.message === "string") {
    const m = data.message.trim();
    const low = m.toLowerCase();
    if (looksLikeTechnicalOrSqlError(m)) return technicalHint;
    if (
      low.includes("duplicate") ||
      low.includes("unique") ||
      low.includes("déjà") ||
      low.includes("already exists")
    ) {
      return duplicateHint;
    }
    if (m.length <= 280) return m;
    return technicalHint;
  }

  if (status === 409) return duplicateHint;
  if (status === 422) return fallback;

  return technicalHint;
}
