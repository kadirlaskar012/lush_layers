import React from "react";
import Link from "next/link";
import { Sparkles, Check } from "lucide-react";
import PublicLayout from "../components/PublicLayout";
import MarketplaceListing from "../components/MarketplaceListing";
import FeaturedCarousel from "../components/FeaturedCarousel";
import MasonryGallery from "../components/MasonryGallery";
import {
  LuxuryMarqueeTape,
  AtelierFeaturedPoster,
  DualEditorialPosters,
} from "../components/AnimatedPosters";
import WhatsAppIcon from "../components/WhatsAppIcon";
import { getPublishedCakes, getCategories } from "../lib/api";
import { getOptimizedImageUrl } from "../lib/imageHelper";

export const revalidate = 60; // ISR: 60 seconds revalidation

export default async function HomePage() {
  const [cakes, categories] = await Promise.all([
    getPublishedCakes(),
    getCategories(),
  ]);

  const bakeryWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918768388868";
  const heroCake = cakes && cakes.length > 0 ? cakes[0] : null;
  const featuredCakes = cakes ? cakes.slice(0, 8) : [];

  return (
    <PublicLayout>
      {/* 1. ULTRA-COMPACT PROMOTIONAL HERO (Optimized for Mobile Viewport Glance) */}
      <section className="hero-section-wrapper" id="hero-section">
        <div className="container-lux">
          <div className="hero-grid-layout">
            {/* Left: Compact Copy & Quick Actions */}
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", marginBottom: "0.25rem" }}>
                <span className="hero-atelier-badge">
                  <Sparkles size={11} style={{ color: "var(--gold-dark)" }} />
                  <span>Boutique Cake Studio • Kolkata</span>
                </span>
              </div>

              <h1 className="hero-headline">
                Couture Confections, <br style={{ display: "none" }} className="desktop-only-inline" />
                <span className="text-gold-gradient">Made with Love</span>
              </h1>

              <p className="hero-description">
                Architectural tiers, velvety ganache, and hand-piped florals. Every bespoke creation is crafted fresh for your most cherished milestones.
              </p>

              {/* Compact CTA Row - Features White Button with Outer Line */}
              <div className="hero-cta-row">
                <Link
                  href="/cakes"
                  className="btn-gold"
                  id="hero-browse-btn"
                  style={{ padding: "0.45rem 1.1rem", fontSize: "0.82rem", height: "34px" }}
                >
                  Explore All Cakes
                </Link>
                <a
                  href={`https://wa.me/${bakeryWhatsApp.replace(/[^0-9]/g, "")}?text=Hello%20Tina%20Baidya%2C%20I%20would%20like%20to%20order%20a%20bespoke%20cake.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-order-now"
                  id="hero-order-now-btn"
                  style={{ width: "auto", padding: "0.45rem 1.15rem", height: "34px", fontSize: "0.82rem" }}
                >
                  <span>Order Now</span>
                </a>
              </div>

              {/* Compact Trust Badges */}
              <div className="hero-trust-badges">
                <div className="hero-trust-item">
                  <Check size={12} style={{ color: "var(--gold)", flexShrink: 0 }} />
                  <span>100% Artisanal</span>
                </div>
                <div className="hero-trust-item">
                  <Check size={12} style={{ color: "var(--gold)", flexShrink: 0 }} />
                  <span>Direct Dialogue with Tina</span>
                </div>
                <div className="hero-trust-item">
                  <Check size={12} style={{ color: "var(--gold)", flexShrink: 0 }} />
                  <span>Studio White Clarity</span>
                </div>
              </div>
            </div>

            {/* Right: Featured Hero Creation Preview (Desktop/Tablet Only to keep mobile sleek & compact) */}
            {heroCake && (
              <div className="hero-preview-col">
                <div
                  style={{
                    background: "var(--glass-card-bg)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "0.65rem",
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 1), var(--shadow-sm)",
                    maxWidth: "270px",
                    width: "100%",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "var(--gold-subtle)",
                      border: "1px solid var(--gold-border)",
                      color: "var(--gold-dark)",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      padding: "0.18rem 0.5rem",
                      borderRadius: "var(--radius-full)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      zIndex: 3,
                    }}
                  >
                    <Sparkles size={10} style={{ color: "var(--gold-dark)" }} />
                    <span>Chef's Masterwork</span>
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
                        padding: "0.4rem",
                        borderRadius: "var(--radius-sm)",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getOptimizedImageUrl(heroCake.image_url, { width: 640 })}
                        alt={heroCake.name}
                        width={320}
                        height={320}
                        loading="eager"
                        decoding="async"
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    </div>
                  </Link>

                  <div style={{ paddingTop: "0.55rem", textAlign: "center" }}>
                    <span style={{ fontSize: "0.66rem", color: "var(--gold-dark)", textTransform: "uppercase", fontWeight: 600 }}>
                      {heroCake.category_name || "Signature"}
                    </span>
                    <h3 style={{ fontSize: "0.96rem", color: "var(--text-primary)", margin: "0.15rem 0 0.3rem" }}>
                      {heroCake.name}
                    </h3>
                    <p style={{ fontSize: "0.74rem", color: "var(--text-secondary)", fontStyle: "italic", marginBottom: "0.5rem" }}>
                      {heroCake.flavour}
                    </p>
                    <Link
                      href={`/cakes/${heroCake.slug}`}
                      className="btn-order-now"
                      style={{ height: "32px", fontSize: "0.76rem" }}
                    >
                      <span>Order Now</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. INFINITE 120HZ LUXURY MARQUEE TAPE (Strictly bounded within container-lux) */}
      <section className="marquee-section-wrapper">
        <div className="container-lux">
          <LuxuryMarqueeTape />
        </div>
      </section>

      {/* 3. COMPACT HORIZONTAL FEATURED CAKES (Mobile touch-friendly swipeable strip) */}
      <FeaturedCarousel
        cakes={featuredCakes}
        title="Trending & Chef's Spotlight"
        subtitle="Handcrafted tiers and seasonal favourites celebrating life's sweetest milestones"
      />

      {/* 4. ANIMATED ATELIER EDITORIAL POSTER BANNER */}
      <section style={{ padding: "0.5rem 0", background: "var(--bg-main)" }}>
        <div className="container-lux">
          <AtelierFeaturedPoster whatsappNumber={bakeryWhatsApp} />
        </div>
      </section>

      {/* 5. MAIN CAKE MARKETPLACE BROWSING (Category Story Strip + Toolbar + Responsive Grid) */}
      <section style={{ padding: "2rem 0 2.5rem", background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)" }} id="marketplace">
        <div className="container-lux">
          <MarketplaceListing
            initialCakes={cakes || []}
            categories={categories || []}
            showCategoryStrip={true}
            title="Browse All Creations"
            subtitle="Explore by occasion, profile, or search directly. Tap Order Now to customize."
          />
        </div>
      </section>

      {/* 6. DUAL EDITORIAL SHOWCASE POSTERS */}
      <section style={{ padding: "1.25rem 0 0.5rem", background: "var(--bg-cream)" }}>
        <div className="container-lux">
          <div style={{ textAlign: "center", maxWidth: "620px", margin: "0 auto 0.75rem" }}>
            <span className="cake-category-badge">Seasonal Creations</span>
            <h2 style={{ fontSize: "1.45rem", color: "var(--text-primary)", marginBottom: "0.25rem" }}>
              Curated Celebration Themes
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>
              Signature motifs and flavour compositions available for private reservation.
            </p>
          </div>

          <DualEditorialPosters />
        </div>
      </section>

      {/* 7. EDITORIAL MASONRY DISCOVERY SECTION */}
      {cakes && cakes.length > 0 && (
        <section style={{ padding: "2.25rem 0 2.75rem", background: "var(--bg-cream)", borderBottom: "1px solid var(--border-subtle)" }} id="inspiration-wall">
          <div className="container-lux">
            <div style={{ textAlign: "center", maxWidth: "620px", margin: "0 auto 1.5rem" }}>
              <span className="cake-category-badge">Editorial Discovery</span>
              <h2 style={{ fontSize: "1.6rem", color: "var(--text-primary)", marginBottom: "0.35rem" }}>
                The Haute Inspiration Wall
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.86rem" }}>
                An editorial gallery of bespoke tiered masterworks, botanical sugarcraft, and velvety ganaches.
              </p>
            </div>

            <MasonryGallery cakes={cakes || []} />
          </div>
        </section>
      )}

      {/* 6. ATELIER PHILOSOPHY & WHATSAPP CONSULTATION */}
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
              <h3 style={{ fontSize: "1.4rem", color: "var(--text-primary)", marginBottom: "0.55rem" }}>
                Slow Craftsmanship. Pure Single-Origin Cocoa. Hand-Piped Petals.
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.86rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                Every sponge is baked fresh from European churned butter and organic grains. We work closely with each patron over WhatsApp to tailor flavours, tiers, and personalized message cards.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <Link href="/about" className="btn-outline-gold" style={{ padding: "0.45rem 0.95rem", fontSize: "0.8rem" }}>
                  Our Story
                </Link>
                <Link href="/contact" className="btn-outline-gold" style={{ padding: "0.45rem 0.95rem", fontSize: "0.8rem" }}>
                  Custom Order Brief
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
              <h4 style={{ fontSize: "1.08rem", color: "var(--text-primary)", marginBottom: "0.35rem" }}>
                Have an Upcoming Celebration?
              </h4>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.85rem", lineHeight: 1.5 }}>
                Chat directly with Founder & Chef Pâtissier <strong>Tina Baidya</strong>. Share your date, aesthetic, and guest count for bespoke atelier creations.
              </p>
              <div style={{ fontSize: "0.78rem", color: "var(--gold-dark)", fontWeight: 600, marginBottom: "0.75rem" }}>
                Direct WhatsApp: +91 8768388868
              </div>
              <a
                href={`https://wa.me/${bakeryWhatsApp.replace(/[^0-9]/g, "")}?text=Hello%20Tina%20Baidya%2C%20I%20would%20like%20to%20consult%20about%20a%20bespoke%20cake%20for%20my%20event.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp icon-hover-lift"
                style={{ width: "100%", padding: "0.55rem 1rem", fontSize: "0.84rem", justifyContent: "center", gap: "0.4rem" }}
              >
                <WhatsAppIcon size={16} />
                <span>Chat with Tina on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
