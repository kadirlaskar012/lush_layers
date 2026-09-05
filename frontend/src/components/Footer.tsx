import React from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import WhatsAppIcon from "./WhatsAppIcon";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const bakeryWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918768388868";

  return (
    <footer
      style={{
        background: "var(--bg-cream)",
        borderTop: "1px solid var(--border-subtle)",
        paddingTop: "2.5rem",
        paddingBottom: "1.75rem",
        marginTop: "2.5rem",
      }}
      id="site-footer"
    >
      <div className="container-lux">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "2rem",
            marginBottom: "2rem",
          }}
        >
          {/* Brand Col */}
          <div>
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.35rem",
                letterSpacing: "0.12em",
                color: "var(--text-primary)",
                textTransform: "uppercase",
                display: "block",
                fontWeight: 700,
              }}
            >
              LUSH LAYERS
            </span>
            <span
              style={{
                fontFamily: "var(--font-editorial)",
                fontSize: "0.85rem",
                letterSpacing: "0.15em",
                color: "var(--gold)",
                fontStyle: "italic",
                display: "block",
                marginBottom: "0.5rem",
              }}
            >
              Made with Love • By Tina Baidya
            </span>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.82rem",
                lineHeight: "1.6",
                marginBottom: "0.85rem",
              }}
            >
              Boutique artisanal confectionery atelier founded by cake artist Tina Baidya. Dedicated to bespoke culinary artistry, single-origin Belgian chocolate, and unforgettable celebrations.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.75rem" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <MapPin size={14} color="var(--gold-dark)" />
                <span style={{ fontSize: "0.78rem", color: "var(--text-primary)", fontWeight: 500 }}>
                  PD Road, Kolkata-41, India
                </span>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <WhatsAppIcon size={14} />
                <span style={{ fontSize: "0.78rem", color: "var(--whatsapp)", fontWeight: 600 }}>
                  Direct: +91 8768388868
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              style={{
                fontSize: "0.95rem",
                color: "var(--text-primary)",
                marginBottom: "0.85rem",
                fontWeight: 600,
              }}
            >
              Collections
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <li>
                <Link href="/cakes" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.82rem" }}>
                  All Signature Creations
                </Link>
              </li>
              <li>
                <Link href="/category/signature-tiered" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.82rem" }}>
                  Signature Tiered Cakes
                </Link>
              </li>
              <li>
                <Link href="/category/botanical-floral" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.82rem" }}>
                  Botanical & Sugar Floral
                </Link>
              </li>
              <li>
                <Link href="/category/pure-belgian-chocolate" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.82rem" }}>
                  Pure Belgian Chocolate
                </Link>
              </li>
            </ul>
          </div>

          {/* Atelier Experience */}
          <div>
            <h4
              style={{
                fontSize: "0.95rem",
                color: "var(--text-primary)",
                marginBottom: "0.85rem",
                fontWeight: 600,
              }}
            >
              Atelier
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <li>
                <Link href="/about" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.82rem" }}>
                  Our Philosophy & Story
                </Link>
              </li>
              <li>
                <Link href="/reviews" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.82rem" }}>
                  Guest Testimonials
                </Link>
              </li>
              <li>
                <Link href="/contact" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.82rem" }}>
                  Bespoke Tasting Brief
                </Link>
              </li>
              <li>
                <Link href="/admin" style={{ color: "var(--gold-dark)", textDecoration: "none", fontSize: "0.82rem", fontWeight: 600 }}>
                  Management Atelier
                </Link>
              </li>
            </ul>
          </div>

          {/* WhatsApp Direct Order */}
          <div>
            <h4
              style={{
                fontSize: "0.95rem",
                color: "var(--text-primary)",
                marginBottom: "0.85rem",
                fontWeight: 600,
              }}
            >
              Enquire Directly
            </h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.5, marginBottom: "0.85rem" }}>
              Direct dialogue with our master pâtissier for dates, sizes, and custom flavour pairings.
            </p>
            <a
              href={`https://wa.me/${bakeryWhatsApp.replace(/[^0-9]/g, "")}?text=Hello%20LUSH%20LAYERS%2C%20I%20would%20like%20to%20place%20an%20enquiry.`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp icon-hover-lift"
              style={{ width: "100%", padding: "0.48rem 0.85rem", fontSize: "0.8rem", justifyContent: "center", gap: "0.4rem" }}
            >
              <WhatsAppIcon size={16} />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: "1px solid var(--border-subtle)",
            paddingTop: "1.25rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
            © {currentYear} LUSH LAYERS • Made with Love • PD Road, Kolkata-41, India
          </div>
          <div style={{ display: "flex", gap: "1rem", fontSize: "0.76rem" }}>
            <Link href="/cakes" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
              Artisanal Catalog
            </Link>
            <Link href="/about" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
              Our Story
            </Link>
            <Link href="/contact" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
