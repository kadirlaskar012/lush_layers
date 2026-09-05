"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getAdminCakes, publishCake, unpublishCake, rejectCake } from "../../../../lib/api";
import { Cake } from "../../../../lib/types";
import { RotateCw, ArrowUpRight, CheckCircle2, Sparkles, Undo2, Send, ArchiveX } from "lucide-react";

export default function ApprovedCakesPage() {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [filterTab, setFilterTab] = useState<"all" | "approved" | "published">("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadApproved = async () => {
    setLoading(true);
    try {
      // getAdminCakes("approved") fetches both approved (staged) and published cakes
      const data = await getAdminCakes("approved");
      setCakes(data);
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
          <span className="cake-category-badge">Quality Assurance Atelier</span>
          <h1 style={{ fontSize: "1.45rem", color: "var(--text-primary)", fontWeight: 700, margin: "0.1rem 0" }}>
            Approved & Published Confections ({cakes.length})
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>
            Cakes that have successfully passed human review. Staged cakes are ready for release; published cakes are live on storefront.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={loadApproved} className="btn-outline-gold icon-hover-rotate" style={{ padding: "0.42rem 0.85rem", fontSize: "0.78rem", gap: "0.35rem" }}>
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

      {/* Filter Tabs Toolbar */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "0.65rem 0.95rem",
          marginBottom: "1.25rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
          boxShadow: "var(--shadow-xs)",
        }}
      >
        <div style={{ display: "flex", gap: "0.35rem" }}>
          <button
            onClick={() => setFilterTab("all")}
            style={{
              background: filterTab === "all" ? "var(--gold)" : "var(--bg-cream)",
              border: filterTab === "all" ? "1px solid var(--gold)" : "1px solid var(--border-subtle)",
              color: filterTab === "all" ? "#FFFFFF" : "var(--text-secondary)",
              padding: "0.28rem 0.75rem",
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
              background: filterTab === "approved" ? "#10B981" : "var(--bg-cream)",
              border: filterTab === "approved" ? "1px solid #10B981" : "1px solid var(--border-subtle)",
              color: filterTab === "approved" ? "#FFFFFF" : "var(--text-secondary)",
              padding: "0.28rem 0.75rem",
              borderRadius: "var(--radius-full)",
              fontSize: "0.75rem",
              fontWeight: filterTab === "approved" ? 600 : 500,
              cursor: "pointer",
            }}
          >
            Staged Ready ({stagedCakes.length})
          </button>
          <button
            onClick={() => setFilterTab("published")}
            style={{
              background: filterTab === "published" ? "#1E40AF" : "var(--bg-cream)",
              border: filterTab === "published" ? "1px solid #1E40AF" : "1px solid var(--border-subtle)",
              color: filterTab === "published" ? "#FFFFFF" : "var(--text-secondary)",
              padding: "0.28rem 0.75rem",
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

      {/* Grid of Approved Cakes - Compact & Dense */}
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
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
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
                  {/* Top bar with Status Badge */}
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

                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      {cake.category_name || "Haute"}
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
                </div>

                {/* Actions Toolbar */}
                <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "0.55rem", display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
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
    </div>
  );
}
