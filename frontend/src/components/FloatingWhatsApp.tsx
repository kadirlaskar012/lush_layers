"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { X, Send, CheckCircle2, Copy, Check, Cake, MapPin, User, Phone, Sparkles, MessageCircle } from "lucide-react";
import WhatsAppIcon from "./WhatsAppIcon";
import { createEnquiry, getCategories } from "../lib/api";

const FALLBACK_CATEGORIES = [
  "Birthday Cakes",
  "Wedding & Tiered Cakes",
  "Anniversary & Romance",
  "Bento & Petite Cakes",
  "Botanical & Floral Cakes",
  "Pure Belgian Chocolate",
  "Custom & Theme Cakes",
  "Other / Bespoke Creation",
];

const FLAVOUR_CHIPS = [
  "Belgian Chocolate",
  "Madagascar Vanilla",
  "Salted Caramel",
  "Red Velvet",
  "Lotus Biscoff",
  "Fresh Strawberry",
];

export default function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>(FALLBACK_CATEGORIES);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("Birthday Cakes");
  const [flavour, setFlavour] = useState("");
  const [notes, setNotes] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [submittedUrl, setSubmittedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const bakeryWhatsAppNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918768388868";

  // Fetch website categories on mount
  useEffect(() => {
    let isMounted = true;
    getCategories()
      .then((cats) => {
        if (isMounted && Array.isArray(cats) && cats.length > 0) {
          const names = cats.map((c) => c.name);
          if (!names.includes("Other / Bespoke Creation")) {
            names.push("Other / Bespoke Creation");
          }
          setCategories(names);
          if (!category && names[0]) {
            setCategory(names[0]);
          }
        }
      })
      .catch((err) => {
        console.warn("Using fallback categories for floating WhatsApp:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Close when clicking outside panel
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        const trigger = document.getElementById("floating-whatsapp-trigger");
        if (trigger && trigger.contains(e.target as Node)) {
          return;
        }
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handlePointerDown);
    }
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen]);

  const handleCopyRef = () => {
    if (!submittedRef) return;
    navigator.clipboard.writeText(submittedRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleResetForm = () => {
    setName("");
    setPhone("");
    setAddress("");
    setCategory(categories[0] || "Birthday Cakes");
    setFlavour("");
    setNotes("");
    setError("");
    setSubmittedRef(null);
    setSubmittedUrl(null);
    setCopied(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter your phone/WhatsApp number.");
      return;
    }
    if (!address.trim()) {
      setError("Please enter your delivery or event address.");
      return;
    }
    if (!category.trim()) {
      setError("Please select a cake category.");
      return;
    }
    if (!flavour.trim()) {
      setError("Please enter or choose your preferred flavour.");
      return;
    }

    setIsSubmitting(true);

    let enquiryNum = `LL-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const created = await createEnquiry({
        customer_name: name.trim(),
        phone: phone.trim(),
        cake_name: `${category} (Bespoke Floating Enquiry)`,
        flavour: flavour.trim(),
        selected_size: "Custom / Atelier Consultation",
        custom_message: `Delivery Address: ${address.trim()}${notes.trim() ? ` | Notes: ${notes.trim()}` : ""}`,
      });
      if (created?.enquiry_number) {
        enquiryNum = created.enquiry_number;
      }
    } catch (err) {
      console.warn("Could not record enquiry in background:", err);
    }

    // STRICT ZERO-PRICE WHATSAPP MESSAGE
    const messageLines = [
      "Hello LUSH LAYERS,",
      "",
      `*Bespoke Cake Enquiry (Ref: ${enquiryNum})*`,
      "",
      `• Patron Name: ${name.trim()}`,
      `• Contact Phone: ${phone.trim()}`,
      `• Delivery / Event Address: ${address.trim()}`,
      `• Cake Category: ${category}`,
      `• Preferred Flavour: ${flavour.trim()}`,
    ];

    if (notes.trim()) {
      messageLines.push(`• Event Date / Details: ${notes.trim()}`);
    }

    messageLines.push("", "Kindly let me know the availability and bespoke consultation details.");

    const encoded = encodeURIComponent(messageLines.join("\n"));
    const waUrl = `https://wa.me/${bakeryWhatsAppNumber.replace(/[^0-9]/g, "")}?text=${encoded}`;

    setSubmittedRef(enquiryNum);
    setSubmittedUrl(waUrl);
    setIsSubmitting(false);

    // Launch WhatsApp
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <aside className="floating-wa-aside" aria-label="WhatsApp floating contact">
        <button
          id="floating-whatsapp-trigger"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close WhatsApp enquiry" : "Open WhatsApp enquiry"}
          className="floating-wa-btn"
        >
          <div className="floating-wa-icon-box">
            {isOpen ? <X size={20} /> : <WhatsAppIcon size={22} />}
          </div>

          <div className="floating-wa-label">
            <span style={{ fontSize: "0.84rem", fontWeight: 700, lineHeight: 1.15, color: "#FFFFFF" }}>
              {isOpen ? "Close Enquiry" : "Order on WhatsApp"}
            </span>
            <span
              style={{
                fontFamily: "var(--font-editorial)",
                fontStyle: "italic",
                fontSize: "0.74rem",
                color: "var(--gold-light)",
                lineHeight: 1,
              }}
            >
              Direct with Chef Tina
            </span>
          </div>
        </button>
      </aside>

      {/* Floating Modal / Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="floating-whatsapp-title"
          ref={panelRef}
          style={{
            position: "fixed",
            bottom: "86px",
            right: "24px",
            width: "390px",
            maxWidth: "calc(100vw - 32px)",
            maxHeight: "calc(100vh - 110px)",
            background: "var(--bg-surface)",
            border: "1px solid var(--gold-border)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "0 20px 50px rgba(26, 46, 34, 0.22), 0 6px 18px rgba(0, 0, 0, 0.08)",
            zIndex: 9998,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            animation: "fadeInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
          id="floating-whatsapp-modal"
        >
          {/* Header Banner */}
          <div
            style={{
              padding: "1.1rem 1.25rem 0.95rem",
              background: "linear-gradient(135deg, var(--bg-cream) 0%, var(--bg-main) 100%)",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <WhatsAppIcon size={18} style={{ color: "var(--whatsapp)" }} />
                <h3
                  id="floating-whatsapp-title"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    margin: 0,
                    letterSpacing: "0.02em",
                  }}
                >
                  LUSH LAYERS
                </h3>
              </div>
              <p
                style={{
                  margin: "0.15rem 0 0",
                  fontFamily: "var(--font-editorial)",
                  fontStyle: "italic",
                  fontSize: "0.82rem",
                  color: "var(--gold-dark)",
                }}
              >
                Bespoke Cake Consultation • Kolkata
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close form"
              style={{
                background: "var(--bg-main)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Body Content */}
          <div style={{ padding: "1.15rem 1.25rem 1.35rem" }}>
            {submittedRef ? (
              /* Success Confirmation Card */
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  padding: "0.75rem 0",
                  gap: "0.85rem",
                }}
              >
                <div
                  style={{
                    width: "54px",
                    height: "54px",
                    borderRadius: "50%",
                    background: "var(--whatsapp-soft)",
                    color: "var(--whatsapp)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(37, 211, 102, 0.3)",
                  }}
                >
                  <CheckCircle2 size={30} />
                </div>

                <div>
                  <h4
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      margin: "0 0 0.25rem",
                    }}
                  >
                    Enquiry Sent to WhatsApp!
                  </h4>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0 }}>
                    Chef Tina Baidya will review your details shortly on WhatsApp.
                  </p>
                </div>

                {/* Reference Number Box */}
                <div
                  style={{
                    width: "100%",
                    background: "var(--bg-cream)",
                    border: "1px solid var(--gold-border)",
                    borderRadius: "var(--radius-md)",
                    padding: "0.85rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Enquiry Reference
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: "1.15rem",
                        fontWeight: 700,
                        color: "var(--gold-dark)",
                      }}
                    >
                      {submittedRef}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyRef}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      background: "var(--bg-main)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-xs)",
                      padding: "0.35rem 0.65rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      cursor: "pointer",
                    }}
                  >
                    {copied ? <Check size={14} style={{ color: "var(--whatsapp)" }} /> : <Copy size={14} />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "0.55rem", marginTop: "0.35rem" }}>
                  {submittedUrl && (
                    <a
                      href={submittedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-whatsapp"
                      style={{ width: "100%", justifyContent: "center", padding: "0.6rem 1rem", fontSize: "0.84rem" }}
                    >
                      <WhatsAppIcon size={16} />
                      <span>Re-open WhatsApp Chat</span>
                    </a>
                  )}

                  <Link
                    href={`/track?ref=${encodeURIComponent(submittedRef)}`}
                    onClick={() => setIsOpen(false)}
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--gold-dark)",
                      textDecoration: "underline",
                      fontWeight: 600,
                      marginTop: "0.2rem",
                    }}
                  >
                    Track enquiry status online →
                  </Link>

                  <button
                    type="button"
                    onClick={handleResetForm}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--text-secondary)",
                      fontSize: "0.76rem",
                      cursor: "pointer",
                      textDecoration: "underline",
                      marginTop: "0.4rem",
                    }}
                  >
                    Submit another cake enquiry
                  </button>
                </div>
              </div>
            ) : (
              /* Enquiry Input Form */
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {error && (
                  <div
                    style={{
                      padding: "0.55rem 0.75rem",
                      background: "#FEE2E2",
                      border: "1px solid #F87171",
                      borderRadius: "var(--radius-sm)",
                      color: "#991B1B",
                      fontSize: "0.78rem",
                    }}
                  >
                    {error}
                  </div>
                )}

                {/* Customer Name */}
                <div>
                  <label
                    htmlFor="fw-customer-name"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: "0.28rem",
                    }}
                  >
                    <User size={13} style={{ color: "var(--gold-dark)" }} />
                    <span>Your Name (আপনার নাম) *</span>
                  </label>
                  <input
                    id="fw-customer-name"
                    type="text"
                    required
                    placeholder="e.g. Tina / Ananya / Sourav"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.45rem 0.75rem",
                      background: "var(--bg-main)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.84rem",
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label
                    htmlFor="fw-phone"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: "0.28rem",
                    }}
                  >
                    <Phone size={13} style={{ color: "var(--gold-dark)" }} />
                    <span>Phone / WhatsApp (ফোন নম্বর) *</span>
                  </label>
                  <input
                    id="fw-phone"
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.45rem 0.75rem",
                      background: "var(--bg-main)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.84rem",
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                  />
                </div>

                {/* Delivery Address */}
                <div>
                  <label
                    htmlFor="fw-address"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: "0.28rem",
                    }}
                  >
                    <MapPin size={13} style={{ color: "var(--gold-dark)" }} />
                    <span>Delivery Address (ঠিকানা) *</span>
                  </label>
                  <input
                    id="fw-address"
                    type="text"
                    required
                    placeholder="e.g. Salt Lake / PB Road, Kolkata-41"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.45rem 0.75rem",
                      background: "var(--bg-main)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.84rem",
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                  />
                </div>

                {/* Cake Category */}
                <div>
                  <label
                    htmlFor="fw-category"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: "0.28rem",
                    }}
                  >
                    <Cake size={13} style={{ color: "var(--gold-dark)" }} />
                    <span>Cake Category (কেক ক্যাটাগরি) *</span>
                  </label>
                  <select
                    id="fw-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.48rem 0.75rem",
                      background: "var(--bg-main)",
                      border: "1px solid var(--gold-border)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.84rem",
                      color: "var(--text-primary)",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    {categories.map((catName) => (
                      <option key={catName} value={catName}>
                        {catName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Flavour */}
                <div>
                  <label
                    htmlFor="fw-flavour"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: "0.28rem",
                    }}
                  >
                    <Sparkles size={13} style={{ color: "var(--gold-dark)" }} />
                    <span>Flavour (পছন্দের ফ্লেভার) *</span>
                  </label>
                  <input
                    id="fw-flavour"
                    type="text"
                    required
                    placeholder="e.g. Belgian Dark Chocolate, Biscoff, etc."
                    value={flavour}
                    onChange={(e) => setFlavour(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.45rem 0.75rem",
                      background: "var(--bg-main)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.84rem",
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                  />

                  {/* Quick Flavour Chips */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginTop: "0.35rem" }}>
                    {FLAVOUR_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setFlavour(chip)}
                        style={{
                          fontSize: "0.7rem",
                          padding: "0.15rem 0.45rem",
                          borderRadius: "var(--radius-full)",
                          background: flavour === chip ? "var(--gold-soft)" : "var(--bg-cream)",
                          border: `1px solid ${flavour === chip ? "var(--gold)" : "var(--border-subtle)"}`,
                          color: flavour === chip ? "var(--gold-dark)" : "var(--text-secondary)",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Message / Event Date */}
                <div>
                  <label
                    htmlFor="fw-notes"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      marginBottom: "0.28rem",
                    }}
                  >
                    <MessageCircle size={13} style={{ color: "var(--gold-dark)" }} />
                    <span>Event Date or Notes (ঐচ্ছিক তারিখ / বার্তা)</span>
                  </label>
                  <input
                    id="fw-notes"
                    type="text"
                    placeholder="e.g. Needed for 20th Oct, Eggless preferred"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.45rem 0.75rem",
                      background: "var(--bg-main)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.82rem",
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                  />
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-whatsapp icon-hover-pulse"
                  id="floating-whatsapp-submit-btn"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    padding: "0.68rem 1rem",
                    fontSize: "0.88rem",
                    marginTop: "0.4rem",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    opacity: isSubmitting ? 0.75 : 1,
                  }}
                >
                  <WhatsAppIcon size={18} />
                  <span>{isSubmitting ? "Generating WhatsApp Chat..." : "Send to WhatsApp"}</span>
                </button>

                <p
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--text-muted)",
                    textAlign: "center",
                    margin: "0.1rem 0 0",
                    fontStyle: "italic",
                  }}
                >
                  Zero advance booking fee. Direct consultation with Chef Tina.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
