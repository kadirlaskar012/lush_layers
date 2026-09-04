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

  // Determine AI status of a cake
  const getAiStatus = (cake: Cake): "not_generated" | "generating" | "generated" | "failed" => {
    if (cake.ai_metadata?.ai_status) {
      return cake.ai_metadata.ai_status;
    }
    // Backward compatibility check
    if (cake.ai_metadata?.suggested_name || cake.ai_metadata?.confidence) {
      return "generated";
    }
    if (cake.flavour && cake.flavour !== "Not specified" && cake.description && !cake.description.includes("Awaiting AI")) {
      return "generated";
    }
    return "not_generated";
  };

  // Single AI Generate or Regenerate
  const handleAIGenerate = async (cakeId: string, isRegenerate: boolean = false) => {
    setActionLoading(cakeId);
    // Optimistically show generating state
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
          : `AI generated metadata for "${updated.name}"! Status remains Pending.`,
        type: "success",
      });
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

  // Bulk AI Generate: processes all ungenerated pending cakes sequentially
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
      if (stopBulkRef.current) {
        break;
      }
      const cake = ungenerated[i];
      setBulkState((prev) => ({ ...prev, current: i + 1 }));
      setActionLoading(cake.id);

      // Set card to generating
      setCakes((prev) =>
        prev.map((c) =>
          c.id === cake.id
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
        const updated = await generateCakeAI(cake.id);
        setCakes((prev) => prev.map((c) => (c.id === cake.id ? updated : c)));
        succ++;
        setBulkState((prev) => ({ ...prev, succeeded: succ }));
      } catch (err: any) {
        fail++;
        setBulkState((prev) => ({ ...prev, failed: fail }));
        setCakes((prev) =>
          prev.map((c) =>
            c.id === cake.id
              ? {
                  ...c,
                  ai_metadata: {
                    ...c.ai_metadata,
                    ai_status: "failed",
                    ai_error: err.message || "Failed",
                  },
                }
              : c
          )
        );
      } finally {
        setActionLoading(null);
      }
    }

    setBulkState((prev) => ({ ...prev, isRunning: false }));
    setFeedback({
      msg: `Batch AI Generation Complete: ${succ} succeeded, ${fail} failed. All remain strictly in Pending status.`,
      type: succ > 0 ? "success" : "error",
    });
  };

  const handleStopBulk = () => {
    stopBulkRef.current = true;
  };

  // Editing state handlers
  const startEditing = (cake: Cake) => {
    setEditingCakeId(cake.id);
    setEditForm({
      name: cake.name,
      flavour: cake.flavour,
      category_id: cake.category_id || "",
      description: cake.description,
      available_sizes: [...(cake.available_sizes || [])],
    });
    setNewSizeInput("");
  };

  const saveEdit = async (cakeId: string) => {
    setActionLoading(cakeId);
    try {
      const updated = await updateCakeDetails(cakeId, editForm);
      setCakes((prev) => prev.map((c) => (c.id === cakeId ? updated : c)));
      setEditingCakeId(null);
      setFeedback({ id: cakeId, msg: "Cake details successfully updated.", type: "success" });
    } catch (err: any) {
      setFeedback({ id: cakeId, msg: err.message, type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddSize = () => {
    if (!newSizeInput.trim()) return;
    const current = editForm.available_sizes || [];
    if (!current.includes(newSizeInput.trim())) {
      setEditForm({
        ...editForm,
        available_sizes: [...current, newSizeInput.trim()],
      });
    }
    setNewSizeInput("");
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    const current = editForm.available_sizes || [];
    setEditForm({
      ...editForm,
      available_sizes: current.filter((s) => s !== sizeToRemove),
    });
  };

  // Workflow actions
  const handleApprove = async (cakeId: string) => {
    setActionLoading(cakeId);
    try {
      await approveCake(cakeId);
      setCakes((prev) => prev.filter((c) => c.id !== cakeId));
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
      setCakes((prev) => prev.filter((c) => c.id !== cakeId));
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
      setCakes((prev) => prev.filter((c) => c.id !== cakeId));
      setFeedback({ id: cakeId, msg: "Cake published live! ISR revalidation triggered.", type: "success" });
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
      setCakes((prev) => prev.map((c) => (c.id === cakeId ? updated : c)));
      setFeedback({ id: cakeId, msg: "Image reprocessed on studio white canvas successfully!", type: "success" });
    } catch (err: any) {
      setFeedback({ id: cakeId, msg: err.message, type: "error" });
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
          gap: "0.75rem",
        }}
      >
        <div>
          <span className="cake-category-badge">Human Review Atelier</span>
          <h1 style={{ fontSize: "1.45rem", color: "var(--text-primary)", fontWeight: 700, margin: "0.15rem 0" }}>
            Pending Approval Queue ({cakes.length})
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>
            AI analyzes processed cake images to suggest metadata. AI never publishes — human approval strictly required.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          {/* BULK AI GENERATE BUTTON */}
          <button
            onClick={handleGenerateAllWithAI}
            disabled={bulkState.isRunning || ungeneratedCount === 0}
            className="btn-gold"
            style={{
              padding: "0.45rem 0.95rem",
              fontSize: "0.8rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              opacity: ungeneratedCount === 0 ? 0.6 : 1,
              cursor: ungeneratedCount === 0 ? "not-allowed" : "pointer",
            }}
            id="btn-generate-all-ai"
          >
            ✨ Generate All with AI {ungeneratedCount > 0 ? `(${ungeneratedCount})` : ""}
          </button>

          <button onClick={loadData} className="btn-outline-gold" style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem" }}>
            🔄 Refresh
          </button>
          <Link href="/admin/upload" className="btn-outline-gold" style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem" }}>
            + Bulk Upload
          </Link>
        </div>
      </div>

      {/* BULK GENERATION PROGRESS BAR */}
      {bulkState.isRunning && (
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--gold-border)",
            borderRadius: "var(--radius-md)",
            padding: "0.85rem 1.15rem",
            marginBottom: "1.25rem",
            boxShadow: "var(--shadow-xs)",
          }}
          id="bulk-progress-panel"
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.45rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1rem" }}>⚡</span>
              <span style={{ fontWeight: 600, fontSize: "0.86rem", color: "var(--text-primary)" }}>
                Generating {bulkState.current} / {bulkState.total} with AI...
              </span>
            </div>
            <div style={{ display: "flex", gap: "0.85rem", alignItems: "center", fontSize: "0.78rem" }}>
              <span style={{ color: "#047857", fontWeight: 600 }}>✓ {bulkState.succeeded} Succeeded</span>
              {bulkState.failed > 0 && <span style={{ color: "#B91C1C", fontWeight: 600 }}>✕ {bulkState.failed} Failed</span>}
              <button
                onClick={handleStopBulk}
                style={{
                  background: "#FEE2E2",
                  color: "#991B1B",
                  border: "1px solid #FECACA",
                  borderRadius: "var(--radius-xs)",
                  padding: "0.2rem 0.55rem",
                  fontSize: "0.72rem",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                ⏹ Stop
              </button>
            </div>
          </div>
          {/* Progress track */}
          <div
            style={{
              width: "100%",
              height: "7px",
              background: "var(--bg-cream)",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${bulkState.total > 0 ? (bulkState.current / bulkState.total) * 100 : 0}%`,
                height: "100%",
                background: "linear-gradient(90deg, var(--gold) 0%, var(--gold-dark) 100%)",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      )}

      {/* Alert / Feedback message */}
      {feedback && (
        <div
          style={{
            padding: "0.6rem 0.95rem",
            borderRadius: "var(--radius-sm)",
            marginBottom: "1rem",
            background: feedback.type === "success" ? "#D1FAE5" : feedback.type === "info" ? "#EFF6FF" : "#FEE2E2",
            border: feedback.type === "success" ? "1px solid #A7F3D0" : feedback.type === "info" ? "1px solid #BFDBFE" : "1px solid #FECACA",
            color: feedback.type === "success" ? "#065F46" : feedback.type === "info" ? "#1D4ED8" : "#991B1B",
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
            No pending cakes in queue.
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>
            All confections have been approved or rejected. Upload new cake photos to trigger review.
          </p>
          <Link href="/admin/upload" className="btn-gold" style={{ padding: "0.5rem 1.1rem", fontSize: "0.82rem" }}>
            Upload Cake Images
          </Link>
        </div>
      )}

      {/* Pending Cakes List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {cakes.map((cake) => {
          const isEditing = editingCakeId === cake.id;
          const isBusy = actionLoading === cake.id;
          const aiStatus = getAiStatus(cake);

          return (
            <div
              key={cake.id}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "1rem",
                boxShadow: "var(--shadow-xs)",
                transition: "border-color 0.2s ease",
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
                          borderRadius: "var(--radius-sm)",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          color: "var(--gold-dark)",
                        }}
                      >
                        Analyzing...
                      </div>
                    )}
                  </div>

                  {/* Status Pills */}
                  <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                    <span className="badge-status badge-pending">Pending Approval</span>
                    
                    {/* AI Status Badge */}
                    {aiStatus === "not_generated" && (
                      <span className="badge-ai-not-generated" id={`ai-status-${cake.id}`}>
                        ● Not Generated
                      </span>
                    )}
                    {aiStatus === "generating" && (
                      <span className="badge-ai-generating" id={`ai-status-${cake.id}`}>
                        ⏳ Generating AI...
                      </span>
                    )}
                    {aiStatus === "generated" && (
                      <span className="badge-ai-generated" id={`ai-status-${cake.id}`}>
                        ✓ AI Generated
                      </span>
                    )}
                    {aiStatus === "failed" && (
                      <span className="badge-ai-failed" id={`ai-status-${cake.id}`}>
                        ✕ AI Failed
                      </span>
                    )}
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

                {/* Middle & Right: Metadata or Inline Editor */}
                <div style={{ flex: 1 }}>
                  {isEditing ? (
                    /* EDIT MODE */
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }} id={`edit-form-${cake.id}`}>
                      <div>
                        <label className="form-label" style={{ fontSize: "0.75rem", marginBottom: "0.2rem" }}>
                          Cake Name:
                        </label>
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
                          <label className="form-label" style={{ fontSize: "0.75rem", marginBottom: "0.2rem" }}>
                            Flavour Note:
                          </label>
                          <input
                            type="text"
                            value={editForm.flavour || ""}
                            onChange={(e) => setEditForm({ ...editForm, flavour: e.target.value })}
                            className="form-input"
                            style={{ padding: "0.45rem 0.75rem", fontSize: "0.85rem" }}
                          />
                        </div>
                        <div>
                          <label className="form-label" style={{ fontSize: "0.75rem", marginBottom: "0.2rem" }}>
                            Category:
                          </label>
                          <select
                            value={editForm.category_id || ""}
                            onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })}
                            className="form-select"
                            style={{ padding: "0.45rem 0.75rem", fontSize: "0.85rem" }}
                          >
                            <option value="">Needs Review / Select Category</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="form-label" style={{ fontSize: "0.75rem", marginBottom: "0.2rem" }}>
                          Description:
                        </label>
                        <textarea
                          rows={2}
                          value={editForm.description || ""}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="form-textarea"
                          style={{ padding: "0.45rem 0.75rem", fontSize: "0.85rem" }}
                        />
                      </div>

                      {/* Interactive Available Sizes */}
                      <div>
                        <label className="form-label" style={{ fontSize: "0.75rem", marginBottom: "0.2rem" }}>
                          Available Sizes (Admin Configurable):
                        </label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.4rem" }}>
                          {editForm.available_sizes?.map((sz, sIdx) => (
                            <span
                              key={sIdx}
                              className="cake-size-pill"
                              style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                            >
                              {sz}
                              <button
                                type="button"
                                onClick={() => handleRemoveSize(sz)}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: "#991B1B",
                                  cursor: "pointer",
                                  padding: 0,
                                  fontSize: "0.7rem",
                                  fontWeight: 700,
                                }}
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
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSize())}
                            className="form-input"
                            style={{ padding: "0.35rem 0.6rem", fontSize: "0.78rem", maxWidth: "200px" }}
                          />
                          <button
                            type="button"
                            onClick={handleAddSize}
                            className="btn-outline-gold"
                            style={{ padding: "0.35rem 0.65rem", fontSize: "0.75rem" }}
                          >
                            + Add Size
                          </button>
                        </div>
                      </div>

                      {/* Save / Cancel */}
                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.35rem" }}>
                        <button
                          onClick={() => saveEdit(cake.id)}
                          disabled={isBusy}
                          className="btn-gold"
                          style={{ padding: "0.4rem 0.95rem", fontSize: "0.78rem" }}
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
                    /* VIEW MODE WITH AI METADATA */
                    <div>
                      {/* Category & Name Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.35rem" }}>
                        <div>
                          <span
                            style={{
                              fontSize: "0.68rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              color: cake.category_name ? "var(--gold-dark)" : "#B45309",
                              fontWeight: 700,
                            }}
                          >
                            {cake.category_name || (cake.ai_metadata?.suggested_category) || "Needs Review"}
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

                      {/* Flavour */}
                      <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontStyle: "italic", marginBottom: "0.5rem" }}>
                        ✨ <span style={{ fontWeight: 600 }}>Flavour:</span> {cake.flavour}
                      </div>

                      {/* Description Box */}
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
                        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Description: </span>
                        {cake.description || "No description provided."}
                      </div>

                      {/* Available Sizes */}
                      <div style={{ marginBottom: "0.85rem" }}>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>
                          Available Sizes:
                        </span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                          {cake.available_sizes?.map((sz, idx) => (
                            <span key={idx} className="cake-size-pill">
                              {sz}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Error details if failed */}
                      {aiStatus === "failed" && cake.ai_metadata?.ai_error && (
                        <div
                          style={{
                            background: "#FEF2F2",
                            border: "1px solid #FECACA",
                            borderRadius: "var(--radius-xs)",
                            padding: "0.4rem 0.65rem",
                            fontSize: "0.75rem",
                            color: "#991B1B",
                            marginBottom: "0.65rem",
                          }}
                        >
                          ⚠️ AI Error: {cake.ai_metadata.ai_error}
                        </div>
                      )}

                      {/* Action Buttons Toolbar */}
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                        {/* 1. NOT GENERATED: Prominent AI Generate Button */}
                        {aiStatus === "not_generated" && (
                          <button
                            onClick={() => handleAIGenerate(cake.id, false)}
                            disabled={isBusy}
                            className="btn-gold"
                            style={{
                              padding: "0.4rem 0.85rem",
                              fontSize: "0.78rem",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.35rem",
                            }}
                            id={`btn-ai-generate-${cake.id}`}
                          >
                            ✨ AI Generate
                          </button>
                        )}

                        {/* 2. GENERATING: Loading state */}
                        {aiStatus === "generating" && (
                          <button
                            disabled
                            style={{
                              background: "#EFF6FF",
                              border: "1px solid #BFDBFE",
                              color: "#1D4ED8",
                              padding: "0.4rem 0.85rem",
                              borderRadius: "var(--radius-full)",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                            }}
                          >
                            ⏳ Analyzing Image...
                          </button>
                        )}

                        {/* 3. GENERATED: Regenerate AI Button */}
                        {aiStatus === "generated" && (
                          <button
                            onClick={() => handleAIGenerate(cake.id, true)}
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
                            id={`btn-ai-regenerate-${cake.id}`}
                          >
                            ✨ Regenerate AI
                          </button>
                        )}

                        {/* 4. FAILED: Retry AI Button */}
                        {aiStatus === "failed" && (
                          <button
                            onClick={() => handleAIGenerate(cake.id, false)}
                            disabled={isBusy}
                            style={{
                              background: "#FEF2F2",
                              border: "1px solid #FECACA",
                              color: "#B91C1C",
                              padding: "0.4rem 0.85rem",
                              borderRadius: "var(--radius-full)",
                              fontSize: "0.78rem",
                              cursor: "pointer",
                              fontWeight: 600,
                            }}
                            id={`btn-ai-retry-${cake.id}`}
                          >
                            ↻ Retry AI
                          </button>
                        )}

                        {/* Workflow Actions: Approve, Publish, Reject */}
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
