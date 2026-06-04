const LEGACY_ACTION_KEYS = {
  "Compte créé et vérifié": "account.verified",
  "Connexion réussie": "login.success",
  "Tentative de connexion échouée": "login.failed",
  "Mot de passe enregistré": "password.saved",
  "Mot de passe supprimé": "password.deleted",
  "Modification politique sécurité": "policy.updated",
  "Utilisateur ajouté": "user.added",
  "Utilisateur supprimé": "user.deleted",
};

export function resolveLogActionKey(action) {
  const raw = String(action ?? "").trim();
  if (!raw) return "unknown";

  if (raw.includes("|")) {
    return raw.split("|")[0].trim();
  }

  if (/^Mot de passe réinitialisé pour /i.test(raw)) {
    return "password.reset";
  }

  if (LEGACY_ACTION_KEYS[raw]) {
    return LEGACY_ACTION_KEYS[raw];
  }

  const lower = raw.toLowerCase();
  if (/connexion\s+r[eé]ussie/.test(lower)) return "login.success";
  if (/tentative.*connexion|[eé]chou.*connexion|connexion.*[eé]chou/.test(lower)) {
    return "login.failed";
  }
  if (/mot de passe enregistr/.test(lower)) return "password.saved";
  if (/mot de passe supprim/.test(lower)) return "password.deleted";
  if (/utilisateur ajout/.test(lower)) return "user.added";
  if (/utilisateur supprim/.test(lower)) return "user.deleted";
  if (/politique.*s[eé]curit/.test(lower)) return "policy.updated";
  if (/compte.*(cr[eé][eé]|v[eé]rifi)/.test(lower)) return "account.verified";

  if (/^[a-z][a-z0-9._-]*$/i.test(raw) && !raw.includes(" ")) {
    return raw;
  }

  return "unknown";
}

export function logActionVars(action) {
  const raw = String(action ?? "").trim();
  if (raw.includes("|")) {
    const [, email] = raw.split("|");
    return { email: (email ?? "").trim() };
  }
  const m = raw.match(/^Mot de passe réinitialisé pour (.+)$/i);
  if (m) return { email: m[1].trim() };
  return {};
}

export function formatLogAction(action, t) {
  const key = resolveLogActionKey(action);
  const vars = logActionVars(action);
  const path = `admin.logs.actions.${key}`;
  const label = t(path, vars);
  return label === path ? rawFallback(action) : label;
}

function rawFallback(action) {
  const raw = String(action ?? "").trim();
  if (raw.includes("|")) {
    const [k, email] = raw.split("|");
    return `${k} ${email}`.trim();
  }
  return raw || "—";
}

export function formatLogTypeLabel(type, t) {
  const norm = String(type ?? "").toLowerCase();
  if (norm === "admin") {
    return t("admin.logs.typeRoleAdmin");
  }
  return t("admin.logs.typeRoleUser");
}

export function getLogTypeClass(type) {
  const norm = String(type ?? "").toLowerCase();
  if (norm === "admin") return "admin-user-role admin-user-role--admin";
  return "admin-user-role admin-user-role--user";
}

export function getLogActionClass(action) {
  const key = resolveLogActionKey(action);
  switch (key) {
    case "login.success":
      return "admin-log-action admin-log-action--success";
    case "login.failed":
      return "admin-log-action admin-log-action--failed";
    case "password.reset":
      return "admin-log-action admin-log-action--reset";
    case "account.verified":
      return "admin-log-action admin-log-action--account";
    case "password.saved":
      return "admin-log-action admin-log-action--saved";
    case "password.deleted":
      return "admin-log-action admin-log-action--deleted";
    case "policy.updated":
    case "user.added":
    case "user.deleted":
      return "admin-log-action admin-log-action--policy";
    default:
      return "admin-log-action admin-log-action--default";
  }
}
