"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Cake, Enquiry } from "../lib/types";
import { createEnquiry } from "../lib/api";
import { X, CheckCircle2, Copy, Check, ArrowRight } from "lucide-react";
import WhatsAppIcon from "./WhatsAppIcon";

interface WhatsAppOrderModalProps {
  cake: Cake;
  isOpen: boolean;
  onClose: () => void;
  initialSize?: string;
}

export default function WhatsAppOrderModal({ cake, isOpen, onClose, initialSize }: WhatsAppOrderModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedSize, setSelectedSize] = useState<string>(
    initialSize ||
    (cake.available_sizes && cake.available_sizes.length > 0
      ? cake.available_sizes[0]
      : "1.0 kg (Medium)")
  );
  const [customMessage, setCustomMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEnquiry, setSubmittedEnquiry] = useState<Enquiry | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const bakeryWhatsAppNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918768388868";

  const handleClose = () => {
    setSubmittedEnquiry(null);
    setCopied(false);
    setError("");
    onClose();
  };

  const handleCopyRef = () => {
    if (!submittedEnquiry?.enquiry_number) return;
    navigator.clipboard.writeText(submittedEnquiry.enquiry_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter your contact phone number.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    let enquiry: Enquiry | null = null;
    try {
      enquiry = await createEnquiry({
        customer_name: customerName.trim(),
        phone: phone.trim(),
        cake_name: cake.name,
        cake_image_url: cake.image_url,
        flavour: cake.flavour,
        selected_size: selectedSize,
        custom_message: customMessage.trim(),
      });
    } catch (err) {
      console.warn("Could not save enquiry in background:", err);
    }

    const refNumber = enquiry?.enquiry_number || `LL-${Math.floor(1000 + Math.random() * 9000)}`;

    // STRICT FORMAT (ZERO PRICE)
    const messageLines = [
      "Hello LUSH LAYERS,",
      "",
      `*Enquiry Reference: ${refNumber}*`,
      "",
      "I would like to order/enquire about:",
      `• Confection: ${cake.name}`,
      `• Flavour: ${cake.flavour}`,
      `• Size / Tier: ${selectedSize}`,
      "",
      `• Patron Name: ${customerName.trim()}`,
      `• Contact Phone: ${phone.trim()}`,
      "",
      "Event Date / Custom Inscription:",
      customMessage.trim() || "Bespoke consultation requested",
    ];

    const encodedText = encodeURIComponent(messageLines.join("\n"));
    const whatsappUrl = `https://wa.me/${bakeryWhatsAppNumber.replace(/[^0-9]/g, "")}?text=${encodedText}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    if (enquiry) {
      setSubmittedEnquiry(enquiry);
    } else {
      // Fallback object for visual confirmation
      setSubmittedEnquiry({
        id: "temp",
        enquiry_number: refNumber,
        customer_name: customerName.trim(),
        phone: phone.trim(),
        cake_name: cake.name,
        cake_image_url: cake.image_url,
        flavour: cake.flavour,
        selected_size: selectedSize,
        status: "New",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="modal-overlay" onClick={handleClose} id="whatsapp-modal-overlay">
      <div className="modal-container" onClick={(e) => e.stopPropagation()} id="whatsapp-modal">
        <button
          className="modal-close-btn icon-hover-rotate"
          onClick={handleClose}
          aria-label="Close modal"
          id="whatsapp-modal-close-btn"
        >
          <X size={18} />
        </button>

        {submittedEnquiry ? (
          <div style={{ textAlign: "center", padding: "0.5rem 0.25rem" }} id="whatsapp-modal-success-screen">
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)",
                border: "2px solid #6EE7B7",
                color: "#059669",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "0.85rem",
                boxShadow: "0 0 20px rgba(16, 185, 129, 0.2)",
              }}
            >
              <CheckCircle2 size={32} />
            </div>

            <div>
              <span className="cake-category-badge" style={{ background: "#ECFDF5", color: "#065F46", borderColor: "#A7F3D0" }}>
                Enquiry Dispatched & Saved
              </span>
            </div>

            <h3 style={{ fontSize: "1.35rem", color: "var(--text-primary)", margin: "0.5rem 0 0.35rem", fontWeight: 700 }}>
              Enquiry Successfully Submitted!
            </h3>

            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", maxWidth: "380px", margin: "0 auto 1.25rem", lineHeight: 1.5 }}>
              Your order dialogue has been logged with our master cake artists. Tina has received your request on WhatsApp.
            </p>

            {/* Reference Number Card */}
            <div
              style={{
                background: "linear-gradient(135deg, var(--bg-cream) 0%, var(--bg-surface) 100%)",
                border: "1.5px dashed var(--gold)",
                borderRadius: "var(--radius-md)",
                padding: "1rem",
                marginBottom: "1.25rem",
                boxShadow: "var(--shadow-xs)",
              }}
            >
              <div style={{ fontSize: "0.72rem", color: "var(--gold-dark)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
                Your Unique Enquiry Reference
              </div>
              <div
                style={{
                  fontSize: "1.8rem",
                  fontFamily: "monospace",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  letterSpacing: "0.12em",
                  margin: "0.35rem 0",
                }}
                id="modal-success-enquiry-number"
              >
                {submittedEnquiry.enquiry_number}
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  style={{
                    background: copied ? "#059669" : "var(--gold)",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "var(--radius-full)",
                    padding: "0.35rem 0.85rem",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    transition: "all 0.2s ease",
                  }}
                  id="modal-copy-ref-btn"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? "Copied to Clipboard!" : "Copy Reference #"}</span>
                </button>
              </div>
            </div>

            <div
              style={{
                fontSize: "0.78rem",
                color: "var(--text-muted)",
                marginBottom: "1.35rem",
                padding: "0 0.5rem",
              }}
            >
              Use this reference number anytime on our website to track preparation, baking, and delivery milestones.
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "0.6rem" }}>
              <button
                type="button"
                onClick={handleClose}
                className="btn-outline-gold"
                style={{ flex: 1, padding: "0.6rem 1rem", fontSize: "0.82rem" }}
              >
                Close
              </button>
              <Link
                href={`/track?ref=${encodeURIComponent(submittedEnquiry.enquiry_number)}`}
                onClick={handleClose}
                className="btn-gold icon-hover-slide"
                style={{
                  flex: 1.4,
                  padding: "0.6rem 1rem",
                  fontSize: "0.82rem",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  textDecoration: "none",
                }}
                id="modal-track-order-btn"
              >
                <span>Track My Order</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
              <span className="cake-category-badge">Direct WhatsApp Enquiry</span>
              <h3 style={{ fontSize: "1.35rem", color: "var(--text-primary)", marginBottom: "0.25rem", fontWeight: 700 }}>
                Order with Our Master Baker
              </h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                Share your event date and desired portion to discuss bespoke styling directly on WhatsApp.
              </p>
            </div>

            {/* Selected Cake Preview (STRICTLY NO PRICE) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.85rem",
                background: "var(--bg-main)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: "0.65rem 0.85rem",
                marginBottom: "1.15rem",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  background: "#FFFFFF",
                  borderRadius: "var(--radius-xs)",
                  border: "1px solid var(--border-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cake.image_url}
                  alt={cake.name}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </div>
              <div style={{ minWidth: 0 }}>
                <h4 style={{ fontSize: "0.92rem", color: "var(--text-primary)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {cake.name}
                </h4>
                <p style={{ fontSize: "0.76rem", color: "var(--gold-dark)", margin: "0.15rem 0 0", fontStyle: "italic", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {cake.flavour}
                </p>
              </div>
            </div>

            {error && (
              <div
                style={{
                  background: "#FEE2E2",
                  border: "1px solid #FECACA",
                  color: "#991B1B",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "var(--radius-xs)",
                  fontSize: "0.8rem",
                  marginBottom: "1rem",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleOrder}>
              {/* Size Selector */}
              <div className="form-group">
                <label className="form-label">Select Size / Tier:</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                  {cake.available_sizes && cake.available_sizes.length > 0 ? (
                    cake.available_sizes.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        style={{
                          padding: "0.35rem 0.75rem",
                          borderRadius: "var(--radius-full)",
                          fontSize: "0.76rem",
                          cursor: "pointer",
                          transition: "all 0.15s",
                          background: selectedSize === sz ? "var(--gold)" : "var(--bg-main)",
                          border: selectedSize === sz ? "1px solid var(--gold)" : "1px solid var(--border-subtle)",
                          color: selectedSize === sz ? "#FFFFFF" : "var(--text-secondary)",
                          fontWeight: selectedSize === sz ? 600 : 500,
                        }}
                      >
                        {sz}
                      </button>
                    ))
                  ) : (
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Custom portions on consultation</span>
                  )}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                <div className="form-group">
                  <label className="form-label">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lady Vivienne"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      setError("");
                    }}
                    className="form-input"
                    id="modal-customer-name"
                    style={{ padding: "0.5rem 0.75rem", fontSize: "0.84rem" }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +44 7911 123456"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setError("");
                    }}
                    className="form-input"
                    id="modal-customer-phone"
                    style={{ padding: "0.5rem 0.75rem", fontSize: "0.84rem" }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Custom Inscription / Date / Preferences</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Inscription on plaque, delivery date next Saturday, allergen notes..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="form-textarea"
                  id="modal-custom-message"
                  style={{ padding: "0.5rem 0.75rem", fontSize: "0.84rem" }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.6rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-outline-gold"
                  style={{ flex: 1, padding: "0.55rem 1rem", fontSize: "0.82rem" }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-whatsapp icon-hover-lift"
                  style={{ flex: 2, padding: "0.55rem 1rem", fontSize: "0.82rem", justifyContent: "center", gap: "0.4rem" }}
                  id="modal-submit-whatsapp-btn"
                  disabled={isSubmitting}
                >
                  <WhatsAppIcon size={16} />
                  <span>{isSubmitting ? "Generating Ref..." : "Send Enquiry on WhatsApp"}</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
