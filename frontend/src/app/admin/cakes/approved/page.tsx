"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getAdminCakes, getCategories, publishCake, unpublishCake, rejectCake, updateCakeDetails } from "../../../../lib/api";
import { Cake, Category } from "../../../../lib/types";
import { RotateCw, ArrowUpRight, CheckCircle2, Sparkles, Undo2, Send, ArchiveX, Edit3, X, Plus } from "lucide-react";

export default function ApprovedCakesPage() {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterTab, setFilterTab] = useState<"all" | "approved" | "published">("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Edit Modal State
  const [editingCake, setEditingCake] = useState<Cake | null>(null);
  const [editForm, setEditForm] = useState<Partial<Cake>>({});
  const [newSizeInput, setNewSizeInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadApproved = async () => {
    setLoading(true);
    try {
      // getAdminCakes("approved") fetches both approved (staged) and published cakes
      const [data, cats] = await Promise.all([
        getAdminCakes("approved"),
        getCategories(),
      ]);
      setCakes(data);
      setCategories(cats);
    } catch (e: any) {
      console.error("Failed to load approved cakes:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApproved();
  }, []);

  const handlePublish = async (id: string, name: string) => {
    setActionLoading(id);
    try {
      await publishCake(id);
      setCakes((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "published" } : c))
      );
      setFeedback(`"${name}" published live to the public storefront!`);
      setTimeout(() => setFeedback(null), 3500);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnpublish = async (id: string, name: string) => {
    setActionLoading(id);
    try {
      await unpublishCake(id);
      setCakes((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "approved" } : c))
      );
      setFeedback(`"${name}" reverted back to staged approval.`);
      setTimeout(() => setFeedback(null), 3500);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Move this cake to the Rejected Archive?")) return;
    setActionLoading(id);
    try {
      await rejectCake(id);
      setCakes((prev) => prev.filter((c) => c.id !== id));
      setFeedback("Cake moved to Rejected Archive.");
      setTimeout(() => setFeedback(null), 3500);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const startEdit = (cake: Cake) => {
    setEditingCake(cake);
    setEditForm({
      name: cake.name,
      flavour: cake.flavour,
      category_id: cake.category_id || (categories[0]?.id || ""),
      description: cake.description,
      available_sizes: cake.available_sizes ? [...cake.available_sizes] : ["0.5 kg (Small)", "1.0 kg (Medium)", "2.0 kg (Large)"],
      status: cake.status,
      image_url: cake.image_url,
    });
    setNewSizeInput("");
  };

  const cancelEdit = () => {
    setEditingCake(null);
    setEditForm({});
    setNewSizeInput("");
  };

  const addSize = () => {
    const trimmed = newSizeInput.trim();
    if (!trimmed) return;
    setEditForm((prev) => ({
      ...prev,
      available_sizes: [...(prev.available_sizes || []), trimmed],
    }));
    setNewSizeInput("");
  };

  const removeSize = (idx: number) => {
    setEditForm((prev) => ({
      ...prev,
      available_sizes: prev.available_sizes?.filter((_, i) => i !== idx),
    }));
  };

  const saveEdit = async () => {
    if (!editingCake) return;
    setIsSaving(true);
    try {
      const updated = await updateCakeDetails(editingCake.id, editForm);
      // Update local state
      const matchedCat = categories.find((c) => c.id === updated.category_id);
      const enriched = {
        ...updated,
        category_name: matchedCat ? matchedCat.name : editingCake.category_name,
      };
      setCakes((prev) => prev.map((c) => (c.id === editingCake.id ? enriched : c)));
      setFeedback(`"${enriched.name}" updated successfully!`);
      setEditingCake(null);
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      alert(err.message || "Failed to save cake updates.");
    } finally {
      setIsSaving(false);
    }
  };

  const stagedCakes = cakes.filter((c) => c.status === "approved");
  const publishedCakes = cakes.filter((c) => c.status === "published");

  const displayedCakes =
    filterTab === "approved"
      ? stagedCakes
      : filterTab === "published"
      ? publishedCakes
      : cakes;

  return (
    <div id="approved-cakes-view">
      {/* Header - Compact */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--gold-dark)",
                background: "var(--bg-cream)",
                padding: "0.15rem 0.5rem",
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              Curated Atelier
            </span>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              • Live & Staged Collections
            </span>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.45rem",
              color: "var(--text-primary)",
              fontWeight: 700,
              margin: "0.2rem 0 0",
              letterSpacing: "-0.01em",
            }}
          >
            Approved & Published ({cakes.length})
          </h1>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button
            onClick={loadApproved}
            disabled={loading}
            className="btn-outline-gold icon-hover-rotate"
            style={{ padding: "0.45rem 0.85rem", fontSize: "0.78rem" }}
            title="Refresh approved list"
          >
            <RotateCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
          <Link
            href="/admin/cakes/pending"
            className="btn-gold icon-hover-lift"
            style={{ padding: "0.45rem 0.95rem", fontSize: "0.78rem" }}
          >
            <span>Review Pending Queue</span>
          </Link>
        </div>
      </div>

      {/* Toast Feedback */}
      {feedback && (
        <div
          style={{
            background: "#ECFDF5",
            border: "1px solid #A7F3D0",
            color: "#065F46",
            padding: "0.55rem 0.9rem",
            borderRadius: "var(--radius-md)",
            marginBottom: "0.85rem",
            fontSize: "0.8rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          <CheckCircle2 size={15} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Tabs Filter Bar - Clean & Compact */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "var(--bg-surface)",
          padding: "0.4rem 0.6rem",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-subtle)",
          marginBottom: "1rem",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <div style={{ display: "flex", gap: "0.3rem" }}>
          <button
            onClick={() => setFilterTab("all")}
            style={{
              padding: "0.35rem 0.75rem",
              background: filterTab === "all" ? "var(--gold)" : "transparent",
              color: filterTab === "all" ? "#FFFFFF" : "var(--text-secondary)",
              border: "none",
              borderRadius: "var(--radius-full)",
              fontSize: "0.75rem",
              fontWeight: filterTab === "all" ? 600 : 500,
              cursor: "pointer",
            }}
          >
            All Approved ({cakes.length})
          </button>
          <button
            onClick={() => setFilterTab("approved")}
            style={{
              padding: "0.35rem 0.75rem",
              background: filterTab === "approved" ? "var(--gold)" : "transparent",
              color: filterTab === "approved" ? "#FFFFFF" : "var(--text-secondary)",
              border: "none",
              borderRadius: "var(--radius-full)",
              fontSize: "0.75rem",
              fontWeight: filterTab === "approved" ? 600 : 500,
              cursor: "pointer",
            }}
          >
            Staged / Ready ({stagedCakes.length})
          </button>
          <button
            onClick={() => setFilterTab("published")}
            style={{
              padding: "0.35rem 0.75rem",
              background: filterTab === "published" ? "var(--gold)" : "transparent",
              color: filterTab === "published" ? "#FFFFFF" : "var(--text-secondary)",
              border: "none",
              borderRadius: "var(--radius-full)",
              fontSize: "0.75rem",
              fontWeight: filterTab === "published" ? 600 : 500,
              cursor: "pointer",
            }}
          >
            Published Live ({publishedCakes.length})
          </button>
        </div>

        <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
          Showing {displayedCakes.length} confections
        </span>
      </div>

      {/* Grid of Approved Cakes */}
      {displayedCakes.length === 0 && !loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem 1.5rem",
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-md)",
            border: "1px dashed var(--gold-border)",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "var(--bg-cream)",
              border: "1px solid var(--border-subtle)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "0.6rem",
              color: "var(--gold-dark)",
            }}
          >
            <Sparkles size={24} />
          </div>
          <h3 style={{ fontSize: "1.15rem", color: "var(--text-primary)", marginBottom: "0.3rem" }}>
            No approved cakes matching filter
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
            Review pending cakes to approve new confections for staging and publishing.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(285px, 1fr))",
            gap: "0.85rem",
          }}
        >
          {displayedCakes.map((cake) => {
            const isLive = cake.status === "published";
            const isBusy = actionLoading === cake.id;

            return (
              <div
                key={cake.id}
                style={{
                  background: "var(--bg-surface)",
                  border: isLive ? "1px solid var(--gold-border)" : "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.85rem",
                  boxShadow: "var(--shadow-xs)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
                id={`approved-card-${cake.id}`}
              >
                <div>
                  {/* Top bar with Status Badge & Category */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span
                      style={{
                        fontSize: "0.66rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "var(--radius-full)",
                        background: isLive ? "#DBEAFE" : "#D1FAE5",
                        color: isLive ? "#1E40AF" : "#065F46",
                        border: isLive ? "1px solid #BFDBFE" : "1px solid #A7F3D0",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem",
                      }}
                    >
                      <span>{isLive ? "●" : "○"}</span>
                      <span>{isLive ? "PUBLISHED LIVE" : "APPROVED (STAGED)"}</span>
                    </span>

                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500 }}>
                      {cake.category_name || "Haute Confection"}
                    </span>
                  </div>

                  {/* Thumbnail and Info Row */}
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "0.65rem" }}>
                    <div
                      style={{
                        width: "64px",
                        height: "64px",
                        background: "#FFFFFF",
                        borderRadius: "var(--radius-xs)",
                        border: "1px solid var(--border-light)",
                        padding: "0.25rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cake.image_url}
                        alt={cake.name}
                        loading="lazy"
                        decoding="async"
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h4
                        style={{
                          fontSize: "0.92rem",
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          margin: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={cake.name}
                      >
                        {cake.name}
                      </h4>
                      <p
                        style={{
                          fontSize: "0.74rem",
                          color: "var(--gold-dark)",
                          fontStyle: "italic",
                          margin: "0.15rem 0 0.35rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={cake.flavour}
                      >
                        {cake.flavour}
                      </p>
                      {cake.available_sizes && cake.available_sizes.length > 0 && (
                        <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                          {cake.available_sizes.slice(0, 2).map((s, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: "0.64rem",
                                background: "var(--bg-cream)",
                                border: "1px solid var(--border-subtle)",
                                padding: "0.08rem 0.35rem",
                                borderRadius: "var(--radius-full)",
                                color: "var(--text-secondary)",
                              }}
                            >
                              {s.replace(/ \([^)]*\)/, "")}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description preview */}
                  {cake.description && (
                    <p
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--text-secondary)",
                        lineHeight: 1.4,
                        margin: "0 0 0.65rem",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                      title={cake.description}
                    >
                      {cake.description}
                    </p>
                  )}
                </div>

                {/* Actions Toolbar with Edit Button */}
                <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "0.55rem", display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                  <button
                    onClick={() => startEdit(cake)}
                    disabled={isBusy}
                    className="btn-outline-gold icon-hover-lift"
                    style={{
                      padding: "0.35rem 0.65rem",
                      fontSize: "0.74rem",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                    title="Edit cake details, description, flavour, sizes & status"
                  >
                    <Edit3 size={12} />
                    <span>Edit</span>
                  </button>

                  {isLive ? (
                    <>
                      <Link
                        href={`/cakes/${cake.slug}`}
                        target="_blank"
                        className="btn-outline-gold icon-hover-slide"
                        style={{ flex: 1, padding: "0.35rem", fontSize: "0.74rem", justifyContent: "center", gap: "0.25rem" }}
                      >
                        <span>View Live</span>
                        <ArrowUpRight size={13} />
                      </Link>
                      <button
                        onClick={() => handleUnpublish(cake.id, cake.name)}
                        disabled={isBusy}
                        style={{
                          background: "var(--bg-cream)",
                          border: "1px solid var(--border-subtle)",
                          color: "var(--text-secondary)",
                          borderRadius: "var(--radius-full)",
                          padding: "0.35rem 0.65rem",
                          fontSize: "0.74rem",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                        className="icon-hover-rotate"
                        title="Revert to staged approval"
                      >
                        <Undo2 size={12} />
                        <span>Unpublish</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handlePublish(cake.id, cake.name)}
                      disabled={isBusy}
                      className="btn-gold icon-hover-lift"
                      style={{ flex: 1, padding: "0.38rem", fontSize: "0.76rem", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                    >
                      <Send size={12} />
                      <span>Publish Live</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleReject(cake.id)}
                    disabled={isBusy}
                    style={{
                      background: "#FEF2F2",
                      border: "1px solid #FECACA",
                      color: "#991B1B",
                      borderRadius: "var(--radius-full)",
                      padding: "0.35rem 0.55rem",
                      fontSize: "0.74rem",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                    className="icon-hover-lift"
                    title="Reject and archive"
                  >
                    <ArchiveX size={12} />
                    <span>Archive</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Confection Metadata Modal */}
      {editingCake && (
        <div
          className="modal-overlay"
          onClick={cancelEdit}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-md)",
              maxWidth: "540px",
              width: "100%",
              padding: "1.35rem",
              boxShadow: "var(--shadow-lg)",
              border: "1px solid var(--border-subtle)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid var(--border-light)", paddingBottom: "0.75rem" }}>
              <div>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--gold-dark)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Admin Atelier Management
                </span>
                <h3 style={{ fontSize: "1.15rem", color: "var(--text-primary)", fontWeight: 700, margin: "0.15rem 0 0" }}>
                  Edit Confection Details
                </h3>
              </div>
              <button
                onClick={cancelEdit}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", padding: "4px" }}
                className="icon-hover-rotate"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <div className="form-group" style={{ marginBottom: "0.85rem" }}>
              <label className="form-label">Cake Name *</label>
              <input
                type="text"
                value={editForm.name || ""}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                className="form-input"
                style={{ padding: "0.5rem 0.75rem", fontSize: "0.84rem", width: "100%" }}
                placeholder="e.g. Belgian Truffle Gateau"
              />
            </div>

            <div className="form-group" style={{ marginBottom: "0.85rem" }}>
              <label className="form-label">Flavour Notes *</label>
              <input
                type="text"
                value={editForm.flavour || ""}
                onChange={(e) => setEditForm((prev) => ({ ...prev, flavour: e.target.value }))}
                className="form-input"
                style={{ padding: "0.5rem 0.75rem", fontSize: "0.84rem", width: "100%" }}
                placeholder="e.g. 70% Callebaut Dark Chocolate Ganache & Espresso"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.85rem" }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  value={editForm.category_id || ""}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, category_id: e.target.value }))}
                  className="form-input"
                  style={{ padding: "0.5rem 0.75rem", fontSize: "0.84rem", width: "100%" }}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Publication Status</label>
                <select
                  value={editForm.status || "approved"}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value as any }))}
                  className="form-input"
                  style={{ padding: "0.5rem 0.75rem", fontSize: "0.84rem", width: "100%" }}
                >
                  <option value="approved">Approved (Staged - Private)</option>
                  <option value="published">Published Live (Storefront)</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "0.85rem" }}>
              <label className="form-label">Artisanal Description</label>
              <textarea
                rows={3}
                value={editForm.description || ""}
                onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                className="form-input"
                style={{ padding: "0.5rem 0.75rem", fontSize: "0.82rem", resize: "vertical", width: "100%", lineHeight: 1.45 }}
                placeholder="Sensory description of design, sponge layers, and finishes..."
              />
            </div>

            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Available Sizes (Portions)</label>
              <div style={{ display: "flex", gap: "0.35rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                {(editForm.available_sizes || []).map((sz, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: "0.72rem",
                      background: "var(--bg-cream)",
                      border: "1px solid var(--border-subtle)",
                      padding: "0.2rem 0.55rem",
                      borderRadius: "var(--radius-full)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    <span>{sz}</span>
                    <button
                      type="button"
                      onClick={() => removeSize(i)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", padding: 0, display: "inline-flex", alignItems: "center" }}
                      className="icon-hover-rotate"
                      aria-label="Remove size"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  placeholder="e.g. 1.5 kg (Tiered)"
                  value={newSizeInput}
                  onChange={(e) => setNewSizeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSize();
                    }
                  }}
                  className="form-input"
                  style={{ flex: 1, padding: "0.45rem 0.75rem", fontSize: "0.82rem" }}
                />
                <button
                  type="button"
                  onClick={addSize}
                  className="btn-outline-gold"
                  style={{ padding: "0.45rem 0.85rem", fontSize: "0.78rem" }}
                >
                  <Plus size={13} />
                  <span>Add Size</span>
                </button>
              </div>
            </div>

            {/* Image Preview & URL */}
            <div className="form-group" style={{ marginBottom: "1.25rem", padding: "0.75rem", background: "var(--bg-cream)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
              <label className="form-label" style={{ marginBottom: "0.4rem" }}>Photo Preview</label>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    background: "#FFFFFF",
                    borderRadius: "var(--radius-xs)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0.2rem",
                    flexShrink: 0,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={editForm.image_url || editingCake.image_url}
                    alt={editForm.name || "Preview"}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    value={editForm.image_url || ""}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, image_url: e.target.value }))}
                    className="form-input"
                    style={{ padding: "0.4rem 0.65rem", fontSize: "0.76rem", width: "100%" }}
                    placeholder="Image URL"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid var(--border-light)", paddingTop: "0.85rem" }}>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={isSaving}
                className="btn-outline-gold"
                style={{ padding: "0.45rem 0.95rem", fontSize: "0.82rem" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                disabled={isSaving}
                className="btn-gold"
                style={{ padding: "0.45rem 1.15rem", fontSize: "0.82rem" }}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
