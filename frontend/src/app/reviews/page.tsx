import React from "react";
import PublicLayout from "../../components/PublicLayout";
import { ReviewCard, ReviewForm } from "../../components/ReviewComponents";
import { getApprovedReviews } from "../../lib/api";

export const revalidate = 60;

export const metadata = {
  title: "Guest Reviews & Testimonials • LUSH LAYERS",
  description: "Read real reviews from our guests and share your celebration experience with LUSH LAYERS.",
};

export default async function ReviewsPage() {
  const reviews = await getApprovedReviews();

  return (
    <PublicLayout>
      <div style={{ paddingTop: "4rem", paddingBottom: "7rem" }}>
        <div className="container-lux">
          {/* Header */}
          <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 4rem" }}>
            <span className="cake-category-badge">Guest Expressions</span>
            <h1 style={{ fontSize: "3.2rem", color: "var(--text-primary)", marginBottom: "1rem" }}>
              Memories & Testimonials
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", lineHeight: "1.8" }}>
              Every heartfelt word inspires our continuing dedication to confectionary perfection.
            </p>
          </div>

          {/* Reviews Grid (Only Approved Reviews Shown Publicly) */}
          <div style={{ marginBottom: "5rem" }}>
            {reviews && reviews.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: "2.5rem",
                }}
              >
                {reviews.map((rev) => (
                  <ReviewCard key={rev.id} review={rev} />
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "4rem 2rem",
                  background: "var(--bg-surface)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px dashed var(--border-gold)",
                  maxWidth: "600px",
                  margin: "0 auto",
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⭐</div>
                <h3 style={{ fontSize: "1.4rem", color: "var(--gold-light)", marginBottom: "0.5rem" }}>
                  No reviews yet.
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                  Be the very first patron to leave a testimonial for our master bakers below!
                </p>
              </div>
            )}
          </div>

          {/* Interactive Review Submission Form */}
          <div style={{ marginTop: "3rem" }}>
            <ReviewForm />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
