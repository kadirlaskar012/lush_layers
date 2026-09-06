"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  getAdminCakes,
  getCategories,
  approveCake,
  publishCake,
  rejectCake,
  deleteCake,
  updateCakeDetails,
} from "../../../lib/api";
import { Cake, Category } from "../../../lib/types";
import { getCakeDisplayId } from "../../../lib/cakeHelper";
import { Zap, Clock, Edit3, X, Plus, CheckCircle2, SlidersHorizontal, ArrowUpDown } from "lucide-react";

export default function AdminCakesManagementPage() {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Edit Modal State
  const [editingCake, setEditingCake] = useState<Cake | null>(null);
  const [editForm, setEditForm] = useState<Partial<Cake>>({});
  const [newSizeInput, setNewSizeInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchCakes = async () => {
    setIsLoading(true);
    try {
      const [data, cats] = await Promise.all([
        getAdminCakes(
          statusFilter === "all" ? undefined : statusFilter,
          searchQuery || undefined,
          categoryFilter === "all" ? undefined : categoryFilter,
          sortOption
        ),
        getCategories(),
      ]);
      setCakes(data);
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCakes();
  }, [statusFilter, categoryFilter, sortOption]);

  // Fast, instant filtering & sorting on loaded dataset (including 4-digit ID search)
  const displayedCakes = useMemo(() => {
    let result = [...cakes];

    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (categoryFilter !== "all") {
      result = result.filter((c) => c.category_id === categoryFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const cleanQ = q.replace(/^#/, "");
      result = result.filter((c) => {
        const dId = (c.display_id || getCakeDisplayId(c)).toLowerCase();
        return (
          dId === cleanQ ||
          dId.includes(cleanQ) ||
          c.name.toLowerCase().includes(q) ||
          (c.flavour && c.flavour.toLowerCase().includes(q)) ||
          (c.description && c.description.toLowerCase().includes(q)) ||
          c.slug.toLowerCase().includes(q)
        );
      });
    }

    result.sort((a, b) => {
      if (sortOption === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortOption === "id_asc") {
        const idA = parseInt(a.display_id || getCakeDisplayId(a), 10) || 0;
        const idB = parseInt(b.display_id || getCakeDisplayId(b), 10) || 0;
        return idA - idB;
      }
      if (sortOption === "id_desc") {
        const idA = parseInt(a.display_id || getCakeDisplayId(a), 10) || 0;
        const idB = parseInt(b.display_id || getCakeDisplayId(b), 10) || 0;
        return idB - idA;
      }
      if (sortOption === "name_asc") {
        return a.name.localeCompare(b.name);
      }
      if (sortOption === "name_desc") {
        return b.name.localeCompare(a.name);
      }
      // default: "newest"
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [cakes, statusFilter, categoryFilter, searchQuery, sortOption]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCakes();
  };

  const handlePublish = async (cakeId: string) => {
    setActionLoading(cakeId);
    try {
      await publishCake(cakeId);
      fetchCakes();
      setFeedback("Cake published live to storefront!");
      setTimeout(() => setFeedback(null), 3500);
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
      setFeedback("Cake approved and staged!");
      setTimeout(() => setFeedback(null), 3500);
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
      setFeedback("Cake moved to Rejected archive.");
      setTimeout(() => setFeedback(null), 3500);
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
      setFeedback("Cake deleted permanently.");
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      alert(err.message);
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
      display_id: cake.display_id || getCakeDisplayId(cake),
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

  return (
    <div id="admin-cakes-management-view">
      {/* Top Header - Compact */}
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
              Master Catalog
            </span>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              • All Confections
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
            All Confections ({displayedCakes.length})
          </h1>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link
            href="/admin/cakes/pending"
            className="btn-outline-gold"
            style={{ padding: "0.45rem 0.85rem", fontSize: "0.78rem" }}
          >
            <Clock size={13} />
            <span>Pending Review</span>
          </Link>
          <Link
            href="/admin/upload"
            className="btn-gold"
            style={{ padding: "0.45rem 0.95rem", fontSize: "0.78rem" }}
          >
            <Zap size={13} />
            <span>+ Ingest Photos</span>
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

      {/* Filter Toolbar - Clean, Comprehensive & Modern */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "var(--bg-surface)",
          padding: "0.5rem 0.75rem",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-subtle)",
          marginBottom: "1rem",
          flexWrap: "wrap",
          gap: "0.65rem",
        }}
      >
        {/* Status Filter Tabs */}
        <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", alignItems: "center" }}>
          {["all", "pending", "approved", "published", "rejected"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: "0.35rem 0.75rem",
                background: statusFilter === st ? "var(--gold)" : "transparent",
                color: statusFilter === st ? "#FFFFFF" : "var(--text-secondary)",
                border: "none",
                borderRadius: "var(--radius-full)",
                fontSize: "0.75rem",
                fontWeight: statusFilter === st ? 600 : 500,
                textTransform: "capitalize",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {st === "all" ? "All Status" : st}
            </button>
          ))}
        </div>

        {/* Filter Controls & Search */}
        <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap", alignItems: "center" }}>
          {/* Category Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 500 }}>
              Category:
            </span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-input"
              style={{
                padding: "0.32rem 0.55rem",
                fontSize: "0.76rem",
                borderRadius: "var(--radius-sm)",
                background: "var(--bg-surface)",
                cursor: "pointer",
                minWidth: "130px",
              }}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 500 }}>
              Sort:
            </span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="form-input"
              style={{
                padding: "0.32rem 0.55rem",
                fontSize: "0.76rem",
                borderRadius: "var(--radius-sm)",
                background: "var(--bg-surface)",
                cursor: "pointer",
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="id_asc">ID: Low → High (#1001)</option>
              <option value="id_desc">ID: High → Low</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
            </select>
          </div>

          {/* Search by #ID, Name, Flavour */}
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Search by #ID (e.g. 1001), name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ width: "210px", padding: "0.32rem 0.6rem", fontSize: "0.76rem" }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  padding: "0 2px",
                }}
                title="Clear"
              >
                <X size={13} />
              </button>
            )}
            <button type="submit" className="btn-outline-gold" style={{ padding: "0.32rem 0.6rem", fontSize: "0.76rem" }}>
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Desktop Data Table - Compact Dense Row Height */}
      <div
        className="admin-desktop-table-wrap"
        style={{
          background: "var(--bg-surface)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "var(--shadow-xs)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
          <thead>
            <tr style={{ background: "var(--bg-cream)", borderBottom: "1px solid var(--border-subtle)" }}>
              <th style={{ padding: "0.55rem 0.85rem", textAlign: "left", fontWeight: 600, color: "var(--text-secondary)", width: "56px" }}>
                Photo
              </th>
              <th style={{ padding: "0.55rem 0.85rem", textAlign: "left", fontWeight: 600, color: "var(--text-secondary)", width: "75px" }}>
                ID
              </th>
              <th style={{ padding: "0.55rem 0.85rem", textAlign: "left", fontWeight: 600, color: "var(--text-secondary)" }}>
                Confection
              </th>
              <th style={{ padding: "0.55rem 0.85rem", textAlign: "left", fontWeight: 600, color: "var(--text-secondary)" }}>
                Flavour & Category
              </th>
              <th style={{ padding: "0.55rem 0.85rem", textAlign: "left", fontWeight: 600, color: "var(--text-secondary)" }}>
                Sizes
              </th>
              <th style={{ padding: "0.55rem 0.85rem", textAlign: "left", fontWeight: 600, color: "var(--text-secondary)" }}>
                Status
              </th>
              <th style={{ padding: "0.55rem 0.85rem", textAlign: "right", fontWeight: 600, color: "var(--text-secondary)" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} style={{ padding: "2.5rem", textAlign: "center", color: "var(--text-muted)" }}>
                  Loading cakes...
                </td>
              </tr>
            ) : displayedCakes.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "2.5rem", textAlign: "center", color: "var(--text-muted)" }}>
                  No confections found matching your criteria.
                </td>
              </tr>
            ) : (
              displayedCakes.map((cake) => {
                const isBusy = actionLoading === cake.id;
                return (
                  <tr
                    key={cake.id}
                    style={{ borderBottom: "1px solid var(--border-light)" }}
                    className="hover:bg-cream"
                  >
                    <td style={{ padding: "0.45rem 0.85rem" }}>
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "var(--radius-xs)",
                          background: "#FFFFFF",
                          border: "1px solid var(--border-light)",
                          padding: "0.15rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
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
                    </td>
                    <td style={{ padding: "0.45rem 0.85rem" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-mono, monospace)",
                          fontWeight: 700,
                          fontSize: "0.76rem",
                          color: "var(--gold-dark)",
                          background: "var(--bg-cream)",
                          border: "1px solid var(--border-subtle)",
                          padding: "0.15rem 0.45rem",
                          borderRadius: "4px",
                          display: "inline-block",
                          letterSpacing: "0.03em",
                        }}
                      >
                        #{cake.display_id || getCakeDisplayId(cake)}
                      </span>
                    </td>
                    <td style={{ padding: "0.45rem 0.85rem" }}>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{cake.name}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                        /{cake.slug}
                      </div>
                    </td>
                    <td style={{ padding: "0.45rem 0.85rem" }}>
                      <div style={{ color: "var(--text-secondary)" }}>{cake.flavour}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--gold-dark)" }}>
                        {cake.category_name || "Uncategorized"}
                      </div>
                    </td>
                    <td style={{ padding: "0.45rem 0.85rem" }}>
                      <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                        {(cake.available_sizes || []).slice(0, 2).map((s, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: "0.64rem",
                              background: "var(--bg-cream)",
                              border: "1px solid var(--border-subtle)",
                              padding: "0.08rem 0.35rem",
                              borderRadius: "var(--radius-full)",
                            }}
                          >
                            {s.replace(/ \([^)]*\)/, "")}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: "0.45rem 0.85rem" }}>
                      <span
                        className={`badge ${
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
                    <td style={{ padding: "0.45rem 0.85rem", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "0.25rem", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => startEdit(cake)}
                          disabled={isBusy}
                          className="btn-outline-gold icon-hover-lift"
                          style={{ padding: "0.25rem 0.55rem", fontSize: "0.72rem", display: "inline-flex", alignItems: "center", gap: "0.2rem" }}
                          title="Edit cake details"
                        >
                          <Edit3 size={11} />
                          <span>Edit</span>
                        </button>
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

      {/* Mobile Cards View */}
      <div
        className="admin-mobile-cards-list"
        style={{
          display: "none",
          flexDirection: "column",
          gap: "0.65rem",
        }}
      >
        {displayedCakes.map((cake) => {
          const isBusy = actionLoading === cake.id;
          return (
            <div
              key={cake.id}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "0.75rem",
                boxShadow: "var(--shadow-xs)",
              }}
            >
              <div style={{ display: "flex", gap: "0.65rem", marginBottom: "0.5rem" }}>
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    background: "#FFFFFF",
                    borderRadius: "var(--radius-xs)",
                    border: "1px solid var(--border-light)",
                    padding: "0.15rem",
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
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.15rem" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono, monospace)",
                        fontWeight: 700,
                        fontSize: "0.68rem",
                        color: "var(--gold-dark)",
                        background: "var(--bg-cream)",
                        border: "1px solid var(--border-subtle)",
                        padding: "0.06rem 0.32rem",
                        borderRadius: "3px",
                      }}
                    >
                      #{cake.display_id || getCakeDisplayId(cake)}
                    </span>
                    <h4 style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {cake.name}
                    </h4>
                  </div>
                  <p style={{ fontSize: "0.72rem", color: "var(--gold-dark)", fontStyle: "italic", margin: "0.1rem 0" }}>
                    {cake.flavour}
                  </p>
                  <span style={{ fontSize: "0.66rem", color: "var(--text-muted)" }}>
                    {cake.category_name || "Uncategorized"}
                  </span>
                </div>
                <span
                  style={{ alignSelf: "flex-start", whiteSpace: "nowrap" }}
                  className={`badge ${
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
              <div style={{ display: "flex", gap: "0.35rem", borderTop: "1px solid var(--border-light)", paddingTop: "0.5rem", flexWrap: "wrap" }}>
                <button
                  onClick={() => startEdit(cake)}
                  disabled={isBusy}
                  className="btn-outline-gold"
                  style={{ padding: "0.3rem 0.55rem", fontSize: "0.72rem" }}
                >
                  <Edit3 size={11} />
                  <span>Edit</span>
                </button>
                {cake.status !== "published" && (
                  <button
                    onClick={() => handlePublish(cake.id)}
                    disabled={isBusy}
                    className="btn-gold"
                    style={{ flex: 1, padding: "0.3rem 0.5rem", fontSize: "0.72rem", justifyContent: "center" }}
                  >
                    Publish
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
                  Master Catalog Edit
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

            <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr", gap: "0.75rem", marginBottom: "0.85rem" }}>
              <div className="form-group">
                <label className="form-label">ID (4-Digit)</label>
                <input
                  type="text"
                  maxLength={4}
                  value={editForm.display_id || ""}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, display_id: e.target.value.replace(/[^0-9]/g, "").slice(0, 4) }))}
                  className="form-input"
                  style={{ padding: "0.5rem 0.65rem", fontSize: "0.84rem", width: "100%", fontFamily: "monospace", fontWeight: 700, textAlign: "center" }}
                  placeholder="1001"
                />
              </div>

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
                  <option value="pending">Pending Review</option>
                  <option value="approved">Approved (Staged - Private)</option>
                  <option value="published">Published Live (Storefront)</option>
                  <option value="rejected">Rejected / Archived</option>
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
