import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Filter } from "lucide-react";
import ConfirmDialog from "../../components/ConfirmDialog";
import api from "../../api/axios";
import { useSettings } from "../../contexts/SettingsContext";
import { useAdminUsersSearch } from "../../contexts/AdminUsersSearchContext";
import { getUserFacingApiError } from "../../utils/apiErrorMessage";
import { extractArray } from "../../utils/passwordVault";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isAdminRole(role) {
  return role === "admin" || role === "administrateur";
}

function normalizeRole(role) {
  const r = String(role ?? "").toLowerCase();
  if (r === "admin" || r === "administrateur") return "admin";
  if (r === "manager" || r === "gestionnaire") return "manager";
  return "user";
}

function formatCreatedAt(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function roleLabel(role, t) {
  const norm = normalizeRole(role);
  if (norm === "admin") return t("admin.users.administrator");
  if (norm === "manager") return t("admin.users.managerRole");
  return t("admin.users.userRole");
}

function roleTextClass(role) {
  const norm = normalizeRole(role);
  if (norm === "admin") return "admin-user-role admin-user-role--admin";
  return "admin-user-role admin-user-role--user";
}

export default function UsersManagement() {
  const { t } = useSettings();
  const { query } = useAdminUsersSearch();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "utilisateur",
  });
  const [editingUser, setEditingUser] = useState(null);

  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const [editFieldErrors, setEditFieldErrors] = useState({});
  const [editFormError, setEditFormError] = useState("");
  const [editSubmitLoading, setEditSubmitLoading] = useState(false);
  const [editPassword, setEditPassword] = useState("");
  const [editConfirmPassword, setEditConfirmPassword] = useState("");
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showEditConfirmPassword, setShowEditConfirmPassword] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [roleFilterOpen, setRoleFilterOpen] = useState(false);
  const roleFilterRef = useRef(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/users");
      setUsers(extractArray(response.data));
      setError("");
    } catch {
      setError(t("admin.users.errorFetch"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (!roleFilterOpen) return;
    const onPointerDown = (e) => {
      if (roleFilterRef.current && !roleFilterRef.current.contains(e.target)) {
        setRoleFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [roleFilterOpen]);

  const filteredUsers = useMemo(() => {
    const q = query.toLowerCase().trim();
    return users.filter((user) => {
      const matchesSearch =
        !q ||
        user.username?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (roleFilter === "all") return true;

      const role = normalizeRole(user.role);
      if (roleFilter === "admin") return role === "admin";
      if (roleFilter === "user") return role === "user";
      return true;
    });
  }, [users, query, roleFilter]);

  const openAddModal = () => {
    setNewUser({ username: "", email: "", password: "", role: "utilisateur" });
    setFieldErrors({});
    setFormError("");
    setFormSuccess("");
    setShowAddPassword(false);
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setShowAddPassword(false);
  };

  const validateAdd = () => {
    const next = {};
    const name = newUser.username.trim();
    const email = newUser.email.trim();
    if (!name) next.username = t("admin.users.reqUsername");
    if (!email) next.email = t("admin.users.reqEmail");
    else if (!EMAIL_RE.test(email)) next.email = t("admin.users.reqEmailValid");
    if (!newUser.password) next.password = t("admin.users.reqPassword");
    else if (newUser.password.length < 8) next.password = t("admin.users.reqPasswordMin");
    if (!["utilisateur", "admin"].includes(newUser.role)) next.role = t("admin.users.reqRole");
    return next;
  };

  const validateEdit = () => {
    if (!editingUser) return {};
    const next = {};
    const name = editingUser.username?.trim() ?? "";
    const email = editingUser.email?.trim() ?? "";
    const pwd = editPassword.trim();
    const confirm = editConfirmPassword.trim();

    if (!name) next.username = t("admin.users.reqUsername");
    if (!email) next.email = t("admin.users.reqEmail");
    else if (!EMAIL_RE.test(email)) next.email = t("admin.users.reqEmailValid");

    if (pwd || confirm) {
      if (!pwd || !confirm) {
        next.password = t("admin.users.reqPasswordBoth");
      } else if (pwd.length < 8) {
        next.password = t("admin.users.reqPasswordMin");
      } else if (pwd !== confirm) {
        next.passwordConfirmation = t("admin.users.passwordMismatch");
      }
    }

    return next;
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/admin/users/${userToDelete.id}`);
      if (editingUser != null && Number(editingUser.id) === Number(userToDelete.id)) {
        closeEdit();
      }
      setUsers((prev) => prev.filter((user) => user.id !== userToDelete.id));
      setFormSuccess("");
      setUserToDelete(null);
    } catch (err) {
      setError(
        getUserFacingApiError(err, {
          fallback: t("admin.users.errorDelete"),
          duplicateHint: t("admin.users.errorDuplicate"),
          technicalHint: t("admin.users.errorTechnical"),
        }),
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setFormError("");
    const next = validateAdd();
    setFieldErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitLoading(true);
    try {
      const displayName = newUser.username.trim();
      await api.post("/admin/users", {
        username: displayName,
        name: displayName,
        nom: displayName,
        email: newUser.email.trim(),
        password: newUser.password,
        role: newUser.role,
      });
      closeAddModal();
      setNewUser({ username: "", email: "", password: "", role: "utilisateur" });
      setFieldErrors({});
      setFormSuccess(t("admin.users.successAdd"));
      fetchUsers();
      window.setTimeout(() => setFormSuccess(""), 5000);
    } catch (err) {
      setFormError(
        getUserFacingApiError(err, {
          fallback: t("admin.users.errorAdd"),
          duplicateHint: t("admin.users.errorDuplicate"),
          technicalHint: t("admin.users.errorTechnical"),
        }),
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditFormError("");
    const next = validateEdit();
    setEditFieldErrors(next);
    if (Object.keys(next).length > 0) return;

    setEditSubmitLoading(true);
    try {
      const displayName = editingUser.username.trim();
      const roleNorm = isAdminRole(editingUser.role) ? "admin" : "utilisateur";
      const payload = {
        username: displayName,
        name: displayName,
        nom: displayName,
        email: editingUser.email.trim(),
        role: roleNorm,
      };

      if (editingUser.status) {
        payload.status = editingUser.status;
      }

      const pwd = editPassword.trim();
      const confirm = editConfirmPassword.trim();
      if (pwd && confirm) {
        payload.password = pwd;
        payload.password_confirmation = confirm;
      }

      await api.put(`/admin/users/${editingUser.id}`, payload);
      setEditingUser(null);
      setEditPassword("");
      setEditConfirmPassword("");
      setShowEditPassword(false);
      setShowEditConfirmPassword(false);
      setEditFieldErrors({});
      setFormSuccess(t("admin.users.successEdit"));
      fetchUsers();
      window.setTimeout(() => setFormSuccess(""), 5000);
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors?.password_confirmation) {
        setEditFieldErrors((prev) => ({
          ...prev,
          passwordConfirmation: apiErrors.password_confirmation[0],
        }));
      } else if (apiErrors?.password) {
        setEditFieldErrors((prev) => ({
          ...prev,
          password: apiErrors.password[0],
        }));
      }

      const apiMessage = err.response?.data?.message;
      if (apiMessage?.includes("ne correspondent pas")) {
        setEditFieldErrors((prev) => ({
          ...prev,
          passwordConfirmation: t("admin.users.passwordMismatch"),
        }));
      }

      setEditFormError(
        getUserFacingApiError(err, {
          fallback: t("admin.users.errorEdit"),
          duplicateHint: t("admin.users.errorDuplicate"),
          technicalHint: t("admin.users.errorEditTechnical"),
        }),
      );
    } finally {
      setEditSubmitLoading(false);
    }
  };

  const closeEdit = () => {
    setEditingUser(null);
    setEditPassword("");
    setEditConfirmPassword("");
    setShowEditPassword(false);
    setShowEditConfirmPassword(false);
    setEditFieldErrors({});
    setEditFormError("");
  };

  const openEdit = (user) => {
    const userId = Number(user.id);
    if (editingUser != null && Number(editingUser.id) === userId) {
      closeEdit();
      return;
    }
    setEditingUser({
      id: userId,
      username: user.username ?? "",
      email: user.email ?? "",
      role: isAdminRole(user.role) ? "admin" : "utilisateur",
      status: user.status ?? "active",
    });
    setEditPassword("");
    setEditConfirmPassword("");
    setShowEditPassword(false);
    setShowEditConfirmPassword(false);
    setEditFieldErrors({});
    setEditFormError("");
  };

  const renderInlineEditForm = () => {
    if (!editingUser) return null;

    return (
      <div className="admin-user-edit-panel__inner admin-user-edit-panel__inner--inline">
        <div className="admin-user-edit-panel__header">
          <h3 id="edit-user-title" className="admin-user-edit-panel__title">
            {t("admin.users.editTitle")} — {editingUser.username}
          </h3>
          <button
            type="button"
            className="admin-user-edit-panel__close"
            onClick={closeEdit}
            aria-label={t("admin.users.cancel")}
          >
            ✕
          </button>
        </div>

        {editFormError && (
          <div className="form-banner form-banner--error" role="alert">
            {editFormError}
          </div>
        )}

        <form className="modal-form admin-user-edit-panel__form" onSubmit={handleUpdateUser}>
          <div className="admin-user-edit-panel__grid">
            <div className="form-field">
              <label htmlFor="edit-username">{t("admin.users.username")}</label>
              <input
                id="edit-username"
                className="form-input modal-form-input"
                value={editingUser.username}
                onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
              />
              {editFieldErrors.username && (
                <span className="auth-error-text">{editFieldErrors.username}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="edit-email">{t("admin.users.email")}</label>
              <input
                id="edit-email"
                className="form-input modal-form-input"
                type="email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
              />
              {editFieldErrors.email && (
                <span className="auth-error-text">{editFieldErrors.email}</span>
              )}
            </div>
          </div>

          <div className="form-field">
            <span className="modal-form-label">{t("admin.users.roleLabel")}</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setEditingUser({ ...editingUser, role: "utilisateur" })}
                style={roleBtnStyle(editingUser.role === "utilisateur", "user")}
              >
                {t("admin.users.userRole")}
              </button>
              <button
                type="button"
                onClick={() => setEditingUser({ ...editingUser, role: "admin" })}
                style={roleBtnStyle(editingUser.role === "admin", "admin")}
              >
                {t("admin.users.administrator")}
              </button>
            </div>
          </div>

          <div className="modal-form-section">
            <span className="modal-form-label">{t("admin.users.resetPasswordTitle")}</span>

            <div className="admin-user-edit-panel__grid">
              <div className="form-field">
                <label htmlFor="edit-new-password">{t("admin.users.newPassword")}</label>
                <div className="modal-password-wrapper">
                  <input
                    id="edit-new-password"
                    className="form-input modal-form-input modal-form-input--with-eye"
                    type={showEditPassword ? "text" : "password"}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="modal-password-eye"
                    onClick={() => setShowEditPassword((v) => !v)}
                    aria-label={showEditPassword ? "Masquer" : "Afficher"}
                  >
                    {renderPasswordEye(showEditPassword)}
                  </button>
                </div>
                {editFieldErrors.password && (
                  <span className="auth-error-text">{editFieldErrors.password}</span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="edit-confirm-password">{t("admin.users.confirmNewPassword")}</label>
                <div className="modal-password-wrapper">
                  <input
                    id="edit-confirm-password"
                    className="form-input modal-form-input modal-form-input--with-eye"
                    type={showEditConfirmPassword ? "text" : "password"}
                    value={editConfirmPassword}
                    onChange={(e) => setEditConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="modal-password-eye"
                    onClick={() => setShowEditConfirmPassword((v) => !v)}
                    aria-label={showEditConfirmPassword ? "Masquer" : "Afficher"}
                  >
                    {renderPasswordEye(showEditConfirmPassword)}
                  </button>
                </div>
                {editFieldErrors.passwordConfirmation && (
                  <span className="auth-error-text">{editFieldErrors.passwordConfirmation}</span>
                )}
              </div>
            </div>
          </div>

          <div className="modal-form-actions">
            <button
              type="button"
              onClick={closeEdit}
              className="auth-button secondary"
              style={{ flex: 1 }}
              disabled={editSubmitLoading}
            >
              {t("admin.users.cancel")}
            </button>
            <button
              type="submit"
              className="auth-button primary"
              style={{ flex: 1 }}
              disabled={editSubmitLoading}
            >
              {editSubmitLoading ? t("admin.users.updating") : t("admin.users.update")}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderPasswordEye = (visible) =>
    visible ? (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
      </svg>
    );

  const roleBtnStyle = (active, variant) => ({
    flex: 1,
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid var(--border-color)",
    background: active
      ? variant === "admin"
        ? "rgba(239, 68, 68, 0.12)"
        : "var(--surface-hover)"
      : "transparent",
    color: active
      ? variant === "admin"
        ? "#ef4444"
        : "var(--text-primary)"
      : "var(--text-secondary)",
    cursor: "pointer",
    fontWeight: active ? 600 : 500,
    fontSize: "14px",
    transition: "background 0.15s ease, color 0.15s ease, border-color 0.15s ease",
  });

  return (
    <div className="vault-page">
      <div className="page-header admin-users-page-header">
        <div>
          <h2>{t("admin.users.title")}</h2>
        </div>
        <div className="admin-users-header-actions">
          <div className="admin-users-filter" ref={roleFilterRef}>
            <button
              type="button"
              className="admin-users-filter__trigger"
              onClick={() => setRoleFilterOpen((open) => !open)}
              aria-expanded={roleFilterOpen}
              aria-haspopup="listbox"
              aria-label={t("admin.users.filterLabel")}
            >
              <Filter size={18} strokeWidth={2} aria-hidden />
            </button>
            {roleFilterOpen && (
              <div className="admin-users-filter__menu" role="listbox" aria-label={t("admin.users.filterLabel")}>
                {[
                  { id: "all", label: t("admin.users.filterAll") },
                  { id: "user", label: t("admin.users.filterUsers") },
                  { id: "admin", label: t("admin.users.filterAdmins") },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    role="option"
                    aria-selected={roleFilter === opt.id}
                    className={`admin-users-filter__option${roleFilter === opt.id ? " admin-users-filter__option--active" : ""}`}
                    onClick={() => {
                      setRoleFilter(opt.id);
                      setRoleFilterOpen(false);
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="button" className="btn-admin-new-account" onClick={openAddModal}>
            {t("admin.users.newAccount")}
          </button>
        </div>
      </div>

      {formSuccess && (
        <div className="form-banner form-banner--success" role="status">
          {formSuccess}
        </div>
      )}

      {error && (
        <div className="auth-error-text" style={{ marginBottom: "12px" }}>
          {error}
        </div>
      )}

      <div className="admin-panel-table-wrap admin-panel-table-wrap--users">
        {loading ? (
          <p className="empty-state">{t("admin.users.loading")}</p>
        ) : filteredUsers.length === 0 ? (
          <p className="empty-state card-empty">{t("admin.users.noUsers")}</p>
        ) : (
          <table className="admin-panel-table admin-panel-table--users">
            <thead>
              <tr>
                <th>{t("admin.users.colName")}</th>
                <th>{t("admin.users.colEmail")}</th>
                <th>{t("admin.users.colRole")}</th>
                <th>{t("admin.users.colCreatedAt")}</th>
                <th>{t("admin.users.colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isEditing =
                  editingUser != null && Number(editingUser.id) === Number(user.id);

                if (isEditing) {
                  return (
                    <tr key={`edit-${user.id}`} className="admin-user-edit-table-row">
                      <td colSpan={5}>{renderInlineEditForm()}</td>
                    </tr>
                  );
                }

                return (
                  <tr key={user.id}>
                    <td className="admin-panel-table__name">{user.username}</td>
                    <td>{user.email}</td>
                    <td className={roleTextClass(user.role)}>{roleLabel(user.role, t)}</td>
                    <td className="admin-panel-table__muted">
                      {formatCreatedAt(user.created_at)}
                    </td>
                    <td>
                      <div className="admin-panel-table__actions admin-panel-table__actions--icons">
                        <button
                          type="button"
                          className="admin-panel-icon-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openEdit(user);
                          }}
                          title={t("admin.users.edit")}
                          aria-label={t("admin.users.edit")}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="admin-panel-icon-btn admin-panel-icon-btn--danger"
                          onClick={() => setUserToDelete(user)}
                          title={t("admin.users.delete")}
                          aria-label={t("admin.users.delete")}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(userToDelete)}
        title={t("admin.users.deleteConfirmTitle")}
        message={
          userToDelete
            ? t("admin.users.deleteConfirmMessage", {
                name: userToDelete.username || "—",
                email: userToDelete.email || "—",
              })
            : ""
        }
        confirmLabel={deleteLoading ? t("admin.users.deleting") : t("admin.users.deleteConfirmAction")}
        cancelLabel={t("admin.users.cancel")}
        onConfirm={confirmDeleteUser}
        onCancel={() => !deleteLoading && setUserToDelete(null)}
        loading={deleteLoading}
      />

      {showAddModal && (
        <div
          className="modal-overlay modal-overlay--no-dim"
          role="presentation"
          onMouseDown={(e) => e.target === e.currentTarget && closeAddModal()}
        >
          <div className="modal-panel" role="dialog" aria-labelledby="add-user-title">
            <h3 id="add-user-title" className="modal-panel__title">
              {t("admin.users.addTitle")}
            </h3>
            <p className="modal-panel__subtitle">{t("admin.users.addSubtitle")}</p>

            {formError && (
              <div className="form-banner form-banner--error" role="alert">
                {formError}
              </div>
            )}

            <form className="modal-form" onSubmit={handleAddUser}>
              <div className="form-field">
                <label htmlFor="add-username">{t("admin.users.username")}</label>
                <input
                  id="add-username"
                  className="form-input modal-form-input"
                  autoComplete="name"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                />
                {fieldErrors.username && (
                  <span className="auth-error-text">{fieldErrors.username}</span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="add-email">{t("admin.users.email")}</label>
                <input
                  id="add-email"
                  className="form-input modal-form-input"
                  type="email"
                  autoComplete="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
                {fieldErrors.email && <span className="auth-error-text">{fieldErrors.email}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="add-password">{t("admin.users.password")}</label>
                <div className="modal-password-wrapper">
                  <input
                    id="add-password"
                    className="form-input modal-form-input modal-form-input--with-eye"
                    type={showAddPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="modal-password-eye"
                    onClick={() => setShowAddPassword((v) => !v)}
                    aria-label={showAddPassword ? t("passwords.hide") : t("passwords.show")}
                  >
                    {renderPasswordEye(showAddPassword)}
                  </button>
                </div>
                {fieldErrors.password && (
                  <span className="auth-error-text">{fieldErrors.password}</span>
                )}
              </div>

              <div className="form-field">
                <span className="modal-form-label">{t("admin.users.roleLabel")}</span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setNewUser({ ...newUser, role: "utilisateur" })}
                    style={roleBtnStyle(newUser.role === "utilisateur", "user")}
                  >
                    {t("admin.users.userRole")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewUser({ ...newUser, role: "admin" })}
                    style={roleBtnStyle(newUser.role === "admin", "admin")}
                  >
                    {t("admin.users.administrator")}
                  </button>
                </div>
                {fieldErrors.role && <span className="auth-error-text">{fieldErrors.role}</span>}
              </div>

              <div className="modal-form-actions">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="auth-button secondary"
                  style={{ flex: 1 }}
                  disabled={submitLoading}
                >
                  {t("admin.users.cancel")}
                </button>
                <button
                  type="submit"
                  className="auth-button primary"
                  style={{ flex: 1 }}
                  disabled={submitLoading}
                >
                  {submitLoading ? t("admin.users.creating") : t("admin.users.create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
