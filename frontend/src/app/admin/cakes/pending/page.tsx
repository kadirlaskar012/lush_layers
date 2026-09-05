"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  getAdminCakes,
  getCategories,
  updateCakeDetails,
  approveCake,
  rejectCake,
  publishCake,
  generateCakeAI,
  regenerateCakeAI,
  reprocessCakeImage,
} from "../../../../lib/api";
import { Cake, Category } from "../../../../lib/types";

export default function PendingCakesPage() {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCakeId, setEditingCakeId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Cake>>({});
  const [newSizeInput, setNewSizeInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id?: string; msg: string; type: "success" | "error" | "info" } | null>(null);

  // Bulk Generation state
  const [bulkState, setBulkState] = useState<{
    isRunning: boolean;
    current: number;
    total: number;
    succeeded: number;
    failed: number;
  }>({
    isRunning: false,
    current: 0,
    total: 0,
    succeeded: 0,
    failed: 0,
  });

  const stopBulkRef = useRef<boolean>(false);

  const loadData = async () => {
    try {
      const [pendingList, catList] = await Promise.all([
        getAdminCakes("pending"),
        getCategories(),
      ]);
      setCakes(pendingList);
      setCategories(catList);
    } catch (e) {
      console.error("Failed to load pending cakes:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getAiStatus = (cake: Cake): "not_generated" | "generating" | "generated" | "failed" => {
    if (cake.ai_metadata?.ai_status) {
      return cake.ai_metadata.ai_status;
    }
    if (cake.ai_metadata?.suggested_name || cake.ai_metadata?.confidence) {
      return "generated";
    }
    if (cake.flavour && cake.flavour !== "Not specified" && cake.description && !cake.description.includes("Awaiting AI")) {
      return "generated";
    }
    return "not_generated";
  };

  const handleAIGenerate = async (cakeId: string, isRegenerate: boolean = false) => {
    setActionLoading(cakeId);
    setCakes((prev) =>
      prev.map((c) =>
        c.id === cakeId
          ? {
              ...c,
              ai_metadata: {
                ...c.ai_metadata,
                ai_status: "generating",
              },
            }
          : c
      )
    );

    try {
      const updated = isRegenerate ? await regenerateCakeAI(cakeId) : await generateCakeAI(cakeId);
      setCakes((prev) => prev.map((c) => (c.id === cakeId ? updated : c)));
      setFeedback({
        id: cakeId,
        msg: isRegenerate
          ? `AI suggestions refreshed for "${updated.name}"!`
          : `AI generated metadata for "${updated.name}"! Status remains Pending for your review.`,
        type: "success",
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setCakes((prev) =>
        prev.map((c) =>
          c.id === cakeId
            ? {
                ...c,
                ai_metadata: {
                  ...c.ai_metadata,
                  ai_status: "failed",
                  ai_error: err.message || "AI analysis failed",
                },
              }
            : c
        )
      );
      setFeedback({ id: cakeId, msg: err.message || "AI generation failed.", type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateAllWithAI = async () => {
    const ungenerated = cakes.filter((c) => getAiStatus(c) !== "generated");
    if (ungenerated.length === 0) {
      setFeedback({ msg: "All pending cakes already have AI metadata generated.", type: "info" });
      return;
    }

    stopBulkRef.current = false;
    setBulkState({
      isRunning: true,
      current: 0,
      total: ungenerated.length,
      succeeded: 0,
      failed: 0,
    });

    let succ = 0;
    let fail = 0;

    for (let i = 0; i < ungenerated.length; i++) {
      if (stopBulkRef.current) break;
      const cake = ungenerated[i];
      setBulkState((prev) => ({ ...prev, current: i + 1 }));
      setActionLoading(cake.id);

      setCakes((prev) =>
        prev.map((c) =>
          c.id === cake.id
            ? { ...c, ai_metadata: { ...c.ai_metadata, ai_status: "generating" } }
            : c
        )
      );

      try {
        const updated = await generateCakeAI(cake.id);
        setCakes((prev) => prev.map((c) => (c.id === cake.id ? updated : c)));
        succ++;
      } catch {
        fail++;
      } finally {
        setBulkState((prev) => ({ ...prev, succeeded: succ, failed: fail }));
      }
    }

    setActionLoading(null);
    setBulkState((prev) => ({ ...prev, isRunning: false }));
    setFeedback({
      msg: `Bulk AI completed: ${succ} analyzed, ${fail} failed. Human approval required.`,
      type: "success",
    });
    setTimeout(() => setFeedback(null), 5000);
  };

  const startEdit = (cake: Cake) => {
    setEditingCakeId(cake.id);
    setEditForm({
      name: cake.name,
      flavour: cake.flavour,
      category_id: cake.category_id || (categories[0]?.id || ""),
      description: cake.description,
      available_sizes: cake.available_sizes ? [...cake.available_sizes] : ["1.0 kg"],
    });
    setNewSizeInput("");
  };

  const cancelEdit = () => {
    setEditingCakeId(null);
    setEditForm({});
    setNewSizeInput("");
  };

  const saveEdit = async (cakeId: string) => {
    setActionLoading(cakeId);
    try {
      const updated = await updateCakeDetails(cakeId, editForm);
      setCakes((prev) => prev.map((c) => (c.id === cakeId ? updated : c)));
      setEditingCakeId(null);
      setFeedback({ id: cakeId, msg: `"${updated.name}" updated successfully!`, type: "success" });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ id: cakeId, msg: err.message || "Failed to save edits", type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (cakeId: string, cakeName: string) => {
    setActionLoading(cakeId);
    try {
      await approveCake(cakeId);
      setCakes((prev) => prev.filter((c) => c.id !== cakeId));
      setFeedback({ msg: `"${cakeName}" approved and staged!`, type: "success" });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      setFeedback({ id: cakeId, msg: err.message || "Approval failed", type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveAndPublish = async (cakeId: string, cakeName: string) => {
    setActionLoading(cakeId);
    try {
      await approveCake(cakeId);
      await publishCake(cakeId);
      setCakes((prev) => prev.filter((c) => c.id !== cakeId));
      setFeedback({ msg: `"${cakeName}" approved & published live to storefront!`, type: "success" });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      setFeedback({ id: cakeId, msg: err.message || "Publish failed", type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (cakeId: string, cakeName: string) => {
    setActionLoading(cakeId);
    try {
      await rejectCake(cakeId);
      setCakes((prev) => prev.filter((c) => c.id !== cakeId));
      setFeedback({ msg: `"${cakeName}" moved to Rejected Archive.`, type: "info" });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      setFeedback({ id: cakeId, msg: err.message || "Rejection failed", type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const ungeneratedCount = cakes.filter((c) => getAiStatus(c) !== "generated").length;

  return (
    <div id="pending-cakes-view">
      {/* Header - Compact */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          flexWrap: "wrap",
          gap: "0.65rem",
        }}
      >
        <div>
          <span className="cake-category-badge">Human Review Atelier</span>
          <h1 style={{ fontSize: "1.45rem", color: "var(--text-primary)", fontWeight: 700, margin: "0.1rem 0" }}>
            Pending Approval Queue ({cakes.length})
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>
            AI suggests metadata for processed cake photos. Review, refine, and approve for staging or live publication.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={handleGenerateAllWithAI}
            disabled={bulkState.isRunning || ungeneratedCount === 0}
            className="btn-gold"
            style={{
              padding: "0.42rem 0.85rem",
              fontSize: "0.78rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              opacity: ungeneratedCount === 0 ? 0.6 : 1,
              cursor: ungeneratedCount === 0 ? "not-allowed" : "pointer",
            }}
          >
            ✨ Generate All with AI {ungeneratedCount > 0 ? `(${ungeneratedCount})` : ""}
          </button>
          <button onClick={loadData} className="btn-outline-gold" style={{ padding: "0.42rem 0.85rem", fontSize: "0.78rem" }}>
            🔄 Refresh
          </button>
          <Link href="/admin/upload" className="btn-outline-gold" style={{ padding: "0.42rem 0.85rem", fontSize: "0.78rem" }}>
            + Bulk Upload
          </Link>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            padding: "0.55rem 0.85rem",
            borderRadius: "var(--radius-sm)",
            background: feedback.type === "success" ? "#D1FAE5" : feedback.type === "info" ? "#EFF6FF" : "#FEE2E2",
            border: feedback.type === "success" ? "1px solid #A7F3D0" : feedback.type === "info" ? "1px solid #BFDBFE" : "1px solid #FECACA",
            color: feedback.type === "success" ? "#065F46" : feedback.type === "info" ? "#1D4ED8" : "#991B1B",
            fontSize: "0.82rem",
            marginBottom: "1rem",
            fontWeight: 500,
          }}
        >
          {feedback.type === "success" ? "✓ " : feedback.type === "info" ? "ℹ " : "✕ "}
          {feedback.msg}
        </div>
      )}

      {/* Bulk Progress Bar */}
      {bulkState.isRunning && (
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--gold-border)",
            borderRadius: "var(--radius-sm)",
            padding: "0.75rem 1rem",
            marginBottom: "1rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "0.35rem" }}>
            <span>⚡ Processing AI analysis ({bulkState.current} / {bulkState.total})...</span>
            <button
              onClick={() => { stopBulkRef.current = true; }}
              style={{ background: "none", border: "none", color: "#EF4444", fontSize: "0.76rem", cursor: "pointer", fontWeight: 600 }}
            >
              Stop Bulk
            </button>
          </div>
          <div style={{ width: "100%", height: "5px", background: "var(--border-subtle)", borderRadius: "3px", overflow: "hidden" }}>
            <div
              style={{
                width: `${bulkState.total ? (bulkState.current / bulkState.total) * 100 : 0}%`,
                height: "100%",
                background: "var(--gold)",
                transition: "width 0.3s ease",
              }}
            />
          </div>
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
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.4rem" }}>✨</div>
          <h3 style={{ fontSize: "1.15rem", color: "var(--text-primary)", marginBottom: "0.25rem" }}>
            No pending cakes in queue
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "1rem" }}>
            All processed photos have been approved or rejected. Upload new cake images to begin moderation.
          </p>
          <Link href="/admin/upload" className="btn-gold" style={{ padding: "0.45rem 1.1rem", fontSize: "0.8rem" }}>
            Upload Cake Images
          </Link>
        </div>
      )}

      {/* Compact Pending Cakes Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
          gap: "0.85rem",
        }}
      >
        {cakes.map((cake) => {
          const isBusy = actionLoading === cake.id;
          const aiStatus = getAiStatus(cake);

          return (
            <div
              key={cake.id}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "0.85rem",
                boxShadow: "var(--shadow-xs)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
              id={`pending-card-${cake.id}`}
            >
              <div>
                {/* Top status pills */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      padding: "0.15rem 0.45rem",
                      borderRadius: "var(--radius-full)",
                      background: "#FEF3C7",
                      color: "#92400E",
                      border: "1px solid #FCD34D",
                    }}
                  >
                    ⏳ PENDING APPROVAL
                  </span>

                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      padding: "0.15rem 0.45rem",
                      borderRadius: "var(--radius-full)",
                      background:
                        aiStatus === "generated"
                          ? "#D1FAE5"
                          : aiStatus === "generating"
                          ? "#EFF6FF"
                          : "#F3F4F6",
                      color:
                        aiStatus === "generated"
                          ? "#065F46"
                          : aiStatus === "generating"
                          ? "#1D4ED8"
                          : "var(--text-muted)",
                      border:
                        aiStatus === "generated"
                          ? "1px solid #A7F3D0"
                          : aiStatus === "generating"
                          ? "1px solid #BFDBFE"
                          : "1px solid var(--border-subtle)",
                    }}
                  >
                    {aiStatus === "generated" ? "✓ AI Generated" : aiStatus === "generating" ? "⚡ AI Analyzing..." : "Awaiting AI"}
                  </span>
                </div>

                {/* Content Row: Thumbnail + Details */}
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", marginBottom: "0.65rem" }}>
                  {/* Thumbnail: Compact 85x85 preview */}
                  <div
                    style={{
                      width: "85px",
                      height: "85px",
                      background: "#FFFFFF",
                      borderRadius: "var(--radius-xs)",
                      border: "1px solid var(--border-light)",
                      padding: "0.25rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      position: "relative",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cake.image_url}
                      alt={cake.name}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                    {isBusy && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(255, 255, 255, 0.8)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.8rem",
                        }}
                      >
                        ⏳
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <span style={{ fontSize: "0.65rem", color: "var(--gold-dark)", textTransform: "uppercase", fontWeight: 600 }}>
                        {cake.category_name || "Haute Confection"}
                      </span>
                      <button
                        onClick={() => startEdit(cake)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--gold-dark)",
                          fontSize: "0.74rem",
                          cursor: "pointer",
                          fontWeight: 600,
                          padding: 0,
                        }}
                      >
                        ✏️ Edit
                      </button>
                    </div>

                    <h4
                      style={{
                        fontSize: "0.92rem",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        margin: "0.1rem 0",
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
                        color: "var(--text-secondary)",
                        fontStyle: "italic",
                        margin: "0 0 0.35rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={cake.flavour}
                    >
                      {cake.flavour || "Flavour pending..."}
                    </p>

                    {cake.available_sizes && cake.available_sizes.length > 0 && (
                      <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                        {cake.available_sizes.slice(0, 3).map((s, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: "0.62rem",
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

                {/* Description Preview snippet */}
                {cake.description && (
                  <p
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.35,
                      margin: "0 0 0.65rem",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {cake.description}
                  </p>
                )}
              </div>

              {/* Action Buttons Toolbar */}
              <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "0.55rem", display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                {/* AI Generate / Regenerate */}
                <button
                  onClick={() => handleAIGenerate(cake.id, aiStatus === "generated")}
                  disabled={isBusy}
                  className="btn-outline-gold"
                  style={{ padding: "0.32rem 0.6rem", fontSize: "0.74rem" }}
                  title="Generate or refresh AI metadata suggestions"
                >
                  {aiStatus === "generated" ? "🔄 Regenerate AI" : "✨ AI Generate"}
                </button>

                {/* Approve (Stage) */}
                <button
                  onClick={() => handleApprove(cake.id, cake.name)}
                  disabled={isBusy}
                  style={{
                    background: "#D1FAE5",
                    border: "1px solid #A7F3D0",
                    color: "#065F46",
                    borderRadius: "var(--radius-full)",
                    padding: "0.32rem 0.65rem",
                    fontSize: "0.74rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  title="Approve and move to staged ready for live release"
                >
                  ✓ Approve
                </button>

                {/* Approve & Publish */}
                <button
                  onClick={() => handleApproveAndPublish(cake.id, cake.name)}
                  disabled={isBusy}
                  className="btn-gold"
                  style={{ padding: "0.32rem 0.65rem", fontSize: "0.74rem" }}
                  title="Approve and instantly publish live to storefront"
                >
                  🚀 Approve & Publish
                </button>

                {/* Reject */}
                <button
                  onClick={() => handleReject(cake.id, cake.name)}
                  disabled={isBusy}
                  style={{
                    background: "#FEF2F2",
                    border: "1px solid #FECACA",
                    color: "#991B1B",
                    borderRadius: "var(--radius-full)",
                    padding: "0.32rem 0.55rem",
                    fontSize: "0.74rem",
                    cursor: "pointer",
                  }}
                  title="Reject and move to archive"
                >
                  ✕ Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compact Inline Edit Modal */}
      {editingCakeId && (
        <div
          className="modal-overlay"
          onClick={cancelEdit}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: "1rem",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-md)",
              maxWidth: "500px",
              width: "100%",
              padding: "1.25rem",
              boxShadow: "var(--shadow-lg)",
              border: "1px solid var(--border-subtle)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
              <h3 style={{ fontSize: "1.1rem", color: "var(--text-primary)", fontWeight: 700, margin: 0 }}>
                Edit Confection Metadata
              </h3>
              <button
                onClick={cancelEdit}
                style={{ background: "none", border: "none", fontSize: "1.1rem", cursor: "pointer", color: "var(--text-secondary)" }}
              >
                ✕
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Cake Name *</label>
              <input
                type="text"
                value={editForm.name || ""}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                className="form-input"
                style={{ padding: "0.45rem 0.75rem", fontSize: "0.82rem" }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Flavour Notes *</label>
              <input
                type="text"
                value={editForm.flavour || ""}
                onChange={(e) => setEditForm((prev) => ({ ...prev, flavour: e.target.value }))}
                className="form-input"
                style={{ padding: "0.45rem 0.75rem", fontSize: "0.82rem" }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                value={editForm.category_id || ""}
                onChange={(e) => setEditForm((prev) => ({ ...prev, category_id: e.target.value }))}
                className="form-input"
                style={{ padding: "0.45rem 0.75rem", fontSize: "0.82rem" }}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Artisanal Description</label>
              <textarea
                rows={3}
                value={editForm.description || ""}
                onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                className="form-input"
                style={{ padding: "0.45rem 0.75rem", fontSize: "0.82rem", resize: "vertical" }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Available Sizes (Portions)</label>
              <div style={{ display: "flex", gap: "0.35rem", marginBottom: "0.45rem", flexWrap: "wrap" }}>
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
                      onClick={() =>
                        setEditForm((prev) => ({
                          ...prev,
                          available_sizes: prev.available_sizes?.filter((_, idx) => idx !== i),
                        }))
                      }
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", fontSize: "0.75rem", padding: 0 }}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              <div style={{ display: "flex", gap: "0.4rem" }}>
                <input
                  type="text"
                  placeholder="e.g. 1.5 kg (Tiered)"
                  value={newSizeInput}
                  onChange={(e) => setNewSizeInput(e.target.value)}
                  className="form-input"
                  style={{ padding: "0.35rem 0.65rem", fontSize: "0.78rem" }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newSizeInput.trim()) {
                      setEditForm((prev) => ({
                        ...prev,
                        available_sizes: [...(prev.available_sizes || []), newSizeInput.trim()],
                      }));
                      setNewSizeInput("");
                    }
                  }}
                  className="btn-outline-gold"
                  style={{ padding: "0.35rem 0.75rem", fontSize: "0.78rem" }}
                >
                  + Add Size
                </button>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
              <button onClick={cancelEdit} className="btn-outline-gold" style={{ padding: "0.42rem 0.85rem", fontSize: "0.8rem" }}>
                Cancel
              </button>
              <button
                onClick={() => saveEdit(editingCakeId)}
                disabled={actionLoading === editingCakeId}
                className="btn-gold"
                style={{ padding: "0.42rem 1rem", fontSize: "0.8rem" }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
