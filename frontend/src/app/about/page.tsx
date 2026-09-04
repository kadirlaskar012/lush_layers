import React from "react";
import Link from "next/link";
import PublicLayout from "../../components/PublicLayout";

export const metadata = {
  title: "Our Story & Artisanal Philosophy • LUSH LAYERS",
  description: "Learn about the masters, ingredients, and slow craft behind LUSH LAYERS boutique bakery.",
};

export default function AboutPage() {
  const bakeryWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "1234567890";

  return (
    <PublicLayout>
      <div style={{ paddingTop: "4rem", paddingBottom: "7rem" }}>
        <div className="container-lux">
          {/* Header */}
          <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 4.5rem" }}>
            <span className="cake-category-badge">The Atelier Story</span>
            <h1 style={{ fontSize: "3.2rem", lineHeight: 1.2, marginBottom: "1.25rem" }}>
              Handcrafted with Passion, <br />
              <span className="text-gold-gradient">Made with Eternal Love</span>
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", lineHeight: "1.8" }}>
              Founded on the belief that life's most cherished milestones deserve edible centerpieces of timeless beauty, unforgettable flavour, and architectural finesse.
            </p>
          </div>

          {/* Pillars */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2.5rem",
              marginBottom: "5rem",
            }}
          >
            <div className="glass-card" style={{ padding: "2.5rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🍫</div>
              <h3 style={{ fontSize: "1.35rem", color: "var(--gold-light)", marginBottom: "0.75rem" }}>
                Pure Callebaut Cocoa
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.7" }}>
                We exclusively source sustainable single-origin Belgian chocolate. From 70% dark ganache infusions to airy white chocolate mousse, our layers deliver pure, velvety richness without artificial shortenings.
              </p>
            </div>

            <div className="glass-card" style={{ padding: "2.5rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🌸</div>
              <h3 style={{ fontSize: "1.35rem", color: "var(--gold-light)", marginBottom: "0.75rem" }}>
                Botanical & Floral Infusions
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.7" }}>
                Real Bourbon vanilla beans from Madagascar, organic wild raspberries, and delicate rosewater infusions impart depth and subtlety to every crumb and Swiss meringue buttercream petal.
              </p>
            </div>

            <div className="glass-card" style={{ padding: "2.5rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🏛️</div>
              <h3 style={{ fontSize: "1.35rem", color: "var(--gold-light)", marginBottom: "0.75rem" }}>
                Bespoke Atelier Approach
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.7" }}>
                No conveyor belts. No cold storage presets. Every single cake is envisioned, baked, assembled, and decorated specifically for your gathering, discussed directly with our master decorator via WhatsApp.
              </p>
            </div>
          </div>

          {/* Story Narrative */}
          <div
            className="glass-card"
            style={{
              padding: "4rem 3rem",
              border: "1px solid var(--border-gold)",
              maxWidth: "960px",
              margin: "0 auto",
            }}
          >
            <h2 style={{ fontSize: "2.2rem", marginBottom: "1.5rem", color: "var(--text-primary)" }}>
              The LUSH LAYERS Promise
            </h2>
            <div style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: "1.9" }}>
              <p style={{ marginBottom: "1.5rem" }}>
                A cake is rarely consumed in ordinary moments. It stands at the center of weddings, landmark birthdays, newborn welcomes, and golden jubilees. It is the artifact around which guests gather, songs are sung, and vows are toasted.
              </p>
              <p style={{ marginBottom: "1.5rem" }}>
                That sacred role drives everything we do at <strong>LUSH LAYERS</strong>. We operate intentionally without standard online shopping carts or automated checkout fees. We believe you should converse directly with the artists crafting your confection.
              </p>
              <p>
                From initial flavour tasting discussions on WhatsApp to climate-conditioned white-glove arrival at your venue, our pledge is absolute culinary and visual perfection.
              </p>
            </div>

            <div style={{ marginTop: "3rem", display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
              <Link href="/cakes" className="btn-gold">
                View Our Creations
              </Link>
              <a
                href={`https://wa.me/${bakeryWhatsApp.replace(/[^0-9]/g, "")}?text=Hello%20LUSH%20LAYERS%2C%20I%20would%20like%20to%20consult%20on%20a%20bespoke%20cake.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
              >
                Chat with the Baker
              </a>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
