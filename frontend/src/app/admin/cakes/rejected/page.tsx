"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getAdminCakes, restoreCake, deleteCake } from "../../../../lib/api";
import { Cake } from "../../../../lib/types";
import { RotateCw, ArrowUpRight, CheckCircle2, ArchiveX, Undo2, Trash2, X } from "lucide-react";

export default function RejectedCakesPage() {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedCake, setSelectedCake] = useState<Cake | null>(null);

  const loadRejected = async () => {
    setLoading(true);
    try {
      const data = await getAdminCakes("rejected");
      setCakes(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRejected();
  }, []);

  const handleRestore = async (id: string, name: string) => {
    setActionLoading(id);
    try {
      await restoreCake(id);
      setCakes((prev) => prev.filter((c) => c.id !== id));
      setFeedback(`"${name}" restored to Pending Approval queue!`);
      setTimeout(() => setFeedback(null), 3500);
      if (selectedCake?.id === id) setSelectedCake(null);
    } catch (e: any) {
      alert(e.message || "Failed to restore cake");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"? This cannot be undone.`)) return;
    setActionLoading(id);
    try {
      await deleteCake(id);
      setCakes((prev) => prev.filter((c) => c.id !== id));
      setFeedback(`"${name}" permanently deleted.`);
      setTimeout(() => setFeedback(null), 3500);
      if (selectedCake?.id === id) setSelectedCake(null);
    } catch (e: any) {
      alert(e.message || "Failed to delete cake");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div id="rejected-cakes-view">
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
          <span className="cake-category-badge">Archival Atelier</span>
          <h1 style={{ fontSize: "1.45rem", color: "var(--text-primary)", fontWeight: 700, margin: "0.1rem 0" }}>
            Rejected Cakes Archive ({cakes.length})
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>
            Confections set aside during human moderation. Restore back to review or permanently delete.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={loadRejected} className="btn-outline-gold icon-hover-rotate" style={{ padding: "0.42rem 0.85rem", fontSize: "0.78rem", gap: "0.35rem" }}>
            <RotateCw size={13} />
            <span>Refresh</span>
          </button>
          <Link href="/admin/cakes/pending" className="btn-outline-gold icon-hover-slide" style={{ padding: "0.42rem 0.85rem", fontSize: "0.78rem", gap: "0.3rem" }}>
            <span>Pending Queue</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            padding: "0.5rem 0.85rem",
            borderRadius: "var(--radius-sm)",
            background: "#D1FAE5",
            border: "1px solid #A7F3D0",
            color: "#065F46",
            fontSize: "0.82rem",
            marginBottom: "1rem",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <CheckCircle2 size={15} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Compact List / Table View */}
      {cakes.length === 0 && !loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem 1.5rem",
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-md)",
            border: "1px dashed var(--border-subtle)",
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
              color: "#991B1B",
            }}
          >
            <ArchiveX size={24} />
          </div>
          <h3 style={{ fontSize: "1.15rem", color: "var(--text-primary)", marginBottom: "0.25rem" }}>
            No cakes in rejected archive
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
            All rejected confections have been cleaned or restored.
          </p>
        </div>
      ) : (
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "0.82rem",
              }}
            >
              <thead>
                <tr style={{ background: "var(--bg-cream)", borderBottom: "1px solid var(--border-subtle)" }}>
                  <th style={{ padding: "0.65rem 0.85rem", color: "var(--text-primary)", fontWeight: 600 }}>Thumbnail</th>
                  <th style={{ padding: "0.65rem 0.85rem", color: "var(--text-primary)", fontWeight: 600 }}>Confection Name</th>
                  <th style={{ padding: "0.65rem 0.85rem", color: "var(--text-primary)", fontWeight: 600 }}>Flavour Notes</th>
                  <th style={{ padding: "0.65rem 0.85rem", color: "var(--text-primary)", fontWeight: 600 }}>Category</th>
                  <th style={{ padding: "0.65rem 0.85rem", color: "var(--text-primary)", fontWeight: 600 }}>Archived Date</th>
                  <th style={{ padding: "0.65rem 0.85rem", color: "var(--text-primary)", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "0.65rem 0.85rem", color: "var(--text-primary)", fontWeight: 600, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cakes.map((cake) => {
                  const isBusy = actionLoading === cake.id;

                  return (
                    <tr
                      key={cake.id}
                      style={{
                        borderBottom: "1px solid var(--border-light)",
                        transition: "background 0.15s",
                      }}
                      className="admin-table-row"
                    >
                      {/* Compact Thumbnail (48x48 max) */}
                      <td style={{ padding: "0.55rem 0.85rem" }}>
                        <div
                          onClick={() => setSelectedCake(cake)}
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "var(--radius-xs)",
                            background: "#FFFFFF",
                            border: "1px solid var(--border-subtle)",
                            padding: "2px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            overflow: "hidden",
                          }}
                          title="Click to view details"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={cake.image_url}
                            alt={cake.name}
                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                          />
                        </div>
                      </td>

                      {/* Name */}
                      <td style={{ padding: "0.55rem 0.85rem" }}>
                        <div
                          onClick={() => setSelectedCake(cake)}
                          style={{ fontWeight: 600, color: "var(--text-primary)", cursor: "pointer" }}
                        >
                          {cake.name}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                          Slug: {cake.slug}
                        </div>
                      </td>

                      {/* Flavour */}
                      <td style={{ padding: "0.55rem 0.85rem", maxWidth: "200px" }}>
                        <div style={{ fontStyle: "italic", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {cake.flavour || "—"}
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: "0.55rem 0.85rem" }}>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                          {cake.category_name || "Uncategorized"}
                        </span>
                      </td>

                      {/* Date */}
                      <td style={{ padding: "0.55rem 0.85rem", whiteSpace: "nowrap", color: "var(--text-muted)", fontSize: "0.74rem" }}>
                        {new Date(cake.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "0.55rem 0.85rem" }}>
                        <span
                          style={{
                            fontSize: "0.68rem",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            padding: "0.15rem 0.45rem",
                            borderRadius: "var(--radius-full)",
                            background: "#FEE2E2",
                            color: "#991B1B",
                            border: "1px solid #FECACA",
                          }}
                        >
                          REJECTED
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "0.55rem 0.85rem", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "0.35rem" }}>
                          <button
                            onClick={() => handleRestore(cake.id, cake.name)}
                            disabled={isBusy}
                            className="btn-outline-gold icon-hover-rotate"
                            style={{ padding: "0.28rem 0.65rem", fontSize: "0.74rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                            title="Restore cake to Pending Approval queue"
                          >
                            <Undo2 size={12} />
                            <span>Restore</span>
                          </button>
                          <button
                            onClick={() => handleDelete(cake.id, cake.name)}
                            disabled={isBusy}
                            className="icon-hover-lift"
                            style={{
                              background: "#FEF2F2",
                              border: "1px solid #FECACA",
                              color: "#991B1B",
                              borderRadius: "var(--radius-full)",
                              padding: "0.28rem 0.65rem",
                              fontSize: "0.74rem",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.25rem",
                            }}
                            title="Delete permanently from database"
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Compact Details Modal/Drawer */}
      {selectedCake && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedCake(null)}
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
              maxWidth: "420px",
              width: "100%",
              padding: "1.25rem",
              boxShadow: "var(--shadow-lg)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Cake Archival Inspection
              </h3>
              <button
                onClick={() => setSelectedCake(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", padding: "4px" }}
                className="icon-hover-rotate"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                width: "100%",
                aspectRatio: "1/1",
                background: "#FFFFFF",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-light)",
                padding: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "0.85rem",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedCake.image_url}
                alt={selectedCake.name}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>

            <h4 style={{ fontSize: "1rem", color: "var(--text-primary)", margin: "0 0 0.25rem", fontWeight: 600 }}>
              {selectedCake.name}
            </h4>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontStyle: "italic", margin: "0 0 0.6rem" }}>
              {selectedCake.flavour}
            </p>
            <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.4, margin: "0 0 1rem" }}>
              {selectedCake.description}
            </p>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => handleRestore(selectedCake.id, selectedCake.name)}
                className="btn-gold"
                style={{ flex: 1, padding: "0.45rem", fontSize: "0.8rem", justifyContent: "center" }}
              >
                ↩ Restore to Pending
              </button>
              <button
                onClick={() => handleDelete(selectedCake.id, selectedCake.name)}
                style={{
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  color: "#991B1B",
                  borderRadius: "var(--radius-full)",
                  padding: "0.45rem 0.85rem",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
