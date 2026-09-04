import React from "react";
import Link from "next/link";
import PublicLayout from "../components/PublicLayout";
import MasonryGallery from "../components/MasonryGallery";
import CategoryBar from "../components/CategoryBar";
import CakeCard from "../components/CakeCard";
import { ReviewCard } from "../components/ReviewComponents";
import { getPublishedCakes, getCategories, getApprovedReviews } from "../lib/api";

export const revalidate = 60; // ISR: 60 seconds revalidation

export default async function HomePage() {
  const [cakes, categories, reviews] = await Promise.all([
    getPublishedCakes(),
    getCategories(),
    getApprovedReviews(),
  ]);

  const bakeryWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "1234567890";
  const heroCake = cakes && cakes.length > 0 ? cakes[0] : null;
  const featuredCakes = cakes ? cakes.slice(0, 8) : [];

  return (
    <PublicLayout>
      {/* 1. COMPACT HERO SECTION (Balanced 2-column layout that fits above fold) */}
      <section
        style={{
          position: "relative",
          padding: "2.25rem 0 2rem",
          background: "linear-gradient(180deg, #FFFFFF 0%, var(--bg-main) 100%)",
          borderBottom: "1px solid var(--border-subtle)",
          overflow: "hidden",
        }}
        id="hero-section"
      >
        <div className="container-lux">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
              alignItems: "center",
              gap: "2rem",
            }}
          >
            {/* Left: Compact Copy & CTAs */}
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.6rem" }}>
                <span
                  style={{
                    fontSize: "0.72rem",
                    letterSpacing: "0.15em",
                    color: "var(--gold-dark)",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    background: "var(--gold-subtle)",
                    padding: "0.2rem 0.6rem",
                    borderRadius: "var(--radius-full)",
                    border: "1px solid var(--gold-border)",
                  }}
                >
                  ✨ Haute Pâtisserie Atelier
                </span>
              </div>

              <h1
                style={{
                  fontSize: "clamp(1.75rem, 3.8vw, 2.6rem)",
                  lineHeight: 1.18,
                  marginBottom: "0.85rem",
                  color: "var(--text-primary)",
                  fontWeight: 700,
                }}
              >
                Couture Confections, <br />
                <span className="text-gold-gradient">Crafted with Pure Love</span>
              </h1>

              <p
                style={{
                  fontSize: "0.92rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                  marginBottom: "1.25rem",
                  maxWidth: "520px",
                }}
              >
                Architectural tiers, velvety ganache, and hand-piped florals. Every bespoke creation is crafted fresh for your most cherished milestones.
              </p>

              {/* Compact CTA Row */}
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                <Link href="/cakes" className="btn-gold" id="hero-browse-btn">
                  Explore Catalog
                </Link>
                <a
                  href={`https://wa.me/${bakeryWhatsApp.replace(/[^0-9]/g, "")}?text=Hello%20LUSH%20LAYERS%2C%20I%20would%20like%20to%20enquire%20about%20ordering%20a%20bespoke%20cake.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                  id="hero-whatsapp-btn"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
                  </svg>
                  <span>Order on WhatsApp</span>
                </a>
              </div>

              {/* Compact Trust Features */}
              <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <span style={{ color: "var(--gold)" }}>✓</span>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 500 }}>100% Artisanal</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <span style={{ color: "var(--gold)" }}>✓</span>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 500 }}>Direct WhatsApp Dialogue</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <span style={{ color: "var(--gold)" }}>✓</span>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 500 }}>Studio White Photography</span>
                </div>
              </div>
            </div>

            {/* Right: Compact Featured Hero Cake Visual */}
            {heroCake && (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-lg)",
                    padding: "1rem",
                    boxShadow: "var(--shadow-md)",
                    maxWidth: "340px",
                    width: "100%",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      background: "var(--gold-subtle)",
                      border: "1px solid var(--gold-border)",
                      color: "var(--gold-dark)",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      padding: "0.2rem 0.5rem",
                      borderRadius: "var(--radius-full)",
                    }}
                  >
                    ✨ Master Creation
                  </div>

                  <Link href={`/cakes/${heroCake.slug}`} style={{ textDecoration: "none", display: "block" }}>
                    <div
                      style={{
                        width: "100%",
                        aspectRatio: "1/1",
                        background: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0.5rem",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={heroCake.image_url}
                        alt={heroCake.name}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    </div>
                  </Link>

                  <div style={{ paddingTop: "0.75rem", textAlign: "center" }}>
                    <span style={{ fontSize: "0.68rem", color: "var(--gold-dark)", textTransform: "uppercase", fontWeight: 600 }}>
                      {heroCake.category_name || "Signature"}
                    </span>
                    <h3 style={{ fontSize: "1.05rem", color: "var(--text-primary)", margin: "0.2rem 0" }}>
                      {heroCake.name}
                    </h3>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontStyle: "italic", marginBottom: "0.6rem" }}>
                      {heroCake.flavour}
                    </p>
                    <Link
                      href={`/cakes/${heroCake.slug}`}
                      className="btn-outline-gold"
                      style={{ width: "100%", padding: "0.4rem 0.8rem", fontSize: "0.78rem" }}
                    >
                      View Confection Details
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. COMPACT CATEGORIES BAR */}
      <section style={{ padding: "1.5rem 0", background: "var(--bg-surface)", borderBottom: "1px solid var(--border-light)" }} id="categories">
        <div className="container-lux">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Explore Collections
            </span>
            <Link href="/cakes" style={{ color: "var(--gold-dark)", textDecoration: "none", fontSize: "0.8rem", fontWeight: 600 }}>
              View All ({cakes ? cakes.length : 0}) →
            </Link>
          </div>
          <CategoryBar categories={categories} />
        </div>
      </section>

      {/* 3. SIGNATURE CREATIONS GRID (Desktop: 4 cols, Tablet: 3 cols, Mobile: STRICTLY 2 COLS) */}
      <section style={{ padding: "2.5rem 0 2rem" }} id="signature-creations">
        <div className="container-lux">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <div>
              <span className="cake-category-badge">Boutique Portfolio</span>
              <h2 style={{ fontSize: "1.5rem", color: "var(--text-primary)", lineHeight: 1.2 }}>
                Our Signature Creations
              </h2>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", maxWidth: "420px" }}>
              Studio white photography. Tap <strong>Order on WhatsApp</strong> to choose custom size and event date.
            </p>
          </div>

          <div className="cake-grid-responsive">
            {featuredCakes.map((cake) => (
              <CakeCard key={cake.id} cake={cake} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. COMPACT MASONRY GALLERY */}
      <section style={{ padding: "2.5rem 0 3rem", background: "var(--bg-cream)", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }} id="gallery">
        <div className="container-lux">
          <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 1.75rem" }}>
            <span className="cake-category-badge">The Inspiration Wall</span>
            <h2 style={{ fontSize: "1.6rem", color: "var(--text-primary)", marginBottom: "0.35rem" }}>
              Artisanal Haute Gallery
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.86rem" }}>
              A tapestry of multi-tiered silhouettes, botanical petals, and rich dark Belgian ganache.
            </p>
          </div>

          <MasonryGallery cakes={cakes} />
        </div>
      </section>

      {/* 5. COMPACT GUEST REVIEWS */}
      <section style={{ padding: "2.5rem 0", background: "var(--bg-surface)" }} id="reviews">
        <div className="container-lux">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <div>
              <span className="cake-category-badge">Guest Praise</span>
              <h2 style={{ fontSize: "1.5rem", color: "var(--text-primary)" }}>
                Words of Delight
              </h2>
            </div>
            <Link href="/reviews" style={{ color: "var(--gold-dark)", textDecoration: "none", fontSize: "0.82rem", fontWeight: 600 }}>
              All Testimonials ({reviews?.length || 0}) →
            </Link>
          </div>

          {reviews && reviews.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "1rem",
              }}
            >
              {reviews.slice(0, 3).map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No reviews yet.</p>
          )}
        </div>
      </section>

      {/* 6. COMPACT ATELIER PHILOSOPHY & WHATSAPP CONSULTATION */}
      <section style={{ padding: "2.5rem 0", background: "var(--bg-main)", borderTop: "1px solid var(--border-subtle)" }} id="about">
        <div className="container-lux">
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "1.75rem",
              boxShadow: "var(--shadow-xs)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              alignItems: "center",
              gap: "2rem",
            }}
          >
            <div>
              <span className="cake-category-badge">Artisanal Manifesto</span>
              <h3 style={{ fontSize: "1.45rem", color: "var(--text-primary)", marginBottom: "0.6rem" }}>
                Slow Craftsmanship. Pure Single-Origin Cocoa. Hand-Piped Petals.
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                Every sponge is baked fresh from European churned butter and organic grains. We work closely with each patron over WhatsApp to tailor flavours, tiers, and personalized message cards.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <Link href="/about" className="btn-outline-gold" style={{ padding: "0.45rem 0.95rem", fontSize: "0.8rem" }}>
                  Read Atelier Story
                </Link>
                <Link href="/contact" className="btn-outline-gold" style={{ padding: "0.45rem 0.95rem", fontSize: "0.8rem" }}>
                  Bespoke Brief
                </Link>
              </div>
            </div>

            <div
              style={{
                background: "var(--bg-cream)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "1.25rem",
                textAlign: "center",
              }}
            >
              <h4 style={{ fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: "0.35rem" }}>
                Have an Upcoming Celebration?
              </h4>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                Chat directly with our head baker. Share your guest count and date for immediate personal consultation.
              </p>
              <a
                href={`https://wa.me/${bakeryWhatsApp.replace(/[^0-9]/g, "")}?text=Hello%20LUSH%20LAYERS%2C%20I%20would%20like%20to%20consult%20about%20a%20cake%20for%20my%20event.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
                style={{ width: "100%", padding: "0.55rem 1rem", fontSize: "0.84rem" }}
              >
                Chat on WhatsApp Now
              </a>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
