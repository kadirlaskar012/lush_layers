"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  getDuplicateCakes,
  dismissCakeDuplicate,
  deleteCake,
} from "../../../../lib/api";
import { Cake } from "../../../../lib/types";
import { getCakeDisplayId } from "../../../../lib/cakeHelper";
import { getOptimizedImageUrl } from "../../../../lib/imageHelper";
import {
  Copy,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Search,
  ExternalLink,
  Clock,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

export default function DuplicateCakesPage() {
  const [duplicateCakes, setDuplicateCakes] = useState<Cake[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

  const loadDuplicates = async () => {
    setIsLoading(true);
    try {
      const data = await getDuplicateCakes();
      setDuplicateCakes(data);
    } catch (err) {
      console.error("Failed to load duplicate cakes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDuplicates();
  }, []);

  const handleDismiss = async (cake: Cake) => {
    const displayId = cake.display_id || getCakeDisplayId(cake);
    setActionLoading(cake.id);
    try {
      await dismissCakeDuplicate(cake.id);
      setDuplicateCakes((prev) => prev.filter((c) => c.id !== cake.id));
      setFeedback({
        msg: `✓ Verified as unique! Cake #${displayId} (${cake.name}) moved to Pending Approval queue.`,
        type: "success",
      });
      setTimeout(() => setFeedback(null), 4500);
    } catch (err: any) {
      setFeedback({ msg: err.message || "Failed to dismiss duplicate.", type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (cake: Cake) => {
    const displayId = cake.display_id || getCakeDisplayId(cake);
    if (!confirm(`Are you sure you want to permanently delete suspected duplicate Cake #${displayId} (${cake.name}) from database and storage?`)) {
      return;
    }

    setActionLoading(cake.id);
    try {
      await deleteCake(cake.id);
      setDuplicateCakes((prev) => prev.filter((c) => c.id !== cake.id));
      setFeedback({
        msg: `🗑️ Duplicate cake #${displayId} deleted from database and storage.`,
        type: "info",
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ msg: err.message || "Failed to delete duplicate.", type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  // Filter pairs by search query (supports matching by #1001, title, etc.)
  const filteredDuplicates = useMemo(() => {
    if (!searchQuery.trim()) return duplicateCakes;
    const q = searchQuery.trim().toLowerCase().replace(/^#/, "");
    return duplicateCakes.filter((cake) => {
      const dId = (cake.display_id || getCakeDisplayId(cake)).toLowerCase();
      const origDId = (cake.duplicate_of_display_id || "").toLowerCase();
      const name = (cake.name || "").toLowerCase();
      const origName = (cake.duplicate_of_cake?.name || "").toLowerCase();
      return (
        dId.includes(q) ||
        origDId.includes(q) ||
        name.includes(q) ||
        origName.includes(q)
      );
    });
  }, [duplicateCakes, searchQuery]);

  return (
    <div id="admin-duplicate-cakes-view" style={{ maxWidth: "1280px", margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.25rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#B45309",
                background: "#FEF3C7",
                padding: "0.15rem 0.55rem",
                borderRadius: "var(--radius-full)",
                border: "1px solid #FDE68A",
              }}
            >
              Auditing & Integrity
            </span>
            <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
              • Duplicate Resolution Studio
            </span>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.55rem",
              color: "var(--text-primary)",
              fontWeight: 700,
              letterSpacing: "-0.01em",
              margin: 0,
            }}
          >
            Duplicate Review Queue ({duplicateCakes.length})
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            Cakes flagged with identical or near-identical image fingerprints during Python ingestion. Compare pairs side-by-side by ID to resolve.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={loadDuplicates}
            className="btn-outline-gold"
            style={{ padding: "0.45rem 0.85rem", fontSize: "0.78rem" }}
            disabled={isLoading}
          >
            <RefreshCw size={13} className={isLoading ? "spin" : ""} />
            <span>Refresh</span>
          </button>
          <Link
            href="/admin/cakes/pending"
            className="btn-gold"
            style={{ padding: "0.45rem 0.95rem", fontSize: "0.78rem" }}
          >
            <Clock size={13} />
            <span>Pending Approval Queue</span>
          </Link>
        </div>
      </div>

      {/* Toast Feedback */}
      {feedback && (
        <div
          style={{
            background: feedback.type === "success" ? "#ECFDF5" : feedback.type === "error" ? "#FEF2F2" : "#FFFBEB",
            border: `1px solid ${feedback.type === "success" ? "#A7F3D0" : feedback.type === "error" ? "#FECACA" : "#FDE68A"}`,
            color: feedback.type === "success" ? "#065F46" : feedback.type === "error" ? "#991B1B" : "#92400E",
            padding: "0.6rem 0.95rem",
            borderRadius: "var(--radius-md)",
            marginBottom: "1rem",
            fontSize: "0.82rem",
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertTriangle size={16} />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "0.65rem 0.9rem",
          marginBottom: "1.25rem",
          display: "flex",
          alignItems: "center",
          gap: "0.65rem",
        }}
      >
        <Search size={15} style={{ color: "var(--text-muted)" }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search pairs by Cake ID (e.g. #1001), original ID, or cake name..."
          style={{
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: "0.82rem",
            color: "var(--text-primary)",
            width: "100%",
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: "0.78rem",
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Content State */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--text-muted)" }}>
          <RefreshCw size={24} className="spin" style={{ margin: "0 auto 0.75rem", color: "var(--gold)" }} />
          <p style={{ fontSize: "0.9rem" }}>Auditing image fingerprints and checking for duplicate pairs...</p>
        </div>
      ) : filteredDuplicates.length === 0 ? (
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            padding: "3.5rem 1.5rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "#ECFDF5",
              color: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.25rem",
              color: "var(--text-primary)",
              marginBottom: "0.35rem",
            }}
          >
            {searchQuery ? "No matching duplicate pairs found" : "Catalog Image Integrity Clear"}
          </h2>
          <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", maxWidth: "460px", margin: "0 auto 1.25rem" }}>
            {searchQuery
              ? `No duplicate cake matched '${searchQuery}'. Try another ID or clear the search.`
              : "Zero suspected duplicates in queue! All cake photos ingested into the system are unique."}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "0.6rem" }}>
            <Link href="/admin/cakes" className="btn-outline-gold" style={{ fontSize: "0.82rem" }}>
              <span>View Master Catalog</span>
            </Link>
            <Link href="/admin/cakes/pending" className="btn-gold" style={{ fontSize: "0.82rem" }}>
              <span>Review Pending Cakes</span>
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {filteredDuplicates.map((cake) => {
            const displayId = cake.display_id || getCakeDisplayId(cake);
            const origCake = cake.duplicate_of_cake;
            const origDisplayId = cake.duplicate_of_display_id || (origCake ? origCake.display_id || getCakeDisplayId(origCake) : "Original");
            const score = cake.duplicate_score ? Math.round(cake.duplicate_score) : 100;
            const isExact = score >= 99;

            return (
              <div
                key={cake.id}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid #FDE68A",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "0 4px 16px rgba(245, 158, 11, 0.06)",
                  overflow: "hidden",
                }}
              >
                {/* Top Comparison Header Banner */}
                <div
                  style={{
                    background: "#FFFBEB",
                    borderBottom: "1px solid #FDE68A",
                    padding: "0.65rem 1.15rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        background: isExact ? "#EF4444" : "#F59E0B",
                        color: "#FFFFFF",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        padding: "0.15rem 0.55rem",
                        borderRadius: "var(--radius-full)",
                        letterSpacing: "0.03em",
                      }}
                    >
                      <Copy size={11} />
                      <span>{isExact ? "100% Exact File Match" : `${score}% Visual Match`}</span>
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "#92400E", fontWeight: 500 }}>
                      {cake.duplicate_reason || `Matched with existing catalog cake #${origDisplayId}`}
                    </span>
                  </div>

                  <span style={{ fontSize: "0.72rem", color: "#B45309" }}>
                    Uploaded: {new Date(cake.created_at).toLocaleString()}
                  </span>
                </div>

                {/* Side-By-Side Comparison Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "1.25rem",
                    padding: "1.15rem",
                  }}
                >
                  {/* Left Column: Newly Uploaded / Suspected Duplicate */}
                  <div
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-md)",
                      padding: "1rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: "#DC2626",
                          background: "#FEE2E2",
                          padding: "0.12rem 0.45rem",
                          borderRadius: "var(--radius-xs)",
                        }}
                      >
                        ⚠️ Suspected Duplicate
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          color: "var(--gold-dark)",
                        }}
                      >
                        #{displayId}
                      </span>
                    </div>

                    <div
                      style={{
                        width: "100%",
                        height: "200px",
                        background: "#FDFBF7",
                        borderRadius: "var(--radius-md)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getOptimizedImageUrl(cake.image_url, { width: 440 })}
                        alt={cake.name}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    </div>

                    <div>
                      <h3
                        style={{
                          fontFamily: "var(--font-heading)",
                          fontSize: "1.05rem",
                          color: "var(--text-primary)",
                          fontWeight: 700,
                          margin: "0 0 0.2rem",
                        }}
                      >
                        {cake.name}
                      </h3>
                      <p style={{ fontStyle: "italic", fontSize: "0.8rem", color: "var(--gold-dark)", margin: "0 0 0.4rem" }}>
                        {cake.flavour || "Vanilla Bean"}
                      </p>
                      <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                        Original File: <code>{cake.ai_metadata?.original_file || "Uploaded Photo"}</code>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Original Matched Cake in Catalog */}
                  <div
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid var(--gold-border)",
                      borderRadius: "var(--radius-md)",
                      padding: "1rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: "#059669",
                          background: "#D1FAE5",
                          padding: "0.12rem 0.45rem",
                          borderRadius: "var(--radius-xs)",
                        }}
                      >
                        ✓ Original Existing Cake
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          color: "var(--gold-dark)",
                        }}
                      >
                        #{origDisplayId}
                      </span>
                    </div>

                    <div
                      style={{
                        width: "100%",
                        height: "200px",
                        background: "#FDFBF7",
                        borderRadius: "var(--radius-md)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={origCake?.image_url ? getOptimizedImageUrl(origCake.image_url, { width: 440 }) : getOptimizedImageUrl(cake.image_url, { width: 440 })}
                        alt={origCake?.name || "Original Cake"}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                        <h3
                          style={{
                            fontFamily: "var(--font-heading)",
                            fontSize: "1.05rem",
                            color: "var(--text-primary)",
                            fontWeight: 700,
                            margin: "0 0 0.2rem",
                          }}
                        >
                          {origCake?.name || "Original Matched Confection"}
                        </h3>
                        {origCake?.slug && (
                          <Link
                            href={`/cakes/${origCake.slug}`}
                            target="_blank"
                            style={{
                              color: "var(--gold-dark)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.2rem",
                              fontSize: "0.72rem",
                              textDecoration: "none",
                            }}
                          >
                            <span>Live</span>
                            <ExternalLink size={12} />
                          </Link>
                        )}
                      </div>
                      <p style={{ fontStyle: "italic", fontSize: "0.8rem", color: "var(--gold-dark)", margin: "0 0 0.4rem" }}>
                        {origCake?.flavour || "Vanilla Bean"}
                      </p>
                      <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                        Catalog Status: <strong style={{ textTransform: "capitalize", color: "var(--text-primary)" }}>{origCake?.status || "published"}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Resolution Bar */}
                <div
                  style={{
                    background: "var(--bg-cream)",
                    borderTop: "1px solid var(--border-subtle)",
                    padding: "0.85rem 1.15rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                  }}
                >
                  <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                    <strong>Resolution Decision:</strong> Delete if redundant, or mark unique if this is an intentional new variety.
                  </div>

                  <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                    {/* Action 1: Delete Duplicate */}
                    <button
                      type="button"
                      onClick={() => handleDelete(cake)}
                      disabled={actionLoading === cake.id}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        padding: "0.45rem 0.95rem",
                        background: "#FEE2E2",
                        color: "#DC2626",
                        border: "1px solid #FECACA",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <Trash2 size={14} />
                      <span>Delete Duplicate</span>
                    </button>

                    {/* Action 2: Not Duplicate • Move to Approval */}
                    <button
                      type="button"
                      onClick={() => handleDismiss(cake)}
                      disabled={actionLoading === cake.id}
                      className="btn-gold"
                      style={{
                        padding: "0.45rem 1.15rem",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        boxShadow: "0 2px 6px rgba(184, 142, 62, 0.25)",
                      }}
                    >
                      <CheckCircle2 size={14} />
                      <span>Not Duplicate • Move to Approval</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
