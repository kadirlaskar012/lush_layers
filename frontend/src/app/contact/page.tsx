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
      <div style={{ paddingTop: "4rem", paddingBottom: "7rem" }}>
        <div className="container-lux">
          {/* Header */}
          <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 4rem" }}>
            <span className="cake-category-badge">Personal Dialogue</span>
            <h1 style={{ fontSize: "3.2rem", color: "var(--text-primary)", marginBottom: "1rem" }}>
              Connect with Our Atelier
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", lineHeight: "1.8" }}>
              Whether envisioning a grand tiered wedding celebration or an intimate birthday surprise, we welcome your enquiry.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: "3.5rem",
              maxWidth: "1100px",
              margin: "0 auto",
            }}
          >
            {/* Contact Card Left */}
            <div
              className="glass-card"
              style={{
                padding: "3rem 2.5rem",
                border: "1px solid var(--border-gold)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h3 style={{ fontSize: "1.6rem", color: "var(--gold-light)", marginBottom: "1.5rem" }}>
                  Studio & Atelier
                </h3>

                <div style={{ marginBottom: "2rem" }}>
                  <div style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                    Location:
                  </div>
                  <p style={{ color: "var(--text-primary)", fontSize: "1rem", lineHeight: "1.7" }}>
                    14 Kensington Crescent, Atelier 4B<br />
                    Royal Borough of Kensington<br />
                    London W8 5EP
                  </p>
                </div>

                <div style={{ marginBottom: "2rem" }}>
                  <div style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                    Tasting & Consultation Hours:
                  </div>
                  <p style={{ color: "var(--text-primary)", fontSize: "1rem", lineHeight: "1.7" }}>
                    Tuesday – Saturday: 9:00 AM – 7:00 PM<br />
                    Sunday: 10:00 AM – 4:00 PM<br />
                    <em>Monday: Private Baking & Tasting Sessions</em>
                  </p>
                </div>

                <div>
                  <div style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                    Direct WhatsApp Helpline:
                  </div>
                  <p style={{ color: "var(--gold-light)", fontSize: "1.1rem", fontWeight: 600 }}>
                    +{bakeryWhatsApp}
                  </p>
                </div>
              </div>

              <div style={{ marginTop: "2.5rem" }}>
                <a
                  href={`https://wa.me/${bakeryWhatsApp.replace(/[^0-9]/g, "")}?text=Hello%20LUSH%20LAYERS%2C%20I%20would%20like%20to%20enquire%20about%20a%20consultation.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                  style={{ width: "100%", textAlign: "center", padding: "1rem" }}
                >
                  Message Directly on WhatsApp
                </a>
              </div>
            </div>

            {/* General Enquiry Form */}
            <div
              className="glass-card"
              style={{
                padding: "3rem 2.5rem",
              }}
            >
              <h3 style={{ fontSize: "1.6rem", color: "var(--gold-light)", marginBottom: "0.75rem" }}>
                Bespoke Enquiry
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "2rem" }}>
                Submit this quick brief to immediately draft your celebration concept for our master decorator.
              </p>

              <ContactForm bakeryWhatsApp={bakeryWhatsApp} />
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
