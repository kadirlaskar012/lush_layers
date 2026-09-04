"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAdminCakes,
  approveCake,
  publishCake,
  rejectCake,
  deleteCake,
  updateCakeDetails,
} from "../../../lib/api";
import { Cake } from "../../../lib/types";

export default function AdminCakesManagementPage() {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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
    if (!confirm("Are you sure you want to permanently delete this confection?")) return;
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
      {/* Top Header */}
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
          <span className="cake-category-badge">Catalog Master</span>
          <h1 style={{ fontSize: "2.4rem", color: "var(--text-primary)" }}>
            Cake Catalog Management
          </h1>
        </div>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {/* View Toggle: Grid / List */}
          <div
            style={{
              display: "inline-flex",
              background: "var(--bg-card)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              padding: "2px",
            }}
          >
            <button
              onClick={() => setViewMode("grid")}
              style={{
                padding: "0.45rem 0.9rem",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: viewMode === "grid" ? "rgba(212,175,55,0.2)" : "transparent",
                color: viewMode === "grid" ? "var(--gold-light)" : "var(--text-muted)",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
              id="view-grid-btn"
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode("list")}
              style={{
                padding: "0.45rem 0.9rem",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: viewMode === "list" ? "rgba(212,175,55,0.2)" : "transparent",
                color: viewMode === "list" ? "var(--gold-light)" : "var(--text-muted)",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
              id="view-list-btn"
            >
              List View
            </button>
          </div>

          <Link href="/admin/upload" className="btn-gold" style={{ padding: "0.6rem 1.25rem" }}>
            + Bulk Upload
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div
        className="glass-card"
        style={{
          padding: "1.25rem 1.75rem",
          marginBottom: "2.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.25rem",
        }}
      >
        {/* Status Filter Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {["all", "pending", "approved", "published", "rejected"].map((st) => {
            const isActive = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: "0.5rem 1.1rem",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.85rem",
                  textTransform: "capitalize",
                  cursor: "pointer",
                  background: isActive ? "rgba(212,175,55,0.2)" : "rgba(255,255,255,0.03)",
                  border: isActive ? "1px solid var(--gold)" : "1px solid var(--border-subtle)",
                  color: isActive ? "var(--gold-light)" : "var(--text-secondary)",
                  fontWeight: isActive ? 600 : 400,
                }}
                id={`filter-tab-${st}`}
              >
                {st}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            placeholder="Search by title or flavour..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ width: "260px", padding: "0.5rem 1rem" }}
          />
          <button type="submit" className="btn-outline-gold" style={{ padding: "0.5rem 1rem" }}>
            Search
          </button>
        </form>
      </div>

      {/* Main Content: Grid View or List View */}
      {cakes.length === 0 && !isLoading ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            background: "var(--bg-surface)",
            border: "1px dashed var(--border-gold)",
            borderRadius: "var(--radius-md)",
          }}
        >
          No cakes found for this filter.
        </div>
      ) : viewMode === "grid" ? (
        // GRID VIEW
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "2rem",
          }}
          id="admin-cakes-grid"
        >
          {cakes.map((cake) => (
            <div
              key={cake.id}
              className="glass-card"
              style={{
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                style={{
                  background: "#FFFFFF",
                  height: "220px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "1rem",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cake.image_url}
                  alt={cake.name}
                  style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                />
              </div>

              <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                    <span className="cake-category-badge">{cake.category_name || "Bespoke"}</span>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "9999px",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        background:
                          cake.status === "published"
                            ? "rgba(212,175,55,0.2)"
                            : cake.status === "approved"
                            ? "rgba(16,185,129,0.15)"
                            : cake.status === "pending"
                            ? "rgba(245,158,11,0.15)"
                            : "rgba(239,68,68,0.15)",
                        color:
                          cake.status === "published"
                            ? "var(--gold-light)"
                            : cake.status === "approved"
                            ? "#34D399"
                            : cake.status === "pending"
                            ? "#FBBF24"
                            : "#F87171",
                      }}
                    >
                      {cake.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "1.15rem", color: "var(--text-primary)", marginBottom: "0.35rem" }}>
                    {cake.name}
                  </h3>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontStyle: "italic", marginBottom: "0.75rem" }}>
                    {cake.flavour}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "0.85rem", display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                  <Link
                    href={`/cakes/${cake.slug}`}
                    target="_blank"
                    className="btn-outline-gold"
                    style={{ padding: "0.4rem 0.75rem", fontSize: "0.75rem" }}
                  >
                    View ↗
                  </Link>

                  {cake.status !== "published" && (
                    <button
                      onClick={() => handlePublish(cake.id)}
                      disabled={actionLoading === cake.id}
                      className="btn-gold"
                      style={{ padding: "0.4rem 0.75rem", fontSize: "0.75rem" }}
                    >
                      Publish
                    </button>
                  )}

                  {cake.status === "pending" && (
                    <button
                      onClick={() => handleApprove(cake.id)}
                      disabled={actionLoading === cake.id}
                      className="btn-outline-gold"
                      style={{ padding: "0.4rem 0.75rem", fontSize: "0.75rem", borderColor: "#10B981", color: "#34D399" }}
                    >
                      Approve
                    </button>
                  )}

                  {cake.status !== "rejected" && (
                    <button
                      onClick={() => handleReject(cake.id)}
                      disabled={actionLoading === cake.id}
                      className="btn-outline-gold"
                      style={{ padding: "0.4rem 0.75rem", fontSize: "0.75rem", borderColor: "#EF4444", color: "#F87171" }}
                    >
                      Reject
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(cake.id)}
                    disabled={actionLoading === cake.id}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--text-muted)",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      padding: "0.4rem",
                    }}
                    title="Delete cake"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // LIST VIEW
        <div className="glass-card" style={{ overflowX: "auto" }} id="admin-cakes-list">
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-gold)", color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase" }}>
                <th style={{ padding: "1rem" }}>Cake</th>
                <th style={{ padding: "1rem" }}>Flavour</th>
                <th style={{ padding: "1rem" }}>Category</th>
                <th style={{ padding: "1rem" }}>Status</th>
                <th style={{ padding: "1rem" }}>Created</th>
                <th style={{ padding: "1rem", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cakes.map((cake) => (
                <tr key={cake.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: "42px", height: "42px", background: "#FFFFFF", borderRadius: "6px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cake.image_url} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                    </div>
                    <div>
                      <strong style={{ color: "var(--text-primary)", fontSize: "0.95rem" }}>{cake.name}</strong>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{cake.slug}</div>
                    </div>
                  </td>
                  <td style={{ padding: "1rem", fontSize: "0.88rem", color: "var(--text-secondary)" }}>
                    {cake.flavour}
                  </td>
                  <td style={{ padding: "1rem", fontSize: "0.85rem", color: "var(--gold-light)" }}>
                    {cake.category_name || "-"}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        padding: "0.2rem 0.55rem",
                        borderRadius: "9999px",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        background:
                          cake.status === "published"
                            ? "rgba(212,175,55,0.2)"
                            : cake.status === "approved"
                            ? "rgba(16,185,129,0.15)"
                            : cake.status === "pending"
                            ? "rgba(245,158,11,0.15)"
                            : "rgba(239,68,68,0.15)",
                        color:
                          cake.status === "published"
                            ? "var(--gold-light)"
                            : cake.status === "approved"
                            ? "#34D399"
                            : cake.status === "pending"
                            ? "#FBBF24"
                            : "#F87171",
                      }}
                    >
                      {cake.status}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                    {new Date(cake.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                      <Link href={`/cakes/${cake.slug}`} target="_blank" className="btn-outline-gold" style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}>
                        View
                      </Link>
                      {cake.status !== "published" && (
                        <button onClick={() => handlePublish(cake.id)} className="btn-gold" style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}>
                          Publish
                        </button>
                      )}
                      <button onClick={() => handleDelete(cake.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
