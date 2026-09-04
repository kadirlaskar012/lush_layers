import React from "react";
import Link from "next/link";
import PublicLayout from "../components/PublicLayout";
import MasonryGallery from "../components/MasonryGallery";
import CategoryBar from "../components/CategoryBar";
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

  return (
    <PublicLayout>
      {/* 1. LUXURY HERO SECTION */}
      <section
        style={{
          position: "relative",
          padding: "6rem 0 7rem",
          overflow: "hidden",
          borderBottom: "1px solid var(--border-subtle)",
        }}
        id="hero-section"
      >
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "500px",
            background: "radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, rgba(14, 11, 10, 0) 70%)",
            pointerEvents: "none",
          }}
        />

        <div className="container-lux" style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <span
              style={{
                fontFamily: "var(--font-editorial)",
                fontSize: "1.1rem",
                letterSpacing: "0.25em",
                color: "var(--gold)",
                textTransform: "uppercase",
                fontStyle: "italic",
              }}
            >
              Artisanal Haute Pâtisserie
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              lineHeight: 1.15,
              marginBottom: "1.5rem",
              maxWidth: "1000px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Couture Confections, <br />
            <span className="text-gold-gradient">Crafted with Pure Love</span>
          </h1>

          <p
            style={{
              fontSize: "1.1rem",
              color: "var(--text-secondary)",
              maxWidth: "680px",
              margin: "0 auto 2.5rem",
              lineHeight: "1.8",
              fontWeight: 300,
            }}
          >
            Where architectural elegance meets pure indulgence. Every bespoke tier, velvety cream, and gilded flourish is handcrafted to order for your unforgettable celebrations.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "1.25rem", flexWrap: "wrap" }}>
            <Link href="/cakes" className="btn-gold" id="hero-browse-btn">
              Explore Collection
            </Link>
            <a
              href={`https://wa.me/${bakeryWhatsApp.replace(/[^0-9]/g, "")}?text=Hello%20LUSH%20LAYERS%2C%20I%20would%20like%20to%20enquire%20about%20ordering%20a%20bespoke%20cake.`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
              id="hero-whatsapp-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
              </svg>
              Order on WhatsApp
            </a>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "3rem",
              marginTop: "4.5rem",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.8rem", color: "var(--gold-light)" }}>
                100%
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Artisanal Handcrafted
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.8rem", color: "var(--gold-light)" }}>
                Zero Online Friction
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                WhatsApp Direct Dialogue
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.8rem", color: "var(--gold-light)" }}>
                Clean Studio
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Bespoke Sizing & Flavours
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SHOWCASE */}
      <section style={{ padding: "5rem 0" }} id="categories">
        <div className="container-lux">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <span className="cake-category-badge">Curated Portfolios</span>
              <h2 style={{ fontSize: "2.2rem", color: "var(--text-primary)" }}>
                Explore by Occasion & Taste
              </h2>
            </div>
            <Link href="/cakes" style={{ color: "var(--gold-light)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>
              View All Confections →
            </Link>
          </div>

          {/* Horizontal Category Bar */}
          <div style={{ marginBottom: "2.5rem" }}>
            <CategoryBar categories={categories} />
          </div>

          {/* Category Cards Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="glass-card"
                style={{
                  textDecoration: "none",
                  padding: "2rem 1.5rem",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "180px",
                }}
                id={`category-card-${cat.slug}`}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "rgba(212, 175, 55, 0.12)",
                    border: "1px solid var(--border-gold)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    marginBottom: "1rem",
                  }}
                >
                  🎂
                </div>
                <h3 style={{ fontSize: "1.15rem", color: "var(--text-primary)", marginBottom: "0.35rem" }}>
                  {cat.name}
                </h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  {cat.description || "Artisanal boutique confections"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. MASONRY CAKE GALLERY */}
      <section style={{ padding: "3rem 0 6rem" }} id="gallery">
        <div className="container-lux">
          <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 3.5rem" }}>
            <span className="cake-category-badge">The Masterpiece Gallery</span>
            <h2 style={{ fontSize: "2.5rem", color: "var(--text-primary)", marginBottom: "0.75rem" }}>
              Our Signature Creations
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
              Every cake is photographed on pure studio white to capture each sculpted petal, rich cocoa nuance, and golden accent. Click <strong>Order on WhatsApp</strong> on any cake to tailor your size and flavours.
            </p>
          </div>

          <MasonryGallery cakes={cakes} />
        </div>
      </section>

      {/* 4. CUSTOMER REVIEWS */}
      <section
        style={{
          padding: "6rem 0",
          background: "var(--bg-surface)",
          borderTop: "1px solid var(--border-subtle)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
        id="reviews"
      >
        <div className="container-lux">
          <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 3.5rem" }}>
            <span className="cake-category-badge">Guest Testimonials</span>
            <h2 style={{ fontSize: "2.4rem", color: "var(--text-primary)", marginBottom: "0.75rem" }}>
              Words of Delight
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
              Real praise from patrons whose weddings, birthdays, and anniversaries were illuminated by our cakes.
            </p>
          </div>

          {reviews && reviews.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "2rem",
                marginBottom: "3rem",
              }}
            >
              {reviews.slice(0, 3).map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
              No reviews yet. Be the first guest to share your celebration!
            </div>
          )}

          <div style={{ textAlign: "center" }}>
            <Link href="/reviews" className="btn-outline-gold">
              Read All Testimonials & Share Yours →
            </Link>
          </div>
        </div>
      </section>

      {/* 5. ABOUT LUSH LAYERS */}
      <section style={{ padding: "7rem 0" }} id="about">
        <div className="container-lux">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "4rem",
              alignItems: "center",
            }}
          >
            <div>
              <span className="cake-category-badge">Philosophy & Atelier</span>
              <h2 style={{ fontSize: "2.6rem", lineHeight: 1.2, marginBottom: "1.5rem" }}>
                Bespoke Artistry, <br />
                <span className="text-gold-gradient">Made with True Love</span>
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: "1.8", marginBottom: "1.25rem" }}>
                At <strong>LUSH LAYERS</strong>, we believe that an extraordinary celebration deserves an extraordinary centerpiece. We reject mass-production and pre-baked tiers in favor of slow, deliberate craftsmanship.
              </p>
              <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: "1.8", marginBottom: "2rem" }}>
                Every sponge is baked fresh from organic grain and European churned butter; every ganache originates from single-origin Callebaut Belgian chocolate; every flower is piped petal-by-petal with delicate Swiss buttercream.
              </p>

              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <Link href="/about" className="btn-gold">
                  Our Story & Origins
                </Link>
                <Link href="/contact" className="btn-outline-gold">
                  Visit the Atelier
                </Link>
              </div>
            </div>

            <div
              className="glass-card"
              style={{
                padding: "3rem",
                border: "1px solid var(--border-gold)",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <div style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "1.25rem" }}>
                <h4 style={{ color: "var(--gold-light)", fontSize: "1.15rem", marginBottom: "0.35rem" }}>
                  Bespoke Consultations
                </h4>
                <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>
                  Direct WhatsApp communication allows personalized flavour tastings, custom tiers, and dietary customizations.
                </p>
              </div>
              <div style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "1.25rem" }}>
                <h4 style={{ color: "var(--gold-light)", fontSize: "1.15rem", marginBottom: "0.35rem" }}>
                  Single-Origin Cocoa
                </h4>
                <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>
                  Imported Belgian Callebaut 70% and velvety white chocolate mousse layers crafted without artificial stabilizers.
                </p>
              </div>
              <div>
                <h4 style={{ color: "var(--gold-light)", fontSize: "1.15rem", marginBottom: "0.35rem" }}>
                  Pristine Presentation
                </h4>
                <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>
                  Studio-quality finishing delivered in climate-controlled transport to guarantee flawless arrival at your venue.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WHATSAPP ENQUIRY BANNER */}
      <section
        style={{
          padding: "5rem 0",
          background: "linear-gradient(135deg, #1C1614 0%, #120E0D 100%)",
          borderTop: "1px solid var(--border-gold)",
          textAlign: "center",
        }}
      >
        <div className="container-lux">
          <h2 style={{ fontSize: "2.2rem", color: "var(--text-primary)", marginBottom: "1rem" }}>
            Ready to Celebrate in Unmatched Elegance?
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: "600px", margin: "0 auto 2rem" }}>
            Reach out directly through WhatsApp. Our master baker will discuss your event, recommended portions, and bespoke design.
          </p>
          <a
            href={`https://wa.me/${bakeryWhatsApp.replace(/[^0-9]/g, "")}?text=Hello%20LUSH%20LAYERS%2C%20I%20would%20like%20to%20place%20an%20enquiry.`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
            style={{ padding: "1rem 2.5rem", fontSize: "1rem" }}
          >
            Chat with Our Master Baker on WhatsApp
          </a>
        </div>
      </section>
    </PublicLayout>
  );
}
