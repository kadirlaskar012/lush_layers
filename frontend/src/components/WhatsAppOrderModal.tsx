"use client";

import React, { useState } from "react";
import { Cake } from "../lib/types";
import { createEnquiry } from "../lib/api";
import { X } from "lucide-react";
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

  if (!isOpen) return null;

  const bakeryWhatsAppNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "1234567890";

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

    // Automatically register order enquiry in database
    try {
      await createEnquiry({
        customer_name: customerName.trim(),
        phone: phone.trim(),
        cake_name: cake.name,
        flavour: cake.flavour,
        selected_size: selectedSize,
        custom_message: customMessage.trim(),
      });
    } catch (err) {
      console.warn("Could not save enquiry in background:", err);
    }

    // STRICT FORMAT (ZERO PRICE)
    const messageLines = [
      "Hello LUSH LAYERS,",
      "",
      "I would like to order/enquire about:",
      "",
      `Cake: ${cake.name}`,
      `Flavour: ${cake.flavour}`,
      `Size: ${selectedSize}`,
      "",
      `Customer Name: ${customerName.trim()}`,
      `Phone: ${phone.trim()}`,
      "",
      "Message / Date:",
      customMessage.trim() || "None",
    ];

    const encodedText = encodeURIComponent(messageLines.join("\n"));
    const whatsappUrl = `https://wa.me/${bakeryWhatsAppNumber.replace(/[^0-9]/g, "")}?text=${encodedText}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="whatsapp-modal-overlay">
      <div className="modal-container" onClick={(e) => e.stopPropagation()} id="whatsapp-modal">
        <button
          className="modal-close-btn icon-hover-rotate"
          onClick={onClose}
          aria-label="Close modal"
          id="whatsapp-modal-close-btn"
        >
          <X size={18} />
        </button>

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
              onClick={onClose}
              className="btn-outline-gold"
              style={{ flex: 1, padding: "0.55rem 1rem", fontSize: "0.82rem" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-whatsapp icon-hover-lift"
              style={{ flex: 2, padding: "0.55rem 1rem", fontSize: "0.82rem", justifyContent: "center", gap: "0.4rem" }}
              id="modal-submit-whatsapp-btn"
            >
              <WhatsAppIcon size={16} />
              <span>Send Enquiry on WhatsApp</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
