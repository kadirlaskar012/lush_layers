import React from "react";
import Link from "next/link";
import PublicLayout from "../../components/PublicLayout";
import { Cookie, Flower2, Sparkles, MapPin } from "lucide-react";
import WhatsAppIcon from "../../components/WhatsAppIcon";

export const metadata = {
  title: "Our Story & Artisanal Philosophy • LUSH LAYERS",
  description: "Learn about the masters, ingredients, and slow craft behind LUSH LAYERS boutique bakery.",
};

export default function AboutPage() {
  const bakeryWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "1234567890";

  return (
    <PublicLayout>
      <div style={{ paddingTop: "2rem", paddingBottom: "3.5rem" }}>
        <div className="container-lux">
          {/* Header - Compact */}
          <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 2rem" }}>
            <span className="cake-category-badge">The Atelier Story</span>
            <h1 style={{ fontSize: "2rem", lineHeight: 1.2, marginBottom: "0.5rem", color: "var(--text-primary)" }}>
              Handcrafted with Passion, <br />
              <span className="text-gold-gradient">Made with Eternal Love</span>
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: "1.6" }}>
              Founded on the belief that life's most cherished milestones deserve edible centerpieces of timeless beauty, exceptional ingredients, and architectural finesse.
            </p>
          </div>

          {/* Pillars Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1.25rem",
              marginBottom: "2.5rem",
            }}
          >
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "1.5rem",
                boxShadow: "var(--shadow-xs)",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "var(--radius-xs)",
                  background: "#FEF3C7",
                  border: "1px solid #FDE68A",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "0.75rem",
                  color: "#92400E",
                }}
              >
                <Cookie size={20} />
              </div>
              <h3 style={{ fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: "0.4rem" }}>
                Pure Callebaut Cocoa
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: "1.6" }}>
                We exclusively source sustainable single-origin Belgian chocolate. From 70% dark ganache infusions to airy white chocolate mousse, our layers deliver pure, velvety richness without artificial shortenings.
              </p>
            </div>

            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "1.5rem",
                boxShadow: "var(--shadow-xs)",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "var(--radius-xs)",
                  background: "#FCE7F3",
                  border: "1px solid #FBCFE8",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "0.75rem",
                  color: "#9D174D",
                }}
              >
                <Flower2 size={20} />
              </div>
              <h3 style={{ fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: "0.4rem" }}>
                Botanical & Floral Infusions
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: "1.6" }}>
                Real Bourbon vanilla beans from Madagascar, organic wild raspberries, and delicate rosewater infusions impart depth and subtlety to every crumb and Swiss meringue buttercream petal.
              </p>
            </div>

            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "1.5rem",
                boxShadow: "var(--shadow-xs)",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "var(--radius-xs)",
                  background: "var(--bg-cream)",
                  border: "1px solid var(--gold-border)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "0.75rem",
                  color: "var(--gold-dark)",
                }}
              >
                <Sparkles size={20} />
              </div>
              <h3 style={{ fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: "0.4rem" }}>
                Architectural Precision
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: "1.6" }}>
                Every tier is structurally balanced with precision dowelling and finished on studio turntables. From modern sharp edges to flowing bas-relief textures, your cake arrives venue-ready.
              </p>
            </div>
          </div>

          {/* Consultation Card */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "1.75rem",
              textAlign: "center",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", color: "var(--text-primary)", marginBottom: "0.4rem" }}>
              Discuss Your Celebration with Our Master Pâtissier
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.86rem", maxWidth: "550px", margin: "0 auto 0.75rem" }}>
              We design every tier around your aesthetic, guest count, and palette desires. Direct conversation via WhatsApp guarantees personal attention.
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", marginBottom: "1.25rem", background: "var(--bg-cream)", padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)", border: "1px solid var(--border-subtle)" }}>
              <MapPin size={14} color="var(--gold-dark)" />
              <span style={{ fontSize: "0.78rem", color: "var(--text-primary)", fontWeight: 600 }}>Atelier Location: PD Road, Kolkata-41, India</span>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <Link href="/cakes" className="btn-gold" style={{ padding: "0.5rem 1.2rem", fontSize: "0.84rem" }}>
                Browse Catalog
              </Link>
              <a
                href={`https://wa.me/${bakeryWhatsApp.replace(/[^0-9]/g, "")}?text=Hello%20LUSH%20LAYERS%2C%20I%20would%20like%20to%20consult%20about%20a%20bespoke%20cake.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp icon-hover-lift"
                style={{ padding: "0.5rem 1.2rem", fontSize: "0.84rem", gap: "0.4rem" }}
              >
                <WhatsAppIcon size={16} />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
