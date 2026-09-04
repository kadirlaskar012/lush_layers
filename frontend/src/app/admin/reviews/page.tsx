"use client";

import React, { useState, useEffect } from "react";
import { getAdminReviews, approveReview, rejectReview, deleteReview } from "../../../lib/api";
import { Review } from "../../../lib/types";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [loading, setLoading] = useState(true);

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <span className="cake-category-badge">Guest Feedback Moderation</span>
          <h1 style={{ fontSize: "2.4rem", color: "var(--text-primary)" }}>
            Review Moderation Queue
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Approve customer reviews before they appear on the public testimonials page.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
        {["pending", "approved", "rejected", "all"].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "var(--radius-full)",
              fontSize: "0.85rem",
              textTransform: "capitalize",
              cursor: "pointer",
              background: statusFilter === tab ? "rgba(212,175,55,0.2)" : "rgba(255,255,255,0.04)",
              border: statusFilter === tab ? "1px solid var(--gold)" : "1px solid var(--border-subtle)",
              color: statusFilter === tab ? "var(--gold-light)" : "var(--text-secondary)",
              fontWeight: statusFilter === tab ? 600 : 400,
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {reviews.length === 0 && !loading ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--bg-surface)", borderRadius: "var(--radius-md)", border: "1px dashed var(--border-gold)" }}>
          No reviews in this queue.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="glass-card"
              style={{
                padding: "1.75rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: "1.5rem",
              }}
            >
              <div style={{ flex: 1, minWidth: "280px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                  <div className="rating-stars" style={{ fontSize: "1.1rem" }}>
                    {"★".repeat(rev.rating)}
                    {"☆".repeat(5 - rev.rating)}
                  </div>
                  <strong style={{ color: "var(--gold-light)", fontSize: "1rem" }}>
                    {rev.customer_name}
                  </strong>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    ({rev.customer_location || "Verified Guest"})
                  </span>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      padding: "0.15rem 0.5rem",
                      borderRadius: "9999px",
                      background:
                        rev.status === "approved"
                          ? "rgba(16,185,129,0.15)"
                          : rev.status === "pending"
                          ? "rgba(245,158,11,0.15)"
                          : "rgba(239,68,68,0.15)",
                      color:
                        rev.status === "approved"
                          ? "#34D399"
                          : rev.status === "pending"
                          ? "#FBBF24"
                          : "#F87171",
                    }}
                  >
                    {rev.status}
                  </span>
                </div>

                <p style={{ color: "var(--text-primary)", fontSize: "1rem", lineHeight: "1.6", fontStyle: "italic", marginBottom: "0.5rem" }}>
                  "{rev.review_text}"
                </p>

                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Submitted on: {new Date(rev.created_at).toLocaleString()}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {rev.status !== "approved" && (
                  <button
                    onClick={() => handleApprove(rev.id)}
                    className="btn-outline-gold"
                    style={{ padding: "0.45rem 1rem", fontSize: "0.82rem", borderColor: "#10B981", color: "#34D399" }}
                  >
                    ✓ Approve
                  </button>
                )}
                {rev.status !== "rejected" && (
                  <button
                    onClick={() => handleReject(rev.id)}
                    className="btn-outline-gold"
                    style={{ padding: "0.45rem 0.8rem", fontSize: "0.82rem", borderColor: "#EF4444", color: "#F87171" }}
                  >
                    ✕ Reject
                  </button>
                )}
                <button
                  onClick={() => handleDelete(rev.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    padding: "0.45rem",
                  }}
                  title="Delete review"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
