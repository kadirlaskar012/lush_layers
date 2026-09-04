import React from "react";
import PublicLayout from "../../components/PublicLayout";
import ContactForm from "../../components/ContactForm";

export const metadata = {
  title: "Contact & Atelier Consultations • LUSH LAYERS",
  description: "Connect directly with our master bakers on WhatsApp or visit our boutique cake atelier.",
};

export default function ContactPage() {
  const bakeryWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "1234567890";

  return (
    <PublicLayout>
      <div style={{ paddingTop: "2rem", paddingBottom: "3.5rem" }}>
        <div className="container-lux">
          {/* Header - Compact */}
          <div style={{ textAlign: "center", maxWidth: "650px", margin: "0 auto 2rem" }}>
            <span className="cake-category-badge">Personal Dialogue</span>
            <h1 style={{ fontSize: "1.85rem", color: "var(--text-primary)", marginBottom: "0.4rem" }}>
              Connect with Our Atelier
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
              Whether envisioning a grand tiered wedding celebration or an intimate birthday surprise, we welcome your enquiry.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.5rem",
              maxWidth: "960px",
              margin: "0 auto",
            }}
          >
            {/* Contact Card Left */}
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "1.5rem",
                boxShadow: "var(--shadow-xs)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h3 style={{ fontSize: "1.2rem", color: "var(--text-primary)", marginBottom: "1rem" }}>
                  Studio & Atelier
                </h3>

                <div style={{ marginBottom: "1.25rem" }}>
                  <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: "0.2rem", fontWeight: 600 }}>
                    Location:
                  </div>
                  <p style={{ color: "var(--text-primary)", fontSize: "0.86rem", lineHeight: "1.5" }}>
                    14 Kensington Crescent, Atelier 4B<br />
                    Royal Borough of Kensington<br />
                    London W8 5EP
                  </p>
                </div>

                <div style={{ marginBottom: "1.25rem" }}>
                  <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: "0.2rem", fontWeight: 600 }}>
                    Consultation Hours:
                  </div>
                  <p style={{ color: "var(--text-primary)", fontSize: "0.86rem", lineHeight: "1.5" }}>
                    Tuesday – Saturday: 10:00 – 18:30<br />
                    Sunday Tasting Salon: By Appointment<br />
                    Monday: Closed for Studio Baking
                  </p>
                </div>

                <div>
                  <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: "0.2rem", fontWeight: 600 }}>
                    Direct WhatsApp:
                  </div>
                  <p style={{ color: "var(--whatsapp)", fontSize: "0.88rem", fontWeight: 600 }}>
                    {bakeryWhatsApp}
                  </p>
                </div>
              </div>

              <div style={{ marginTop: "1.5rem", borderTop: "1px solid var(--border-light)", paddingTop: "1rem" }}>
                <a
                  href={`https://wa.me/${bakeryWhatsApp.replace(/[^0-9]/g, "")}?text=Hello%20LUSH%20LAYERS%2C%20I%20would%20like%20to%20plan%20a%20tasting%20appointment.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                  style={{ width: "100%", justifyContent: "center", padding: "0.55rem 1rem", fontSize: "0.82rem" }}
                >
                  Schedule WhatsApp Consultation
                </a>
              </div>
            </div>

            {/* Bespoke Brief Form Right */}
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "1.5rem",
                boxShadow: "var(--shadow-xs)",
              }}
            >
              <h3 style={{ fontSize: "1.2rem", color: "var(--text-primary)", marginBottom: "0.3rem" }}>
                Send a Bespoke Brief
              </h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                Fills a structured WhatsApp enquiry with your celebration date, guest count, and design vision.
              </p>
              <ContactForm bakeryWhatsApp={bakeryWhatsApp} />
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
