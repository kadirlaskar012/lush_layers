"use client";

import React, { useState } from "react";
import { Cake } from "../lib/types";

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

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter your contact phone number.");
      return;
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
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
          id="whatsapp-modal-close-btn"
        >
          ✕
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
              className="btn-whatsapp"
              style={{ flex: 2, padding: "0.55rem 1rem", fontSize: "0.82rem", justifyContent: "center" }}
              id="modal-submit-whatsapp-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
              </svg>
              <span>Send Enquiry on WhatsApp</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
