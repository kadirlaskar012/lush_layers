"use client";

import React, { useState } from "react";
import { Cake } from "../lib/types";

interface WhatsAppOrderModalProps {
  cake: Cake;
  isOpen: boolean;
  onClose: () => void;
}

export default function WhatsAppOrderModal({ cake, isOpen, onClose }: WhatsAppOrderModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedSize, setSelectedSize] = useState<string>(
    cake.available_sizes && cake.available_sizes.length > 0
      ? cake.available_sizes[0]
      : "1.0 kg (Medium)"
  );
  const [customMessage, setCustomMessage] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const bakeryWhatsAppNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "1234567890"; // Configurable

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

    // STRICT FORMAT REQUIRED BY SPECIFICATION (ZERO PRICE)
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
      "Message:",
      customMessage.trim() || "None",
    ];

    const encodedText = encodeURIComponent(messageLines.join("\n"));
    const whatsappUrl = `https://wa.me/${bakeryWhatsAppNumber.replace(/[^0-9]/g, "")}?text=${encodedText}`;

    // Open WhatsApp in new tab
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

        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <span className="cake-category-badge">Direct WhatsApp Enquiry</span>
          <h3 style={{ fontSize: "1.85rem", color: "var(--gold-light)", marginBottom: "0.4rem" }}>
            Order with Our Master Baker
          </h3>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            We handcraft every creation individually. Share your details below to discuss your custom creation directly on WhatsApp.
          </p>
        </div>

        {/* Selected Cake Preview (STRICTLY NO PRICE) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.25rem",
            background: "var(--bg-card)",
            border: "1px solid var(--border-gold)",
            borderRadius: "var(--radius-md)",
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "8px",
              background: "#FFFFFF",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
          <div>
            <h4 style={{ fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: "0.2rem" }}>
              {cake.name}
            </h4>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
              Flavour: <span style={{ color: "var(--gold-light)" }}>{cake.flavour}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleOrder}>
          {error && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#FCA5A5",
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-md)",
                fontSize: "0.85rem",
                marginBottom: "1.25rem",
              }}
            >
              {error}
            </div>
          )}

          {/* Size Selection */}
          <div className="form-group">
            <label className="form-label" htmlFor="cake-size-select">
              Select Desired Size / Tier
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {cake.available_sizes && cake.available_sizes.length > 0 ? (
                cake.available_sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    style={{
                      padding: "0.6rem 1.1rem",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      background:
                        selectedSize === size
                          ? "rgba(212, 175, 55, 0.2)"
                          : "rgba(255, 255, 255, 0.04)",
                      border:
                        selectedSize === size
                          ? "1px solid var(--gold)"
                          : "1px solid var(--border-subtle)",
                      color: selectedSize === size ? "var(--gold-light)" : "var(--text-secondary)",
                      fontWeight: selectedSize === size ? 600 : 400,
                    }}
                  >
                    {size}
                  </button>
                ))
              ) : (
                <button
                  type="button"
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "var(--radius-full)",
                    background: "rgba(212, 175, 55, 0.15)",
                    border: "1px solid var(--gold)",
                    color: "var(--gold-light)",
                  }}
                >
                  Standard Celebration Size
                </button>
              )}
            </div>
          </div>

          {/* Customer Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="customer-name-input">
              Your Name *
            </label>
            <input
              id="customer-name-input"
              type="text"
              className="form-input"
              placeholder="e.g. Lady Evelyn or Arthur Pendelton"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                setError("");
              }}
              required
            />
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label className="form-label" htmlFor="customer-phone-input">
              Your WhatsApp / Phone Number *
            </label>
            <input
              id="customer-phone-input"
              type="tel"
              className="form-input"
              placeholder="e.g. +44 7911 123456 or 9876543210"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setError("");
              }}
              required
            />
          </div>

          {/* Custom Message / Special Requests */}
          <div className="form-group">
            <label className="form-label" htmlFor="customer-message-input">
              Optional Message / Custom Inscription / Dietary Requests
            </label>
            <textarea
              id="customer-message-input"
              className="form-textarea"
              rows={3}
              placeholder="e.g. 'Happy 30th Sophia' piped in gold, eggless preference, delivery date Oct 14th..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
            ></textarea>
          </div>

          <div style={{ marginTop: "1.75rem", textAlign: "center" }}>
            <button
              type="submit"
              className="btn-whatsapp"
              id="submit-whatsapp-order-btn"
              style={{ width: "100%", padding: "1rem", fontSize: "1rem" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
              </svg>
              Order on WhatsApp
            </button>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.75rem" }}>
              Opens your WhatsApp with your pre-composed enquiry. Zero online payment needed.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
