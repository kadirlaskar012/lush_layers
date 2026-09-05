"use client";

import React, { useState, useEffect } from "react";
import { getAdminReviews, approveReview, rejectReview, deleteReview } from "../../../lib/api";
import { Review } from "../../../lib/types";
import { Star } from "lucide-react";

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

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.35rem", marginBottom: "1.25rem" }}>
        {["pending", "approved", "rejected", "all"].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
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

      {reviews.length === 0 && !loading ? (
        <div style={{ textAlign: "center", padding: "2.5rem 1.5rem", background: "var(--bg-surface)", borderRadius: "var(--radius-md)", border: "1px dashed var(--gold-border)" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.86rem" }}>
            No reviews matching this status filter.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {reviews.map((rev) => (
            <div
              key={rev.id}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "1rem",
                boxShadow: "var(--shadow-xs)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                <div>
                  <strong style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>{rev.customer_name}</strong>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>
                    {rev.customer_location || "Verified Guest"}
                  </span>
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
          ))}
        </div>
      )}
    </div>
  );
}
