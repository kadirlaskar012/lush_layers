"use client";

import React, { useState } from "react";
import { Review } from "../lib/types";
import { submitCustomerReview } from "../lib/api";
import { Star } from "lucide-react";

export function ReviewCard({ review }: { review: Review }) {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "var(--shadow-xs)",
      }}
      id={`review-card-${review.id}`}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
          <div
            className="rating-stars"
            style={{ display: "inline-flex", gap: "2px", alignItems: "center" }}
            aria-label={`Rating: ${review.rating} out of 5 stars`}
          >
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={14}
                className={s <= review.rating ? "icon-hover-pulse" : ""}
                style={{
                  fill: s <= review.rating ? "var(--gold)" : "transparent",
                  color: s <= review.rating ? "var(--gold)" : "var(--border-subtle)",
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
            {review.created_at ? new Date(review.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "Recent"}
          </span>
        </div>
        <p
          style={{
            fontSize: "0.88rem",
            lineHeight: "1.6",
            color: "var(--text-primary)",
            fontStyle: "italic",
            marginBottom: "1rem",
          }}
        >
          "{review.review_text}"
        </p>
      </div>

      <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "0.65rem" }}>
        <h4 style={{ fontSize: "0.88rem", color: "var(--text-primary)", fontWeight: 600, margin: 0 }}>
          {review.customer_name}
        </h4>
        <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
          {review.customer_location || "Verified Confection Guest"}
        </span>
      </div>
    </div>
  );
}

export function ReviewForm() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) {
      setMessage({ type: "error", text: "Please provide your name and review experience." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    const result = await submitCustomerReview({
      customer_name: name.trim(),
      customer_location: location.trim() || "Verified Guest",
      review_text: text.trim(),
      rating,
    });

    setIsSubmitting(false);

    if (result.success) {
      setMessage({
        type: "success",
        text: "Thank you for your warm words! Your review has been submitted for moderation and will appear once approved.",
      });
      setName("");
      setLocation("");
      setText("");
      setRating(5);
    } else {
      setMessage({ type: "error", text: result.message || "Failed to submit review." });
    }
  };

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        padding: "1.5rem",
        boxShadow: "var(--shadow-xs)",
        maxWidth: "600px",
        margin: "0 auto",
      }}
      id="review-submission-form-container"
    >
      <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
        <span className="cake-category-badge">Guest Impressions</span>
        <h3 style={{ fontSize: "1.35rem", color: "var(--text-primary)", marginBottom: "0.3rem", fontWeight: 700 }}>
          Share Your Celebration Experience
        </h3>
        <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
          Every memory matters. Your reflection will be reviewed by our atelier prior to publication.
        </p>
      </div>

      {message && (
        <div
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-sm)",
            marginBottom: "1rem",
            fontSize: "0.84rem",
            background: message.type === "success" ? "#D1FAE5" : "#FEE2E2",
            color: message.type === "success" ? "#065F46" : "#991B1B",
            border: `1px solid ${message.type === "success" ? "#A7F3D0" : "#FECACA"}`,
          }}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <div>
            <label className="form-label">Your Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Lady Vivienne"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              style={{ padding: "0.5rem 0.75rem", fontSize: "0.84rem" }}
            />
          </div>
          <div>
            <label className="form-label">Occasion / City</label>
            <input
              type="text"
              placeholder="e.g. Chelsea Wedding"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="form-input"
              style={{ padding: "0.5rem 0.75rem", fontSize: "0.84rem" }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "0.75rem" }}>
          <label className="form-label">Rating Experience</label>
          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                className="icon-hover-lift"
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  size={20}
                  style={{
                    fill: star <= rating ? "var(--gold)" : "transparent",
                    color: star <= rating ? "var(--gold)" : "var(--border-subtle)",
                    transition: "all 0.15s ease",
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label className="form-label">Your Testimonial *</label>
          <textarea
            required
            rows={3}
            placeholder="Describe the confection, presentation, and guest reactions..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="form-textarea"
            style={{ padding: "0.5rem 0.75rem", fontSize: "0.84rem" }}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-gold"
          style={{ width: "100%", padding: "0.6rem 1rem", fontSize: "0.85rem", justifyContent: "center" }}
        >
          {isSubmitting ? "Submitting for Review..." : "Submit Testimonial"}
        </button>
      </form>
    </div>
  );
}
