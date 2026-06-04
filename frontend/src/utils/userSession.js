const EMAIL_KEY = "userEmail";
const NAME_KEY = "userName";
const ROLE_KEY = "userRole";

export function persistUserFromAuth(user, fallbackEmail = "") {
  const email = (user?.email ?? fallbackEmail ?? "").trim();
  const name = (user?.username ?? user?.name ?? user?.nom ?? "").trim();
  let role = (user?.role ?? "").toString().trim();
  if (!role) {
    role = localStorage.getItem("isAdmin") === "true" ? "admin" : "utilisateur";
  }

  if (email) localStorage.setItem(EMAIL_KEY, email);
  if (name) localStorage.setItem(NAME_KEY, name);
  localStorage.setItem(ROLE_KEY, role);
}

export function persistUserFromRegister({ username, email, role }) {
  if (email) localStorage.setItem(EMAIL_KEY, email.trim());
  if (username) localStorage.setItem(NAME_KEY, username.trim());
  localStorage.setItem(ROLE_KEY, (role || "utilisateur").toString());
}

export function clearUserSession() {
  localStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem(NAME_KEY);
  localStorage.removeItem(ROLE_KEY);
}

export function readStoredUserProfile() {
  return {
    email: localStorage.getItem(EMAIL_KEY) || "",
    name: localStorage.getItem(NAME_KEY) || "",
    role: localStorage.getItem(ROLE_KEY) || "",
  };
}

export function getProfileInitialLetter(profile) {
  const n = profile.name?.trim();
  if (n) return n.charAt(0).toUpperCase();
  const e = profile.email?.trim();
  if (e) return e.charAt(0).toUpperCase();
  return "?";
}

export function isAdminProfile(profile) {
  if (localStorage.getItem("isAdmin") === "true") return true;
  const r = (profile.role || "").toLowerCase();
  return r === "admin" || r === "administrateur";
}
