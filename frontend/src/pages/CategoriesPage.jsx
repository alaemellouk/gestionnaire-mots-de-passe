import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import ConfirmDialog from "../components/ConfirmDialog";
import Toast from "../components/Toast";
import { useSettings } from "../contexts/SettingsContext";
import { getCategoryTheme } from "../utils/categoryColors";
import { extractArray } from "../utils/passwordVault";

export default function CategoriesPage() {
  const { t } = useSettings();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [toast, setToast] = useState({ message: "", visible: false, type: "success" });
  
  const navigate = useNavigate();

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, visible: true, type });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 2500);
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const catResponse = await api.get("/categories");
      const rawCats = extractArray(catResponse.data);

      setCategories(
        rawCats.map((item) => {
          const catName = item.nom || item.name || t("categories.unnamed");
          const count =
            item.password_count ??
            item.mots_de_passe_count ??
            item.count ??
            0;
          return {
            id: item.id,
            name: catName,
            count: Number(count) || 0,
          };
        }),
      );
    } catch {
      showToast(t("categories.loadError"), "error");
    } finally {
      setLoading(false);
    }
  }, [showToast, t]);

  const createCategory = async (name) => {
    if (!name.trim()) {
      setIsAdding(false);
      return;
    }
    setCreating(true);

    try {
      await api.post("/categories", {
        nom: name.trim(),
      });
      showToast(t("categories.added"));
      await loadCategories();
      setNewCategoryName("");
      setIsAdding(false);
    } catch (error) {
      showToast(error?.response?.data?.message || t("categories.addError"), "error");
    } finally {
      setCreating(false);
    }
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/categories/${categoryToDelete.id}`);
      showToast(t("categories.deleted"));
      setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
      setCategoryToDelete(null);
    } catch {
      showToast(t("categories.deleteError"), "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const startEditing = (category, e) => {
    e.stopPropagation();
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const updateCategory = async () => {
    if (!editingName.trim()) {
      setEditingId(null);
      return;
    }
    try {
      await api.put(`/categories/${editingId}`, { nom: editingName.trim() });
      showToast(t("categories.updated"));
      setCategories(prev => prev.map(c => c.id === editingId ? { ...c, name: editingName.trim() } : c));
    } catch (error) {
      showToast(t("categories.updateError"), "error");
    } finally {
      setEditingId(null);
    }
  };

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  return (
    <section className="categories-page">
      <Toast message={toast.message} visible={toast.visible} type={toast.type} />
      
      <header className="page-header">
        <div>
          <h2>{t("categories.title")}</h2>
          <p className="subtitle">{t("categories.subtitle")}</p>
        </div>
      </header>

      <div className="categories-grid">
        {categories.map((category, catIndex) => {
          const tone = getCategoryTheme(category.id);
          return (
          <article 
            className={`category-card ${editingId === category.id ? 'editing' : ''}`} 
            key={category.id} 
            onClick={() =>
              editingId !== category.id &&
              navigate("/passwords", {
                state: { categoryId: category.id, categoryName: category.name },
              })
            }
            style={{
              '--category-glow': tone.glow,
              '--category-border-strong': tone.border,
              animationDelay: `${Math.min(catIndex, 8) * 0.04}s`,
              borderColor: tone.border,
              background: `linear-gradient(145deg, ${tone.soft} 0%, var(--surface-color) 52%)`,
            }}
          >
            {editingId === category.id ? (
              <input
                autoFocus
                className="edit-category-input"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onBlur={updateCategory}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') updateCategory();
                  if (e.key === 'Escape') setEditingId(null);
                }}
              />
            ) : (
              <>
                <div className="category-info">
                  <strong>{category.name}</strong>
                  <span>{t("categories.items", { count: category.count })}</span>
                </div>
                <div className="category-actions">
                  <button className="icon-btn" onClick={(e) => startEditing(category, e)} title={t("categories.editTitle")}>✎</button>
                  <button
                    className="icon-btn delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCategoryToDelete(category);
                    }}
                    title={t("categories.deleteTitle")}
                  >
                    🗑
                  </button>
                </div>
              </>
            )}
          </article>
          );
        })}

        {isAdding ? (
          <article className="category-card add-category-card expanded">
            <input
              autoFocus
              type="text"
              className="add-category-input"
              placeholder={t("categories.addPlaceholder")}
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === 'Enter') await createCategory(newCategoryName);
                if (e.key === 'Escape') setIsAdding(false);
              }}
              onBlur={() => !creating && !newCategoryName.trim() && setIsAdding(false)}
              disabled={creating}
            />
          </article>
        ) : (
          <article 
            className="category-card add-category-card" 
            onClick={() => setIsAdding(true)}
          >
            <strong>{t("categories.addButton")}</strong>
          </article>
        )}
      </div>

      {loading && categories.length === 0 && (
        <div className="loading-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="category-card skeleton-card" style={{ height: "80px" }} />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(categoryToDelete)}
        title={t("categories.deleteConfirmTitle")}
        message={
          categoryToDelete
            ? t("categories.deleteConfirmMessage", { name: categoryToDelete.name })
            : ""
        }
        confirmLabel={
          deleteLoading ? t("categories.deleting") : t("categories.deleteConfirmAction")
        }
        cancelLabel={t("categories.cancel")}
        onConfirm={confirmDeleteCategory}
        onCancel={() => !deleteLoading && setCategoryToDelete(null)}
        loading={deleteLoading}
      />
    </section>
  );
}

