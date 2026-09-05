"use client";

import React, { useState, useEffect } from "react";
import {
  Pencil,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  X,
  Sparkles,
  SlidersHorizontal,
  RotateCw,
} from "lucide-react";
import { getCategories, updateCategory, createCategory } from "../../../lib/api";
import { Category } from "../../../lib/types";
import {
  AVAILABLE_CATEGORY_ICONS,
  COLOR_PRESETS,
  getCategoryIconMeta,
} from "../../../lib/categoryIcons";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIcon, setFormIcon] = useState("Cake");
  const [formColor, setFormColor] = useState("#FAF6F0");
  const [formAccent, setFormAccent] = useState("#B88E3E");
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [formActive, setFormActive] = useState(true);

  const fetchCats = async () => {
    setLoading(true);
    try {
      const list = await getCategories(true);
      setCategories(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setIsCreatingNew(false);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDescription(cat.description || "");
    setFormIcon(cat.icon || "Cake");
    const meta = getCategoryIconMeta(cat.icon);
    setFormColor(cat.color || meta.color);
    setFormAccent(cat.accent || meta.accent);
    setFormSortOrder(cat.sort_order || 0);
    setFormActive(cat.active !== false);
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setIsCreatingNew(true);
    setFormName("");
    setFormSlug("");
    setFormDescription("");
    setFormIcon("Cake");
    setFormColor("#FAF6F0");
    setFormAccent("#B88E3E");
    setFormSortOrder(categories.length + 1);
    setFormActive(true);
  };

  const closeModal = () => {
    setEditingCategory(null);
    setIsCreatingNew(false);
  };

  const handleSelectPreset = (preset: { color: string; accent: string }) => {
    setFormColor(preset.color);
    setFormAccent(preset.accent);
  };

  const handleSelectIcon = (iconKey: string) => {
    setFormIcon(iconKey);
    const meta = getCategoryIconMeta(iconKey);
    // If current colors are default, also adopt the icon's default palette
    if (formColor === "#FAF6F0" && formAccent === "#B88E3E") {
      setFormColor(meta.color);
      setFormAccent(meta.accent);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setIsSaving(true);
    setStatusMessage(null);

    try {
      if (isCreatingNew) {
        const created = await createCategory({
          name: formName.trim(),
          slug: formSlug.trim() || undefined,
          description: formDescription.trim(),
          icon: formIcon,
          color: formColor,
          accent: formAccent,
          sort_order: formSortOrder,
          active: formActive,
        });

        if (created) {
          setStatusMessage(`Category "${created.name}" created successfully with icon "${formIcon}"!`);
          closeModal();
          fetchCats();
        } else {
          setStatusMessage("Failed to create category. Please verify name and slug.");
        }
      } else if (editingCategory) {
        const updated = await updateCategory(editingCategory.id, {
          name: formName.trim(),
          slug: formSlug.trim() || undefined,
          description: formDescription.trim(),
          icon: formIcon,
          color: formColor,
          accent: formAccent,
          sort_order: formSortOrder,
          active: formActive,
        });

        if (updated) {
          setStatusMessage(`Category "${updated.name}" updated! Icon changed to "${formIcon}".`);
          closeModal();
          fetchCats();
        } else {
          setStatusMessage("Failed to update category. Please try again.");
        }
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Error: ${err.message || "Failed to save category"}`);
    } finally {
      setIsSaving(false);
    }
  };

  const currentPreviewMeta = getCategoryIconMeta(formIcon);
  const PreviewIcon = currentPreviewMeta.icon;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* 1. Header Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.25rem",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div>
          <span className="cake-category-badge">Category Taxonomy & Icon Atelier</span>
          <h1
            style={{
              fontSize: "1.45rem",
              color: "var(--text-primary)",
              fontWeight: 700,
              marginTop: "0.2rem",
            }}
          >
            Boutique Collections & Icons ({categories.length})
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>
            Configure showcase categories, assign modern Lucide visual icons, and tailor luxury pastel palettes.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={fetchCats}
            className="btn-outline-gold icon-hover-rotate"
            style={{ padding: "0.45rem 0.8rem", fontSize: "0.8rem" }}
            title="Refresh categories"
          >
            <RotateCw size={13} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="btn-gold icon-hover-lift"
            style={{ padding: "0.45rem 0.95rem", fontSize: "0.8rem" }}
            id="admin-create-category-btn"
          >
            <Plus size={14} />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Status Feedback Toast */}
      {statusMessage && (
        <div
          style={{
            background: "#ECFDF5",
            border: "1px solid #A7F3D0",
            color: "#065F46",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.84rem",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CheckCircle2 size={16} />
            <span>{statusMessage}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            style={{ background: "none", border: "none", color: "#065F46", cursor: "pointer" }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* 2. Category Cards Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Loading category collections...
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1rem",
          }}
          id="admin-categories-grid"
        >
          {categories.map((cat) => {
            const meta = getCategoryIconMeta(cat.icon);
            const IconComp = meta.icon;
            const bgColor = cat.color || meta.color;
            const accentColor = cat.accent || meta.accent;

            return (
              <div
                key={cat.id}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "1.25rem",
                  boxShadow: "var(--shadow-xs)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                className="admin-category-card"
                id={`admin-category-${cat.slug}`}
              >
                <div>
                  {/* Top Bar: Icon Avatar & Slug */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "0.85rem",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: bgColor,
                        border: `1px solid var(--border-subtle)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: accentColor,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                      }}
                      title={`Icon: ${cat.icon || "Cake"}`}
                    >
                      <IconComp size={24} strokeWidth={1.75} />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          background: cat.active ? "#ECFDF5" : "#F3F4F6",
                          color: cat.active ? "#059669" : "#6B7280",
                          padding: "0.15rem 0.5rem",
                          borderRadius: "var(--radius-full)",
                          fontWeight: 600,
                          marginBottom: "0.2rem",
                        }}
                      >
                        {cat.active ? "● Active" : "○ Inactive"}
                      </span>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-mono, monospace)",
                        }}
                      >
                        /{cat.slug}
                      </span>
                    </div>
                  </div>

                  {/* Category Name & Icon Tag */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.25rem" }}>
                    <h3
                      style={{
                        fontSize: "1.08rem",
                        color: "var(--text-primary)",
                        fontWeight: 700,
                        margin: 0,
                      }}
                    >
                      {cat.name}
                    </h3>
                  </div>

                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      fontSize: "0.72rem",
                      background: "var(--bg-cream)",
                      color: "var(--gold-dark)",
                      padding: "0.15rem 0.45rem",
                      borderRadius: "var(--radius-xs)",
                      marginBottom: "0.65rem",
                      fontWeight: 600,
                    }}
                  >
                    <span>Icon: {cat.icon || "Cake"}</span>
                  </div>

                  {/* Description */}
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.8rem",
                      lineHeight: "1.45",
                      marginBottom: "1rem",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {cat.description || "Artisanal signature creation."}
                  </p>
                </div>

                {/* Card Footer Actions */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid var(--border-light)",
                    paddingTop: "0.75rem",
                    gap: "0.5rem",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => openEditModal(cat)}
                    className="btn-outline-gold icon-hover-lift"
                    style={{
                      padding: "0.35rem 0.75rem",
                      fontSize: "0.75rem",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                    id={`btn-edit-cat-${cat.slug}`}
                  >
                    <Pencil size={12} />
                    <span>Change Icon & Edit</span>
                  </button>

                  <a
                    href={`/category/${cat.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.2rem",
                      fontWeight: 600,
                    }}
                    className="hover-gold"
                  >
                    <span>Live Page</span>
                    <ArrowUpRight size={12} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Change Icon & Category Modal */}
      {(editingCategory || isCreatingNew) && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(26, 22, 18, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-lg)",
              width: "100%",
              maxWidth: "580px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "var(--shadow-lg)",
              border: "1px solid var(--gold-border)",
            }}
            onClick={(e) => e.stopPropagation()}
            id="category-edit-modal"
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "1rem 1.25rem",
                borderBottom: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "var(--bg-cream)",
                borderTopLeftRadius: "var(--radius-lg)",
                borderTopRightRadius: "var(--radius-lg)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                <Sparkles size={16} style={{ color: "var(--gold)" }} />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                  {isCreatingNew ? "Create New Boutique Category" : `Edit Icon & Details: ${formName}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  padding: "4px",
                }}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} style={{ padding: "1.25rem" }}>
              {/* LIVE PREVIEW BANNER */}
              <div
                style={{
                  background: "var(--bg-main)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.85rem 1rem",
                  marginBottom: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--gold-dark)",
                      fontWeight: 700,
                    }}
                  >
                    Storefront Live Preview
                  </span>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                    How this category will appear on the public header and filter bar
                  </div>
                </div>

                {/* Preview Chip */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "50%",
                      background: formColor,
                      border: "1.5px solid var(--gold)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: formAccent,
                      boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <PreviewIcon size={26} strokeWidth={1.75} />
                  </div>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    {formName || "Category Name"}
                  </span>
                </div>
              </div>

              {/* SECTION: CHOOSE MODERN LUCIDE ICON */}
              <div style={{ marginBottom: "1.25rem" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    fontSize: "0.84rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: "0.45rem",
                  }}
                >
                  <SlidersHorizontal size={13} style={{ color: "var(--gold-dark)" }} />
                  <span>Select Category Icon (16 Professional Lucide Icons)</span>
                </label>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "0.5rem",
                  }}
                  id="icon-picker-grid"
                >
                  {Object.values(AVAILABLE_CATEGORY_ICONS).map((meta) => {
                    const IconComp = meta.icon;
                    const isSelected = formIcon === meta.key;

                    return (
                      <button
                        key={meta.key}
                        type="button"
                        onClick={() => handleSelectIcon(meta.key)}
                        style={{
                          background: isSelected ? meta.color : "var(--bg-main)",
                          border: isSelected
                            ? `2px solid var(--gold)`
                            : "1px solid var(--border-subtle)",
                          borderRadius: "var(--radius-sm)",
                          padding: "0.5rem 0.35rem",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "0.3rem",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          outline: "none",
                        }}
                        className="icon-hover-lift"
                        title={meta.label}
                        id={`icon-option-${meta.key}`}
                      >
                        <div
                          style={{
                            color: isSelected ? meta.accent : "var(--text-secondary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <IconComp size={22} strokeWidth={isSelected ? 2 : 1.75} />
                        </div>
                        <span
                          style={{
                            fontSize: "0.68rem",
                            color: isSelected ? "var(--text-primary)" : "var(--text-muted)",
                            fontWeight: isSelected ? 700 : 500,
                            textAlign: "center",
                            lineHeight: 1.15,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            width: "100%",
                          }}
                        >
                          {meta.label.split(" ")[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION: COLOR PALETTE PRESETS */}
              <div style={{ marginBottom: "1.25rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: "0.45rem",
                  }}
                >
                  Luxury Color Palette Presets
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {COLOR_PRESETS.map((preset) => {
                    const isSelected = formColor === preset.color && formAccent === preset.accent;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        style={{
                          background: preset.color,
                          border: isSelected ? `2px solid ${preset.accent}` : "1px solid var(--border-subtle)",
                          borderRadius: "var(--radius-full)",
                          padding: "0.25rem 0.65rem",
                          fontSize: "0.72rem",
                          color: preset.accent,
                          fontWeight: isSelected ? 700 : 600,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                        }}
                      >
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: preset.accent,
                          }}
                        />
                        <span>{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION: CATEGORY DETAILS */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.85rem" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "0.78rem" }}>Category Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="form-input"
                    placeholder="e.g. Bespoke Birthday"
                    style={{ padding: "0.45rem 0.75rem", fontSize: "0.82rem" }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: "0.78rem" }}>URL Slug (auto-generated if empty)</label>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="form-input"
                    placeholder="e.g. bespoke-birthday"
                    style={{ padding: "0.45rem 0.75rem", fontSize: "0.82rem" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "0.85rem" }}>
                <label className="form-label" style={{ fontSize: "0.78rem" }}>Collection Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="form-textarea"
                  placeholder="Artisanal description displayed on boutique catalog headers..."
                  style={{ padding: "0.45rem 0.75rem", fontSize: "0.82rem" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "0.78rem" }}>Display Order (Sort Index)</label>
                  <input
                    type="number"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(Number(e.target.value))}
                    className="form-input"
                    style={{ padding: "0.45rem 0.75rem", fontSize: "0.82rem" }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: "0.78rem" }}>Active Visibility</label>
                  <div style={{ marginTop: "0.5rem" }}>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.82rem" }}>
                      <input
                        type="checkbox"
                        checked={formActive}
                        onChange={(e) => setFormActive(e.target.checked)}
                      />
                      <span>Visible in Public Navigation</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.6rem",
                  borderTop: "1px solid var(--border-subtle)",
                  paddingTop: "1rem",
                }}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-outline-gold"
                  style={{ padding: "0.45rem 1rem", fontSize: "0.82rem" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-gold icon-hover-lift"
                  style={{ padding: "0.45rem 1.25rem", fontSize: "0.82rem" }}
                  id="save-category-btn"
                >
                  {isSaving ? "Saving Changes..." : isCreatingNew ? "Create Category" : "Save Icon & Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
