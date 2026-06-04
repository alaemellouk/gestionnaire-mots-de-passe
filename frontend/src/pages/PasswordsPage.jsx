import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/axios";
import { useSettings } from "../contexts/SettingsContext";
import { useVaultSearch } from "../contexts/VaultSearchContext";
import { getCategoryBadgeTheme } from "../utils/categoryColors";
import {
  mapApiPolicyToRules,
  defaultPolicyRules,
  validateVaultPassword,
  formatPolicyViolationsFromApi,
} from "../lib/securityPolicy";
import { generatePasswordFromPolicy } from "../lib/generatePassword";
import { Eye, EyeOff, Copy, Trash2, Pencil } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog";
import Toast from "../components/Toast";
import PasswordEntryForm, { EMPTY_PASSWORD_FORM } from "../components/PasswordEntryForm";
import {
  extractArray,
  extractPlainPassword,
  maskPassword,
  normalizePassword,
  passwordItemId,
  buildVaultPasswordBody,
} from "../utils/passwordVault";

export default function PasswordsPage() {
  const { t, theme } = useSettings();
  const { query } = useVaultSearch();
  const location = useLocation();
  const isLightTheme = theme === "light";
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [revealedIds, setRevealedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", visible: false, type: "success" });
  const [formData, setFormData] = useState(EMPTY_PASSWORD_FORM);
  const [policyRules, setPolicyRules] = useState(() => defaultPolicyRules());
  const [policyViolations, setPolicyViolations] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [passwordToDelete, setPasswordToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editingPassword, setEditingPassword] = useState(null);
  const [openingEditId, setOpeningEditId] = useState(null);

  useEffect(() => {
    const state = location.state;
    if (!state) return;

    const id = state.categoryId ?? state.category_id;
    const name = state.categoryName ?? state.category;

    if (id != null && id !== "") {
      setCategoryFilter({
        id: Number(id),
        name: typeof name === "string" ? name : "",
      });
      return;
    }

    if (typeof name === "string" && name.trim()) {
      setCategoryFilter({ id: null, name: name.trim() });
    }
  }, [location.state]);

  useEffect(() => {
    if (categoryFilter?.id != null) {
      setFormData((prev) => ({
        ...prev,
        category_id: String(categoryFilter.id),
      }));
    }
  }, [categoryFilter]);

  useEffect(() => {
    if (!categoryFilter?.id || categoryFilter.name) return;
    const found = categories.find((c) => Number(c.id) === Number(categoryFilter.id));
    if (!found) return;
    const resolved = found.nom || found.name || "";
    if (resolved) {
      setCategoryFilter((prev) => (prev ? { ...prev, name: resolved } : prev));
    }
  }, [categories, categoryFilter]);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, visible: true, type });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 2500);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [passResponse, catResponse] = await Promise.all([
        api.get("/passwords"),
        api.get("/categories"),
      ]);

      const rawPasswords = extractArray(passResponse.data);
      const rawCategories = extractArray(catResponse.data);

      setItems(rawPasswords.map((row) => normalizePassword(row, t("passwords.uncategorized"))));
      setCategories(rawCategories);
    } catch (error) {
      const message = error?.response?.data?.message || t("passwords.loadError");
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formOpen = showCreateForm || Boolean(editingPassword);

  useEffect(() => {
    if (!formOpen) return undefined;

    let cancelled = false;
    (async () => {
      try {
        const response = await api.get("/security-policy");
        if (!cancelled && response?.data) {
          setPolicyRules(mapApiPolicyToRules(response.data));
        }
      } catch {
        if (!cancelled) setPolicyRules(defaultPolicyRules());
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [formOpen]);

  const enrichedItems = useMemo(() => {
    return items.map((item) => {
      let catName = item.category;
      if (item.categoryId) {
        const found = categories.find((c) => c.id === item.categoryId);
        if (found) {
          catName = found.nom || found.name || catName;
        }
      }
      return { ...item, displayCategory: catName };
    });
  }, [items, categories]);

  const filteredItems = useMemo(() => {
    let list = enrichedItems;

    if (categoryFilter) {
      list = list.filter((item) => {
        if (categoryFilter.id != null) {
          return Number(item.categoryId) === Number(categoryFilter.id);
        }
        const label = (item.displayCategory || item.category || "").trim().toLowerCase();
        return label === categoryFilter.name.trim().toLowerCase();
      });
    }

    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((item) => {
      const parts = [item.site, item.login, item.displayCategory];
      const pwd = String(item.password ?? "");
      if (pwd && !/^•+$/.test(pwd)) {
        parts.push(pwd);
      }
      return parts.join(" ").toLowerCase().includes(q);
    });
  }, [enrichedItems, query, categoryFilter]);

  const loadPlainPassword = useCallback(
    async (id) => {
      const pid = passwordItemId(id);
      const existing = items.find((entry) => passwordItemId(entry.id) === pid);
      const cached = String(existing?.password ?? "").trim();
      if (cached && !/^•+$/.test(cached)) {
        return cached;
      }

      const response = await api.get(`/passwords/${id}`);
      const plain = extractPlainPassword(response.data);
      if (!plain) return "";

      setItems((previous) =>
        previous.map((entry) =>
          passwordItemId(entry.id) === pid ? { ...entry, password: plain } : entry,
        ),
      );
      return plain;
    },
    [items],
  );

  const toggleVisibility = async (id) => {
    const pid = passwordItemId(id);

    if (revealedIds.has(pid)) {
      setRevealedIds((previous) => {
        const next = new Set(previous);
        next.delete(pid);
        return next;
      });
      return;
    }

    try {
      const plain = await loadPlainPassword(id);
      if (!plain) {
        showToast(t("passwords.revealError"), "error");
        return;
      }
      setRevealedIds((previous) => new Set(previous).add(pid));
    } catch (error) {
      showToast(error?.response?.data?.message || t("passwords.revealError"), "error");
    }
  };

  const copyPassword = async (id) => {
    try {
      const plain = await loadPlainPassword(id);
      if (!plain) {
        showToast(t("passwords.revealError"), "error");
        return;
      }
      await navigator.clipboard.writeText(plain);
      showToast(t("passwords.copied"));
    } catch {
      showToast(t("passwords.copyError"), "error");
    }
  };

  const confirmDeletePassword = async () => {
    if (!passwordToDelete) return;
    const id = passwordToDelete.id;
    const previousItems = items;
    setDeleteLoading(true);
    setItems((prev) => prev.filter((item) => item.id !== id));

    try {
      await api.delete(`/passwords/${id}`);
      setPasswordToDelete(null);
      showToast(t("passwords.deleted"));
    } catch (error) {
      setItems(previousItems);
      showToast(error?.response?.data?.message || t("passwords.deleteError"), "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const generatePolicyPassword = useCallback(() => {
    return generatePasswordFromPolicy(policyRules, {
      length: policyRules.minLength,
      includeUppercase: policyRules.requireUppercase,
      includeNumbers: policyRules.requireDigits,
      includeSymbols: policyRules.requireSpecial,
    });
  }, [policyRules]);

  const patchCreateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const patchEditForm = (field, value) => {
    setEditingPassword((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const startEditPassword = async (item) => {
    setShowCreateForm(false);
    setPolicyViolations([]);
    setOpeningEditId(item.id);
    try {
      const plain = await loadPlainPassword(item.id);
      setEditingPassword({
        id: item.id,
        site: item.site ?? "",
        login: item.login ?? "",
        password: plain || "",
        category_id: item.categoryId != null ? String(item.categoryId) : "",
      });
    } catch (error) {
      showToast(error?.response?.data?.message || t("passwords.revealError"), "error");
    } finally {
      setOpeningEditId(null);
    }
  };

  const handleApiFormError = (error) => {
    if (error?.response?.status === 422 && error?.response?.data) {
      setPolicyViolations(formatPolicyViolationsFromApi(error.response.data, t));
    }
  };

  const updatePassword = async (event) => {
    event.preventDefault();
    if (!editingPassword) return;
    setPolicyViolations([]);

    const pwd = String(editingPassword.password ?? "").trim();
    if (pwd) {
      const check = validateVaultPassword(pwd, policyRules, t);
      if (!check.valid) {
        setPolicyViolations(check.messages);
        return;
      }
    }

    setSubmitting(true);
    try {
      await api.put(
        `/passwords/${editingPassword.id}`,
        buildVaultPasswordBody(editingPassword),
      );
      setEditingPassword(null);
      showToast(t("passwords.updated"));
      await loadData();
    } catch (error) {
      handleApiFormError(error);
      if (error?.response?.status !== 422) {
        showToast(error?.response?.data?.message || t("passwords.updateError"), "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const createPassword = async (event) => {
    event.preventDefault();
    setPolicyViolations([]);

    const check = validateVaultPassword(formData.password, policyRules, t);
    if (!check.valid) {
      setPolicyViolations(check.messages);
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/passwords", buildVaultPasswordBody(formData));
      setFormData(EMPTY_PASSWORD_FORM);
      setShowCreateForm(false);
      showToast(t("passwords.saved"));
      await loadData();
    } catch (error) {
      handleApiFormError(error);
      if (error?.response?.status !== 422) {
        showToast(error?.response?.data?.message || t("passwords.createError"), "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const closeForms = () => {
    setEditingPassword(null);
    setPolicyViolations([]);
  };

  return (
    <section className="vault-page">
      <Toast message={toast.message} visible={toast.visible} type={toast.type} />

      <section className="top-toolbar fixed-toolbar fixed-toolbar--passwords">
        <div className="toolbar-actions toolbar-actions--end">
          <button
            type="button"
            className="add-btn"
            onClick={() => {
              closeForms();
              setShowCreateForm((value) => !value);
            }}
            title={t("passwords.addTitle")}
          >
            {showCreateForm ? "✕" : "+"}
          </button>
        </div>
      </section>

      {editingPassword && (
        <PasswordEntryForm
          idPrefix="pw-edit"
          heading={t("passwords.editFormTitle")}
          values={editingPassword}
          onFieldChange={patchEditForm}
          onSubmit={updatePassword}
          onCancel={() => setEditingPassword(null)}
          categories={categories}
          policyViolations={policyViolations}
          onClearPolicyViolations={() => setPolicyViolations([])}
          onGenerate={() => {
            setPolicyViolations([]);
            patchEditForm("password", generatePolicyPassword());
          }}
          submitting={submitting}
          submitLabel={t("passwords.saveChanges")}
          submittingLabel={t("passwords.updating")}
          passwordRequired={false}
          passwordPlaceholder={t("passwords.formPasswordKeepPh")}
          t={t}
        />
      )}

      {showCreateForm && (
        <PasswordEntryForm
          idPrefix="pw"
          values={formData}
          onFieldChange={patchCreateForm}
          onSubmit={createPassword}
          categories={categories}
          policyViolations={policyViolations}
          onClearPolicyViolations={() => setPolicyViolations([])}
          onGenerate={() => {
            setPolicyViolations([]);
            patchCreateForm("password", generatePolicyPassword());
          }}
          submitting={submitting}
          submitLabel={t("passwords.save")}
          submittingLabel={t("passwords.saving")}
          passwordPlaceholder={t("passwords.formPasswordPh")}
          t={t}
        />
      )}

      <div className="password-list">
        {loading ? (
          <p className="empty-state">{t("passwords.loading")}</p>
        ) : filteredItems.length === 0 ? (
          <p className="empty-state card-empty">
            {categoryFilter ? t("passwords.emptyInCategory") : t("passwords.empty")}
          </p>
        ) : (
          filteredItems.map((item) => {
            const isVisible = revealedIds.has(passwordItemId(item.id));
            const badgeTone = getCategoryBadgeTheme(item.categoryId, isLightTheme);
            return (
              <article className="password-card" key={item.id}>
                <div className="password-main">
                  <strong>{item.site}</strong>
                  <span>{item.login}</span>
                  <small
                    className="category-badge"
                    style={{
                      background: badgeTone.soft,
                      border: `1px solid ${badgeTone.border}`,
                      color: badgeTone.badgeText,
                    }}
                  >
                    {item.displayCategory}
                  </small>
                </div>

                <div className="password-secret">
                  <code>{isVisible ? item.password : maskPassword(item.password)}</code>
                </div>

                <div className="password-actions">
                  <button
                    type="button"
                    className="password-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      void toggleVisibility(item.id);
                    }}
                    title={isVisible ? t("passwords.hide") : t("passwords.show")}
                    aria-label={isVisible ? t("passwords.hide") : t("passwords.show")}
                  >
                    {isVisible ? (
                      <EyeOff size={16} strokeWidth={2} aria-hidden />
                    ) : (
                      <Eye size={16} strokeWidth={2} aria-hidden />
                    )}
                  </button>
                  <button
                    type="button"
                    className="password-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      void copyPassword(item.id);
                    }}
                    title={t("passwords.copy")}
                    aria-label={t("passwords.copy")}
                  >
                    <Copy size={16} strokeWidth={2} aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="password-action-btn password-action-btn--edit"
                    disabled={openingEditId === item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      void startEditPassword(item);
                    }}
                    title={t("passwords.editTitle")}
                    aria-label={t("passwords.editTitle")}
                  >
                    <Pencil size={16} strokeWidth={2} aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="password-action-btn password-action-btn--danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPasswordToDelete(item);
                    }}
                    title={t("passwords.delete")}
                    aria-label={t("passwords.delete")}
                  >
                    <Trash2 size={16} strokeWidth={2} aria-hidden />
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>

      <ConfirmDialog
        open={Boolean(passwordToDelete)}
        title={t("passwords.deleteConfirmTitle")}
        message={
          passwordToDelete
            ? t("passwords.deleteConfirmMessage", {
                site: passwordToDelete.site || "—",
                login: passwordToDelete.login || "—",
              })
            : ""
        }
        confirmLabel={
          deleteLoading ? t("passwords.deleting") : t("passwords.deleteConfirmAction")
        }
        cancelLabel={t("passwords.cancel")}
        onConfirm={confirmDeletePassword}
        onCancel={() => !deleteLoading && setPasswordToDelete(null)}
        loading={deleteLoading}
      />
    </section>
  );
}
