"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAdminCakes,
  getCategories,
  updateCakeDetails,
  approveCake,
  rejectCake,
  publishCake,
  regenerateCakeAI,
  reprocessCakeImage,
} from "../../../../lib/api";
import { Cake, Category } from "../../../../lib/types";

export default function PendingCakesPage() {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCakeId, setEditingCakeId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Cake>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; msg: string; type: "success" | "error" } | null>(null);

  const loadData = async () => {
    try {
      const [pendingList, catList] = await Promise.all([
        getAdminCakes("pending"),
        getCategories(),
      ]);
      setCakes(pendingList);
      setCategories(catList);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const startEditing = (cake: Cake) => {
    setEditingCakeId(cake.id);
    setEditForm({
      name: cake.name,
      flavour: cake.flavour,
      category_id: cake.category_id,
      description: cake.description,
      available_sizes: [...cake.available_sizes],
    });
  };

  const saveEdit = async (cakeId: string) => {
    setActionLoading(cakeId);
    try {
      const updated = await updateCakeDetails(cakeId, editForm);
      setCakes(cakes.map((c) => (c.id === cakeId ? updated : c)));
      setEditingCakeId(null);
      setFeedback({ id: cakeId, msg: "Cake details successfully updated.", type: "success" });
    } catch (err: any) {
      setFeedback({ id: cakeId, msg: err.message, type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (cakeId: string) => {
    setActionLoading(cakeId);
    try {
      await approveCake(cakeId);
      setCakes(cakes.filter((c) => c.id !== cakeId));
      setFeedback({ id: cakeId, msg: "Cake approved! Moved to Approved queue.", type: "success" });
    } catch (err: any) {
      setFeedback({ id: cakeId, msg: err.message, type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (cakeId: string) => {
    setActionLoading(cakeId);
    try {
      await rejectCake(cakeId);
      setCakes(cakes.filter((c) => c.id !== cakeId));
      setFeedback({ id: cakeId, msg: "Cake rejected.", type: "success" });
    } catch (err: any) {
      setFeedback({ id: cakeId, msg: err.message, type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handlePublish = async (cakeId: string) => {
    setActionLoading(cakeId);
    try {
      await publishCake(cakeId);
      setCakes(cakes.filter((c) => c.id !== cakeId));
      setFeedback({ id: cakeId, msg: "Cake published live! ISR revalidation triggered.", type: "success" });
    } catch (err: any) {
      setFeedback({ id: cakeId, msg: err.message, type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRegenerateAI = async (cakeId: string) => {
    setActionLoading(cakeId);
    try {
      const updated = await regenerateCakeAI(cakeId);
      setCakes(cakes.map((c) => (c.id === cakeId ? updated : c)));
      setFeedback({ id: cakeId, msg: "AI cake metadata regenerated with fresh suggestions!", type: "success" });
    } catch (err: any) {
      setFeedback({ id: cakeId, msg: err.message, type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReprocess = async (cakeId: string) => {
    setActionLoading(cakeId);
    try {
      const updated = await reprocessCakeImage(cakeId);
      setCakes(cakes.map((c) => (c.id === cakeId ? updated : c)));
      setFeedback({ id: cakeId, msg: "Image reprocessed on studio white canvas successfully!", type: "success" });
    } catch (err: any) {
      setFeedback({ id: cakeId, msg: err.message, type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div id="pending-cakes-view">
      {/* Header - Compact */}
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
          <span className="cake-category-badge">Human Review Atelier</span>
          <h1 style={{ fontSize: "1.5rem", color: "var(--text-primary)", fontWeight: 700 }}>
            Pending Approval Queue ({cakes.length})
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>
            AI never automatically publishes. Review processed studio cutouts, edit metadata, or approve in one click.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button onClick={loadData} className="btn-outline-gold" style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem" }}>
            🔄 Refresh
          </button>
          <Link href="/admin/upload" className="btn-gold" style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem" }}>
            + Bulk Upload
          </Link>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            padding: "0.6rem 0.95rem",
            borderRadius: "var(--radius-sm)",
            marginBottom: "1rem",
            background: feedback.type === "success" ? "#D1FAE5" : "#FEE2E2",
            border: feedback.type === "success" ? "1px solid #A7F3D0" : "1px solid #FECACA",
            color: feedback.type === "success" ? "#065F46" : "#991B1B",
            fontSize: "0.84rem",
            fontWeight: 500,
          }}
        >
          {feedback.msg}
        </div>
      )}

      {/* Empty State */}
      {cakes.length === 0 && !isLoading && (
        <div
          style={{
            textAlign: "center",
            padding: "3rem 1.5rem",
            background: "var(--bg-surface)",
            border: "1px dashed var(--gold-border)",
            borderRadius: "var(--radius-md)",
            marginTop: "1rem",
          }}
          id="empty-pending-state"
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✨</div>
          <h3 style={{ fontSize: "1.2rem", color: "var(--text-primary)", marginBottom: "0.3rem" }}>
            No pending cakes.
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>
            All ingested confections have been approved or rejected. Upload new cake photos to review.
          </p>
          <Link href="/admin/upload" className="btn-gold" style={{ padding: "0.5rem 1.1rem", fontSize: "0.82rem" }}>
            Upload 20+ Images
          </Link>
        </div>
      )}

      {/* Pending Cakes List - High Information Density */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {cakes.map((cake) => {
          const isEditing = editingCakeId === cake.id;
          const isBusy = actionLoading === cake.id;

          return (
            <div
              key={cake.id}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "1rem",
                boxShadow: "var(--shadow-xs)",
              }}
              id={`pending-card-${cake.id}`}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "1.25rem",
                  alignItems: "start",
                }}
              >
                {/* Left: Studio White Image Preview */}
                <div style={{ maxWidth: "260px", width: "100%" }}>
                  <div
                    style={{
                      background: "#FFFFFF",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-light)",
                      padding: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      aspectRatio: "1/1",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cake.image_url}
                      alt={cake.name}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                    <span className="badge-status badge-pending">Pending Approval</span>
                    <span style={{ fontSize: "0.68rem", background: "var(--bg-cream)", padding: "0.15rem 0.45rem", borderRadius: "var(--radius-full)", color: "var(--text-secondary)" }}>
                      Studio White
                    </span>
                  </div>

                  <button
                    onClick={() => handleReprocess(cake.id)}
                    disabled={isBusy}
                    style={{
                      width: "100%",
                      padding: "0.35rem 0.6rem",
                      fontSize: "0.72rem",
                      background: "var(--bg-cream)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-xs)",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                    }}
                  >
                    🎨 Reprocess Cutout
                  </button>
                </div>

                {/* Middle: Cake Metadata / Inline Editor */}
                <div style={{ flex: 1 }}>
                  {isEditing ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                      <div>
                        <label className="form-label">Cake Title</label>
                        <input
                          type="text"
                          value={editForm.name || ""}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="form-input"
                          style={{ padding: "0.45rem 0.75rem", fontSize: "0.85rem" }}
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                        <div>
                          <label className="form-label">Flavour Note</label>
                          <input
                            type="text"
                            value={editForm.flavour || ""}
                            onChange={(e) => setEditForm({ ...editForm, flavour: e.target.value })}
                            className="form-input"
                            style={{ padding: "0.45rem 0.75rem", fontSize: "0.85rem" }}
                          />
                        </div>
                        <div>
                          <label className="form-label">Category</label>
                          <select
                            value={editForm.category_id || ""}
                            onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })}
                            className="form-select"
                            style={{ padding: "0.45rem 0.75rem", fontSize: "0.85rem" }}
                          >
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="form-label">Description</label>
                        <textarea
                          rows={2}
                          value={editForm.description || ""}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="form-textarea"
                          style={{ padding: "0.45rem 0.75rem", fontSize: "0.85rem" }}
                        />
                      </div>

                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                        <button
                          onClick={() => saveEdit(cake.id)}
                          disabled={isBusy}
                          className="btn-gold"
                          style={{ padding: "0.4rem 0.85rem", fontSize: "0.78rem" }}
                        >
                          💾 Save Changes
                        </button>
                        <button
                          onClick={() => setEditingCakeId(null)}
                          className="btn-outline-gold"
                          style={{ padding: "0.4rem 0.85rem", fontSize: "0.78rem" }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.35rem" }}>
                        <div>
                          <span style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gold-dark)", fontWeight: 700 }}>
                            {cake.category_name || "Uncategorized"}
                          </span>
                          <h3 style={{ fontSize: "1.15rem", color: "var(--text-primary)", margin: "0.15rem 0 0.35rem", fontWeight: 700 }}>
                            {cake.name}
                          </h3>
                        </div>
                        <button
                          onClick={() => startEditing(cake)}
                          style={{
                            background: "var(--bg-cream)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "var(--radius-xs)",
                            padding: "0.25rem 0.6rem",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                            color: "var(--text-primary)",
                            fontWeight: 500,
                          }}
                        >
                          ✎ Edit
                        </button>
                      </div>

                      <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontStyle: "italic", marginBottom: "0.5rem" }}>
                        ✨ {cake.flavour}
                      </div>

                      <div
                        style={{
                          background: "var(--bg-main)",
                          padding: "0.6rem 0.8rem",
                          borderRadius: "var(--radius-xs)",
                          border: "1px solid var(--border-light)",
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                          lineHeight: 1.5,
                          marginBottom: "0.6rem",
                        }}
                      >
                        {cake.description || "No description provided."}
                      </div>

                      {/* Sizes badges */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginBottom: "0.85rem" }}>
                        {cake.available_sizes?.map((sz, idx) => (
                          <span key={idx} className="cake-size-pill">
                            {sz}
                          </span>
                        ))}
                      </div>

                      {/* Quick Review Actions */}
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <button
                          onClick={() => handleRegenerateAI(cake.id)}
                          disabled={isBusy}
                          style={{
                            background: "var(--bg-surface)",
                            border: "1px solid var(--gold-border)",
                            color: "var(--gold-dark)",
                            padding: "0.4rem 0.75rem",
                            borderRadius: "var(--radius-full)",
                            fontSize: "0.78rem",
                            cursor: "pointer",
                            fontWeight: 500,
                          }}
                        >
                          ✨ Regenerate AI
                        </button>

                        <button
                          onClick={() => handleApprove(cake.id)}
                          disabled={isBusy}
                          style={{
                            background: "#ECFDF5",
                            border: "1px solid #A7F3D0",
                            color: "#065F46",
                            padding: "0.4rem 0.85rem",
                            borderRadius: "var(--radius-full)",
                            fontSize: "0.78rem",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          ✓ Approve
                        </button>

                        <button
                          onClick={() => handlePublish(cake.id)}
                          disabled={isBusy}
                          className="btn-gold"
                          style={{ padding: "0.4rem 0.85rem", fontSize: "0.78rem" }}
                        >
                          🚀 Approve & Publish
                        </button>

                        <button
                          onClick={() => handleReject(cake.id)}
                          disabled={isBusy}
                          style={{
                            background: "#FEF2F2",
                            border: "1px solid #FECACA",
                            color: "#991B1B",
                            padding: "0.4rem 0.75rem",
                            borderRadius: "var(--radius-full)",
                            fontSize: "0.78rem",
                            cursor: "pointer",
                            fontWeight: 500,
                          }}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
