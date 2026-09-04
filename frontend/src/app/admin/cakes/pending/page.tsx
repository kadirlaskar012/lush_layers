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
      setFeedback({ id: cakeId, msg: "Cake successfully published to live website! ISR revalidation triggered.", type: "success" });
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
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <span className="cake-category-badge">Human Review Atelier</span>
          <h1 style={{ fontSize: "2.4rem", color: "var(--text-primary)" }}>
            Pending Cake Approval Queue ({cakes.length})
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            AI never automatically publishes a cake. Review processed images, edit AI suggestions, regenerate, and approve before publishing.
          </p>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button onClick={loadData} className="btn-outline-gold" style={{ padding: "0.6rem 1.25rem" }}>
            🔄 Refresh List
          </button>
          <Link href="/admin/upload" className="btn-gold" style={{ padding: "0.6rem 1.25rem" }}>
            + Upload More Images
          </Link>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            padding: "1rem 1.5rem",
            borderRadius: "var(--radius-md)",
            marginBottom: "2rem",
            background: feedback.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
            border: feedback.type === "success" ? "1px solid #10B981" : "1px solid #EF4444",
            color: feedback.type === "success" ? "#34D399" : "#F87171",
            fontSize: "0.95rem",
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
            padding: "5rem 2rem",
            background: "var(--bg-surface)",
            border: "1px dashed var(--border-gold)",
            borderRadius: "var(--radius-lg)",
            marginTop: "1rem",
          }}
          id="empty-pending-state"
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✨</div>
          <h3 style={{ fontSize: "1.6rem", color: "var(--gold-light)", marginBottom: "0.5rem" }}>
            No pending cakes.
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
            All uploaded creations have been reviewed and approved or no pending uploads currently exist.
          </p>
          <Link href="/admin/upload" className="btn-gold">
            Upload Cake Images Now
          </Link>
        </div>
      )}

      {/* Pending Cakes List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        {cakes.map((cake) => {
          const isEditing = editingCakeId === cake.id;
          const isBusy = actionLoading === cake.id;

          return (
            <div
              key={cake.id}
              className="glass-card"
              style={{
                padding: "2rem",
                border: "1px solid var(--border-gold)",
              }}
              id={`pending-cake-card-${cake.id}`}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "2.5rem",
                }}
              >
                {/* Left: Studio White Cutout Preview */}
                <div>
                  <div
                    style={{
                      background: "#FFFFFF",
                      borderRadius: "12px",
                      padding: "1.5rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "320px",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                      marginBottom: "1rem",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cake.image_url}
                      alt={cake.name}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "300px",
                        objectFit: "contain",
                      }}
                    />
                  </div>

                  {/* Status Badges */}
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        padding: "0.25rem 0.6rem",
                        borderRadius: "9999px",
                        background: "rgba(245, 158, 11, 0.2)",
                        color: "#FBBF24",
                        fontWeight: 600,
                        textTransform: "uppercase",
                      }}
                    >
                      Status: {cake.status}
                    </span>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        padding: "0.25rem 0.6rem",
                        borderRadius: "9999px",
                        background: "rgba(16, 185, 129, 0.15)",
                        color: "#34D399",
                        fontWeight: 600,
                        textTransform: "uppercase",
                      }}
                    >
                      Image: Studio White Ready
                    </span>
                    {cake.ai_metadata?.confidence && (
                      <span
                        style={{
                          fontSize: "0.72rem",
                          padding: "0.25rem 0.6rem",
                          borderRadius: "9999px",
                          background: "rgba(99, 102, 241, 0.15)",
                          color: "#818CF8",
                          fontWeight: 600,
                        }}
                      >
                        AI Confidence: {Math.round(cake.ai_metadata.confidence * 100)}%
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleReprocess(cake.id)}
                    disabled={isBusy}
                    className="btn-outline-gold"
                    style={{ width: "100%", padding: "0.6rem", fontSize: "0.82rem" }}
                  >
                    🎨 Reprocess Image / Cutout
                  </button>
                </div>

                {/* Right: Cake Metadata & AI Suggestions (Editable) */}
                <div>
                  {isEditing ? (
                    // EDIT MODE
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <div>
                        <label className="form-label">Cake Name *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={editForm.name || ""}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="form-label">Flavour *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={editForm.flavour || ""}
                          onChange={(e) => setEditForm({ ...editForm, flavour: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="form-label">Category</label>
                        <select
                          className="form-select"
                          value={editForm.category_id || ""}
                          onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })}
                        >
                          <option value="">Select Category...</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-textarea"
                          rows={3}
                          value={editForm.description || ""}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="form-label">Available Sizes (Comma separated)</label>
                        <input
                          type="text"
                          className="form-input"
                          value={(editForm.available_sizes || []).join(", ")}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              available_sizes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                            })
                          }
                        />
                      </div>

                      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                        <button
                          onClick={() => saveEdit(cake.id)}
                          disabled={isBusy}
                          className="btn-gold"
                          style={{ padding: "0.75rem 1.5rem" }}
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setEditingCakeId(null)}
                          className="btn-outline-gold"
                          style={{ padding: "0.75rem 1.25rem" }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // VIEW MODE (AI suggestions presented clearly)
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                        <div>
                          <span className="cake-category-badge">
                            {cake.category_name || "Uncategorized"}
                          </span>
                          <h2 style={{ fontSize: "1.85rem", color: "var(--gold-light)", lineHeight: 1.2 }}>
                            {cake.name}
                          </h2>
                        </div>
                        <button
                          onClick={() => startEditing(cake)}
                          className="btn-outline-gold"
                          style={{ padding: "0.45rem 1rem", fontSize: "0.82rem" }}
                          id={`edit-cake-btn-${cake.id}`}
                        >
                          ✏️ Edit Details
                        </button>
                      </div>

                      <div style={{ marginBottom: "1.25rem", fontStyle: "italic", color: "var(--text-secondary)" }}>
                        Flavour: <strong>{cake.flavour}</strong>
                      </div>

                      <div style={{ marginBottom: "1.25rem" }}>
                        <div style={{ fontSize: "0.78rem", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                          AI Suggested Description:
                        </div>
                        <p style={{ color: "var(--text-primary)", fontSize: "0.95rem", lineHeight: "1.7" }}>
                          {cake.description}
                        </p>
                      </div>

                      <div style={{ marginBottom: "1.5rem" }}>
                        <div style={{ fontSize: "0.78rem", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                          Available Sizes:
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                          {cake.available_sizes?.map((size, sIdx) => (
                            <span key={sIdx} className="cake-size-pill">
                              {size}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons: Edit, Regenerate, Approve, Reject, Publish */}
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "0.75rem",
                          borderTop: "1px solid var(--border-subtle)",
                          paddingTop: "1.5rem",
                        }}
                      >
                        <button
                          onClick={() => handleRegenerateAI(cake.id)}
                          disabled={isBusy}
                          className="btn-outline-gold"
                          style={{ padding: "0.75rem 1.25rem", fontSize: "0.88rem" }}
                          id={`regen-ai-btn-${cake.id}`}
                        >
                          ✨ Regenerate AI
                        </button>

                        <button
                          onClick={() => handleApprove(cake.id)}
                          disabled={isBusy}
                          className="btn-outline-gold"
                          style={{
                            padding: "0.75rem 1.25rem",
                            fontSize: "0.88rem",
                            borderColor: "#10B981",
                            color: "#34D399",
                          }}
                          id={`approve-btn-${cake.id}`}
                        >
                          ✓ Approve Cake
                        </button>

                        <button
                          onClick={() => handlePublish(cake.id)}
                          disabled={isBusy}
                          className="btn-gold"
                          style={{ padding: "0.75rem 1.5rem", fontSize: "0.88rem" }}
                          id={`publish-btn-${cake.id}`}
                        >
                          🚀 Approve & Publish Live
                        </button>

                        <button
                          onClick={() => handleReject(cake.id)}
                          disabled={isBusy}
                          className="btn-outline-gold"
                          style={{
                            padding: "0.75rem 1rem",
                            fontSize: "0.88rem",
                            borderColor: "rgba(239, 68, 68, 0.4)",
                            color: "#F87171",
                          }}
                          id={`reject-btn-${cake.id}`}
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
