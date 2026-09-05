"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAdminCakes,
  approveCake,
  publishCake,
  rejectCake,
  deleteCake,
} from "../../../lib/api";
import { Cake } from "../../../lib/types";
import { Zap, Clock } from "lucide-react";

export default function AdminCakesManagementPage() {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchCakes = async () => {
    setIsLoading(true);
    try {
      const data = await getAdminCakes(
        statusFilter === "all" ? undefined : statusFilter,
        searchQuery || undefined
      );
      setCakes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCakes();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCakes();
  };

  const handlePublish = async (cakeId: string) => {
    setActionLoading(cakeId);
    try {
      await publishCake(cakeId);
      fetchCakes();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (cakeId: string) => {
    setActionLoading(cakeId);
    try {
      await approveCake(cakeId);
      fetchCakes();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (cakeId: string) => {
    setActionLoading(cakeId);
    try {
      await rejectCake(cakeId);
      fetchCakes();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (cakeId: string) => {
    if (!confirm("Are you sure you want to delete this cake?")) return;
    setActionLoading(cakeId);
    try {
      await deleteCake(cakeId);
      fetchCakes();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div id="admin-cakes-management-view">
      {/* Top Header - Compact */}
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
          <span className="cake-category-badge">Catalog Atelier</span>
          <h1 style={{ fontSize: "1.5rem", color: "var(--text-primary)", fontWeight: 700 }}>
            Cake Catalog Management ({cakes.length})
          </h1>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Link href="/admin/upload" className="btn-gold icon-hover-lift" style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
            <Zap size={14} />
            <span>Bulk Upload</span>
          </Link>
          <Link href="/admin/cakes/pending" className="btn-outline-gold icon-hover-slide" style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
            <Clock size={14} />
            <span>Pending Queue</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar - Compact */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "0.85rem 1rem",
          marginBottom: "1.25rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
          boxShadow: "var(--shadow-xs)",
        }}
      >
        {/* Status Pills */}
        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
          {["all", "pending", "approved", "published", "rejected"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                background: statusFilter === st ? "var(--gold)" : "var(--bg-cream)",
                border: statusFilter === st ? "1px solid var(--gold)" : "1px solid var(--border-subtle)",
                color: statusFilter === st ? "#FFFFFF" : "var(--text-secondary)",
                padding: "0.3rem 0.75rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.75rem",
                fontWeight: statusFilter === st ? 600 : 500,
                textTransform: "capitalize",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.4rem" }}>
          <input
            type="text"
            placeholder="Search cake name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ width: "200px", padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}
          />
          <button type="submit" className="btn-gold" style={{ padding: "0.35rem 0.75rem", fontSize: "0.78rem" }}>
            Filter
          </button>
        </form>
      </div>

      {/* Desktop Table View */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          boxShadow: "var(--shadow-xs)",
        }}
        className="admin-desktop-table-wrap"
      >
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.82rem" }}>
          <thead>
            <tr style={{ background: "var(--bg-cream)", borderBottom: "1px solid var(--border-subtle)" }}>
              <th style={{ padding: "0.65rem 0.85rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", fontSize: "0.68rem" }}>Photo</th>
              <th style={{ padding: "0.65rem 0.85rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", fontSize: "0.68rem" }}>Cake Name</th>
              <th style={{ padding: "0.65rem 0.85rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", fontSize: "0.68rem" }}>Category</th>
              <th style={{ padding: "0.65rem 0.85rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", fontSize: "0.68rem" }}>Flavour</th>
              <th style={{ padding: "0.65rem 0.85rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", fontSize: "0.68rem" }}>Status</th>
              <th style={{ padding: "0.65rem 0.85rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", fontSize: "0.68rem", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cakes.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
                  No cakes found for this filter.
                </td>
              </tr>
            ) : (
              cakes.map((cake) => {
                const isBusy = actionLoading === cake.id;
                return (
                  <tr key={cake.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "0.6rem 0.85rem" }}>
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "var(--radius-xs)",
                          background: "#FFFFFF",
                          border: "1px solid var(--border-subtle)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cake.image_url}
                          alt={cake.name}
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      </div>
                    </td>
                    <td style={{ padding: "0.6rem 0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                      <Link href={`/cakes/${cake.slug}`} target="_blank" style={{ color: "inherit", textDecoration: "none" }}>
                        {cake.name}
                      </Link>
                    </td>
                    <td style={{ padding: "0.6rem 0.85rem", color: "var(--text-secondary)" }}>
                      {cake.category_name || "—"}
                    </td>
                    <td style={{ padding: "0.6rem 0.85rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
                      {cake.flavour}
                    </td>
                    <td style={{ padding: "0.6rem 0.85rem" }}>
                      <span
                        className={`badge-status ${
                          cake.status === "published"
                            ? "badge-published"
                            : cake.status === "pending"
                            ? "badge-pending"
                            : cake.status === "approved"
                            ? "badge-approved"
                            : "badge-rejected"
                        }`}
                      >
                        {cake.status}
                      </span>
                    </td>
                    <td style={{ padding: "0.6rem 0.85rem", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "0.3rem", justifyContent: "flex-end" }}>
                        {cake.status !== "published" && (
                          <button
                            onClick={() => handlePublish(cake.id)}
                            disabled={isBusy}
                            style={{
                              background: "var(--gold-subtle)",
                              border: "1px solid var(--gold-border)",
                              color: "var(--gold-dark)",
                              padding: "0.25rem 0.55rem",
                              borderRadius: "var(--radius-xs)",
                              fontSize: "0.72rem",
                              cursor: "pointer",
                              fontWeight: 600,
                            }}
                          >
                            Publish
                          </button>
                        )}
                        {cake.status === "pending" && (
                          <button
                            onClick={() => handleApprove(cake.id)}
                            disabled={isBusy}
                            style={{
                              background: "#ECFDF5",
                              border: "1px solid #A7F3D0",
                              color: "#065F46",
                              padding: "0.25rem 0.55rem",
                              borderRadius: "var(--radius-xs)",
                              fontSize: "0.72rem",
                              cursor: "pointer",
                              fontWeight: 600,
                            }}
                          >
                            Approve
                          </button>
                        )}
                        {cake.status !== "rejected" && (
                          <button
                            onClick={() => handleReject(cake.id)}
                            disabled={isBusy}
                            style={{
                              background: "#FEF2F2",
                              border: "1px solid #FECACA",
                              color: "#991B1B",
                              padding: "0.25rem 0.55rem",
                              borderRadius: "var(--radius-xs)",
                              fontSize: "0.72rem",
                              cursor: "pointer",
                            }}
                          >
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(cake.id)}
                          disabled={isBusy}
                          style={{
                            background: "var(--bg-cream)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-muted)",
                            padding: "0.25rem 0.55rem",
                            borderRadius: "var(--radius-xs)",
                            fontSize: "0.72rem",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Compact Cards List (Visible on Small Screens) */}
      <div className="admin-mobile-cards-list" style={{ display: "none", flexDirection: "column", gap: "0.75rem" }}>
        {cakes.map((cake) => {
          const isBusy = actionLoading === cake.id;
          return (
            <div
              key={cake.id}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "0.85rem",
                boxShadow: "var(--shadow-xs)",
              }}
            >
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "0.6rem" }}>
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "var(--radius-xs)",
                    background: "#FFFFFF",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
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
                  <span style={{ fontSize: "0.65rem", textTransform: "uppercase", color: "var(--gold-dark)", fontWeight: 700 }}>
                    {cake.category_name || "Uncategorized"}
                  </span>
                  <h4 style={{ fontSize: "0.92rem", color: "var(--text-primary)", margin: "0.1rem 0", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {cake.name}
                  </h4>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontStyle: "italic", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {cake.flavour}
                  </p>
                </div>
                <span
                  className={`badge-status ${
                    cake.status === "published"
                      ? "badge-published"
                      : cake.status === "pending"
                      ? "badge-pending"
                      : cake.status === "approved"
                      ? "badge-approved"
                      : "badge-rejected"
                  }`}
                >
                  {cake.status}
                </span>
              </div>

              {/* Mobile Actions */}
              <div style={{ display: "flex", gap: "0.35rem", borderTop: "1px solid var(--border-light)", paddingTop: "0.5rem" }}>
                {cake.status !== "published" && (
                  <button
                    onClick={() => handlePublish(cake.id)}
                    disabled={isBusy}
                    className="btn-gold"
                    style={{ flex: 1, padding: "0.3rem 0.5rem", fontSize: "0.72rem", justifyContent: "center" }}
                  >
                    Publish Live
                  </button>
                )}
                {cake.status === "pending" && (
                  <button
                    onClick={() => handleApprove(cake.id)}
                    disabled={isBusy}
                    style={{
                      flex: 1,
                      background: "#ECFDF5",
                      border: "1px solid #A7F3D0",
                      color: "#065F46",
                      padding: "0.3rem 0.5rem",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Approve
                  </button>
                )}
                {cake.status !== "rejected" && (
                  <button
                    onClick={() => handleReject(cake.id)}
                    disabled={isBusy}
                    style={{
                      background: "#FEF2F2",
                      border: "1px solid #FECACA",
                      color: "#991B1B",
                      padding: "0.3rem 0.55rem",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.72rem",
                      cursor: "pointer",
                    }}
                  >
                    Reject
                  </button>
                )}
                <button
                  onClick={() => handleDelete(cake.id)}
                  disabled={isBusy}
                  style={{
                    background: "var(--bg-cream)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-muted)",
                    padding: "0.3rem 0.55rem",
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.72rem",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .admin-desktop-table-wrap {
            display: none !important;
          }
          .admin-mobile-cards-list {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
