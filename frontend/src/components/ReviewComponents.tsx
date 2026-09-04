"use client";

import React, { useState } from "react";
import { Review } from "../lib/types";
import { submitCustomerReview } from "../lib/api";

export function ReviewCard({ review }: { review: Review }) {
  return (
    <div
      className="glass-card"
      style={{
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
      }}
      id={`review-card-${review.id}`}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div className="rating-stars" aria-label={`Rating: ${review.rating} out of 5 stars`}>
            {"★".repeat(review.rating)}
            {"☆".repeat(5 - review.rating)}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {review.created_at ? new Date(review.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "Recent"}
          </span>
        </div>
        <p
          style={{
            fontFamily: "var(--font-editorial)",
            fontSize: "1.2rem",
            lineHeight: "1.6",
            color: "var(--text-primary)",
            fontStyle: "italic",
            marginBottom: "1.5rem",
          }}
        >
          "{review.review_text}"
        </p>
      </div>

      <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem" }}>
        <h4 style={{ fontSize: "1rem", color: "var(--gold-light)", fontWeight: 600 }}>
          {review.customer_name}
        </h4>
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
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
      className="glass-card"
      style={{
        padding: "2.5rem",
        border: "1px solid var(--border-gold)",
        maxWidth: "680px",
        margin: "0 auto",
      }}
      id="leave-review-section"
    >
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <span className="cake-category-badge">Guest Experience</span>
        <h3 style={{ fontSize: "1.85rem", color: "var(--gold-light)", marginBottom: "0.5rem" }}>
          Share Your Celebration
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem" }}>
          Every cake is baked with genuine love. We would be honored to hear how our creation elevated your special moment.
        </p>
      </div>

      {message && (
        <div
          style={{
            padding: "1rem 1.25rem",
            borderRadius: "var(--radius-md)",
            marginBottom: "1.5rem",
            background:
              message.type === "success"
                ? "rgba(16, 185, 129, 0.15)"
                : "rgba(239, 68, 68, 0.15)",
            border:
              message.type === "success"
                ? "1px solid rgba(16, 185, 129, 0.4)"
                : "1px solid rgba(239, 68, 68, 0.4)",
            color: message.type === "success" ? "#34D399" : "#F87171",
            fontSize: "0.92rem",
          }}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Star Rating Select */}
        <div className="form-group" style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <label className="form-label" style={{ marginBottom: "0.5rem" }}>
            Your Rating
          </label>
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "2rem",
                  color: star <= rating ? "var(--gold)" : "rgba(255,255,255,0.2)",
                  cursor: "pointer",
                  transition: "transform 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                aria-label={`${star} Star`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label" htmlFor="review-name">
              Your Name *
            </label>
            <input
              id="review-name"
              type="text"
              className="form-input"
              placeholder="e.g. Clara & Julian"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="review-location">
              Occasion / Location
            </label>
            <input
              id="review-location"
              type="text"
              className="form-input"
              placeholder="e.g. Wedding at Claridge's"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="review-text">
            Your Review *
          </label>
          <textarea
            id="review-text"
            className="form-textarea"
            rows={4}
            placeholder="Tell us about the flavour, the bespoke design, and your guests' reactions..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          ></textarea>
        </div>

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <button
            type="submit"
            className="btn-gold"
            disabled={isSubmitting}
            id="submit-review-btn"
            style={{ width: "100%", maxWidth: "320px", padding: "1rem 2rem" }}
          >
            {isSubmitting ? "Submitting..." : "Submit Review for Approval"}
          </button>
        </div>
      </form>
    </div>
  );
}
