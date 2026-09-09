"use client";

import React, { useState, useEffect } from "react";
import {
  getAdminReviews,
  approveReview,
  rejectReview,
  deleteReview,
  bulkUpdateReviewStatus,
  bulkDeleteReviews,
} from "../../../lib/api";
import { Review } from "../../../lib/types";
import AdminBatchBar from "../../../components/AdminBatchBar";
import { Star } from "lucide-react";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Multi-select & Batch Bar state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(reviews.map((r) => r.id)));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleBatchStatusChange = async (newStatus: string) => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    setBatchLoading(true);
    try {
      await bulkUpdateReviewStatus(ids, newStatus);
      if (statusFilter !== "all" && statusFilter !== newStatus) {
        setReviews((prev) => prev.filter((r) => !selectedIds.has(r.id)));
      } else {
        setReviews((prev) =>
          prev.map((r) => (selectedIds.has(r.id) ? { ...r, status: newStatus as any } : r))
        );
      }
      const count = ids.length;
      handleDeselectAll();
      setFeedback(`Successfully updated ${count} review(s) to "${newStatus}"!`);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to update selected reviews");
    } finally {
      setBatchLoading(false);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (!confirm(`Are you sure you want to permanently delete ${count} selected review(s)? This cannot be undone.`)) {
      return;
    }
    const ids = Array.from(selectedIds);
    setBatchLoading(true);
    try {
      await bulkDeleteReviews(ids);
      setReviews((prev) => prev.filter((r) => !selectedIds.has(r.id)));
      handleDeselectAll();
      setFeedback(`Permanently deleted ${count} review(s).`);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to delete selected reviews");
    } finally {
      setBatchLoading(false);
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await getAdminReviews(statusFilter === "all" ? undefined : statusFilter);
      setReviews(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [statusFilter]);

  const handleApprove = async (id: string) => {
    await approveReview(id);
    fetchReviews();
  };

  const handleReject = async (id: string) => {
    await rejectReview(id);
    fetchReviews();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this review?")) return;
    await deleteReview(id);
    fetchReviews();
  };

  return (
    <div>
      {/* Header - Compact */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <span className="cake-category-badge">Guest Feedback Moderation</span>
          <h1 style={{ fontSize: "1.5rem", color: "var(--text-primary)", fontWeight: 700 }}>
            Review Moderation Queue
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>
            Approve customer reviews before they appear on the public testimonials page.
          </p>
        </div>
      </div>

      {/* Tabs & Select All Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
          {["pending", "approved", "rejected", "all"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setStatusFilter(tab);
                setSelectedIds(new Set());
              }}
              style={{
                background: statusFilter === tab ? "var(--gold)" : "var(--bg-cream)",
                border: statusFilter === tab ? "1px solid var(--gold)" : "1px solid var(--border-subtle)",
                color: statusFilter === tab ? "#FFFFFF" : "var(--text-secondary)",
                padding: "0.3rem 0.75rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.76rem",
                fontWeight: statusFilter === tab ? 600 : 500,
                textTransform: "capitalize",
                cursor: "pointer",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {reviews.length > 0 && (
          <button
            onClick={selectedIds.size === reviews.length ? handleDeselectAll : handleSelectAll}
            className="btn-outline-gold"
            style={{
              padding: "0.32rem 0.75rem",
              fontSize: "0.76rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={reviews.length > 0 && selectedIds.size === reviews.length}
              readOnly
              style={{ accentColor: "var(--gold)", cursor: "pointer", width: "14px", height: "14px" }}
            />
            <span>{selectedIds.size === reviews.length ? "Deselect All" : "Select All"}</span>
          </button>
        )}
      </div>

      {feedback && (
        <div
          style={{
            padding: "0.55rem 0.85rem",
            borderRadius: "var(--radius-sm)",
            background: "#D1FAE5",
            border: "1px solid #A7F3D0",
            color: "#065F46",
            fontSize: "0.82rem",
            marginBottom: "1rem",
            fontWeight: 500,
          }}
        >
          {feedback}
        </div>
      )}

      {reviews.length === 0 && !loading ? (
        <div style={{ textAlign: "center", padding: "2.5rem 1.5rem", background: "var(--bg-surface)", borderRadius: "var(--radius-md)", border: "1px dashed var(--gold-border)" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.86rem" }}>
            No reviews matching this status filter.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {reviews.map((rev) => {
            const isSelected = selectedIds.has(rev.id);

            return (
              <div
                key={rev.id}
                style={{
                  background: isSelected ? "rgba(197, 160, 89, 0.04)" : "var(--bg-surface)",
                  border: isSelected ? "1.5px solid var(--gold)" : "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "1rem",
                  boxShadow: isSelected ? "0 4px 16px rgba(197, 160, 89, 0.15)" : "var(--shadow-xs)",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(rev.id)}
                      style={{ width: "16px", height: "16px", accentColor: "var(--gold)", cursor: "pointer" }}
                      aria-label={`Select review from ${rev.customer_name}`}
                    />
                    <div>
                      <strong style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>{rev.customer_name}</strong>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>
                        {rev.customer_location || "Verified Guest"}
                      </span>
                    </div>
                  </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div className="rating-stars" style={{ display: "inline-flex", gap: "2px", alignItems: "center" }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={13}
                        style={{
                          fill: s <= rev.rating ? "var(--gold)" : "transparent",
                          color: s <= rev.rating ? "var(--gold)" : "var(--border-subtle)",
                        }}
                      />
                    ))}
                  </div>
                  <span
                    className={`badge-status ${
                      rev.status === "approved"
                        ? "badge-approved"
                        : rev.status === "pending"
                        ? "badge-pending"
                        : "badge-rejected"
                    }`}
                  >
                    {rev.status}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", fontStyle: "italic", marginBottom: "0.75rem" }}>
                "{rev.review_text}"
              </p>

              <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end", borderTop: "1px solid var(--border-light)", paddingTop: "0.5rem" }}>
                {rev.status !== "approved" && (
                  <button
                    onClick={() => handleApprove(rev.id)}
                    className="btn-gold"
                    style={{ padding: "0.3rem 0.65rem", fontSize: "0.74rem" }}
                  >
                    Approve
                  </button>
                )}
                {rev.status !== "rejected" && (
                  <button
                    onClick={() => handleReject(rev.id)}
                    style={{
                      background: "#FEF2F2",
                      border: "1px solid #FECACA",
                      color: "#991B1B",
                      padding: "0.3rem 0.65rem",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.74rem",
                      cursor: "pointer",
                    }}
                  >
                    Reject
                  </button>
                )}
                <button
                  onClick={() => handleDelete(rev.id)}
                  style={{
                    background: "var(--bg-cream)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-muted)",
                    padding: "0.3rem 0.65rem",
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.74rem",
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
      )}

      {/* Floating Batch Actions Toolbar */}
      <AdminBatchBar
        selectedCount={selectedIds.size}
        totalCount={reviews.length}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onStatusChange={handleBatchStatusChange}
        statusOptions={[
          { label: "Approve Review", value: "approved" },
          { label: "Reject Review", value: "rejected" },
          { label: "Reset to Pending", value: "pending" },
        ]}
        quickActions={[
          { label: "Approve All", value: "approved", variant: "primary" },
          { label: "Reject All", value: "rejected", variant: "secondary" },
        ]}
        onDelete={handleBatchDelete}
        isLoading={batchLoading}
      />
    </div>
  );
}
