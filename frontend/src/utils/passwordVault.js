export function extractArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.passwords)) return payload.passwords;
  if (Array.isArray(payload?.categories)) return payload.categories;
  if (Array.isArray(payload?.users)) return payload.users;
  return [];
}

export function extractPlainPassword(payload) {
  const row = payload?.data ?? payload;
  if (!row || typeof row !== "object") return "";
  return String(row.mot_de_passe ?? row.motDePasse ?? row.password ?? "").trim();
}

export function passwordItemId(id) {
  return Number(id);
}

export function maskPassword(password) {
  return "•".repeat(Math.max(String(password || "").length, 8));
}

export function normalizePassword(item, uncategorizedLabel) {
  return {
    id: item.id,
    site: item.site || item.url || "-",
    login: item.login || item.username || item.email || "-",
    category: item.category?.name || item.category_name || uncategorizedLabel,
    password: "",
    categoryId: item.category_id || item.categorie_id || item.category?.id || null,
  };
}

export function buildVaultPasswordBody({ site, login, password, category_id }) {
  const body = {
    site,
    login,
    category_id: category_id || null,
    categorie_id: category_id || null,
    url: site,
  };
  const pwd = String(password ?? "").trim();
  if (pwd) {
    body.password = pwd;
    body.mot_de_passe = pwd;
    body.motDePasse = pwd;
  }
  return body;
}
