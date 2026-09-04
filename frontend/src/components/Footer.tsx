import React from "react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const bakeryWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "1234567890";

  return (
    <footer
      style={{
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border-gold)",
        paddingTop: "5rem",
        paddingBottom: "3rem",
        marginTop: "6rem",
      }}
      id="site-footer"
    >
      <div className="container-lux">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "3.5rem",
            marginBottom: "4rem",
          }}
        >
          {/* Brand Col */}
          <div>
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.85rem",
                letterSpacing: "0.15em",
                color: "var(--gold-light)",
                textTransform: "uppercase",
                display: "block",
                marginBottom: "0.35rem",
              }}
            >
              LUSH LAYERS
            </span>
            <span
              style={{
                fontFamily: "var(--font-editorial)",
                fontSize: "1rem",
                letterSpacing: "0.2em",
                color: "var(--gold)",
                fontStyle: "italic",
                display: "block",
                marginBottom: "1.25rem",
              }}
            >
              Made with Love
            </span>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.92rem",
                lineHeight: "1.7",
                marginBottom: "1.5rem",
              }}
            >
              Boutique artisanal cake studio devoted to bespoke culinary artistry, exceptional ingredients, and unforgettable milestone celebrations.
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  background: "#25D366",
                  borderRadius: "50%",
                  display: "inline-block",
                }}
              ></span>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Orders exclusively via WhatsApp
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.15rem",
                color: "var(--gold-light)",
                marginBottom: "1.25rem",
                letterSpacing: "0.05em",
              }}
            >
              The Confections
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <li>
                <Link href="/cakes" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9rem" }}>
                  All Signature Cakes
                </Link>
              </li>
              <li>
                <Link href="/category/signature-tiered" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9rem" }}>
                  Signature Tiered
                </Link>
              </li>
              <li>
                <Link href="/category/bespoke-birthday" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9rem" }}>
                  Bespoke Birthday
                </Link>
              </li>
              <li>
                <Link href="/category/pure-belgian-chocolate" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9rem" }}>
                  Pure Belgian Chocolate
                </Link>
              </li>
              <li>
                <Link href="/category/botanical-floral" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9rem" }}>
                  Botanical & Floral
                </Link>
              </li>
            </ul>
          </div>

          {/* Boutique Atelier */}
          <div>
            <h4
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.15rem",
                color: "var(--gold-light)",
                marginBottom: "1.25rem",
                letterSpacing: "0.05em",
              }}
            >
              Atelier & Hours
            </h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.7", marginBottom: "0.75rem" }}>
              <strong>Boutique Studio:</strong><br />
              14 Kensington Crescent, Atelier 4B<br />
              London & Metropolitan Delivery
            </p>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.7" }}>
              <strong>Consultation Hours:</strong><br />
              Tuesday – Saturday: 9:00 AM – 7:00 PM<br />
              Sunday: 10:00 AM – 4:00 PM
            </p>
          </div>

          {/* WhatsApp Direct Line */}
          <div>
            <h4
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.15rem",
                color: "var(--gold-light)",
                marginBottom: "1.25rem",
                letterSpacing: "0.05em",
              }}
            >
              Enquire Directly
            </h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.7", marginBottom: "1.25rem" }}>
              Have a bespoke vision, tiered wedding enquiry, or specific dietary requirement? Speak directly with our master decorator.
            </p>
            <a
              href={`https://wa.me/${bakeryWhatsApp.replace(/[^0-9]/g, "")}?text=Hello%20LUSH%20LAYERS`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
              style={{ width: "100%", textAlign: "center" }}
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: "1px solid var(--border-subtle)",
            paddingTop: "2rem",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            fontSize: "0.82rem",
            color: "var(--text-muted)",
          }}
        >
          <div>
            © {currentYear} LUSH LAYERS. Handcrafted with passion and love. All rights reserved.
          </div>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <Link href="/about" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
              About Us
            </Link>
            <Link href="/reviews" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
              Reviews
            </Link>
            <Link href="/contact" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
              Contact
            </Link>
            <Link href="/admin" style={{ color: "var(--gold)", textDecoration: "none" }}>
              Staff Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
