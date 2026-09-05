import React from "react";
import PublicLayout from "../../components/PublicLayout";
import { ReviewCard, ReviewForm } from "../../components/ReviewComponents";
import { getApprovedReviews } from "../../lib/api";
import { Star } from "lucide-react";

export const revalidate = 60;

export const metadata = {
  title: "Guest Reviews & Testimonials • LUSH LAYERS",
  description: "Read real reviews from our guests and share your celebration experience with LUSH LAYERS.",
};

export default async function ReviewsPage() {
  const reviews = await getApprovedReviews();

  return (
    <PublicLayout>
      <div style={{ paddingTop: "2rem", paddingBottom: "3.5rem" }}>
        <div className="container-lux">
          {/* Header - Compact */}
          <div style={{ textAlign: "center", maxWidth: "650px", margin: "0 auto 2rem" }}>
            <span className="cake-category-badge">Guest Expressions</span>
            <h1 style={{ fontSize: "1.85rem", color: "var(--text-primary)", marginBottom: "0.4rem" }}>
              Memories & Testimonials
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
              Real impressions from patrons whose celebrations were elevated by our bespoke confectionery.
            </p>
          </div>

          {/* Reviews Grid */}
          <div style={{ marginBottom: "2.5rem" }}>
            {reviews && reviews.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "1rem",
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
                  padding: "2rem",
                  background: "var(--bg-surface)",
                  borderRadius: "var(--radius-md)",
                  border: "1px dashed var(--gold-border)",
                  maxWidth: "500px",
                  margin: "0 auto",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "var(--bg-cream)",
                    border: "1px solid var(--border-subtle)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "0.6rem",
                    color: "var(--gold)",
                  }}
                >
                  <Star size={24} style={{ fill: "var(--gold)" }} />
                </div>
                <h3 style={{ fontSize: "1.15rem", color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                  No published reviews yet.
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  Be the very first patron to leave a testimonial for our master bakers below!
                </p>
              </div>
            )}
          </div>

          {/* Interactive Review Submission Form */}
          <div style={{ marginTop: "2rem" }}>
            <ReviewForm />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
