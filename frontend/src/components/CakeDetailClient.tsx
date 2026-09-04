"use client";

import React, { useState } from "react";
import { Cake } from "../lib/types";
import WhatsAppOrderModal from "./WhatsAppOrderModal";

export default function CakeDetailClient({ cake }: { cake: Cake }) {
  const [selectedSize, setSelectedSize] = useState<string>(
    cake.available_sizes && cake.available_sizes.length > 0
      ? cake.available_sizes[0]
      : "1.0 kg"
  );
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const bakeryWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "1234567890";

  const handleDirectWhatsAppOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim()) {
      setIsModalOpen(true);
      return;
    }

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
    const whatsappUrl = `https://wa.me/${bakeryWhatsApp.replace(/[^0-9]/g, "")}?text=${encodedText}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <div
        className="glass-card"
        style={{
          padding: "2.5rem",
          border: "1px solid var(--border-gold)",
          marginTop: "2rem",
        }}
        id="order-enquiry-box"
      >
        <h3
          style={{
            fontSize: "1.4rem",
            color: "var(--gold-light)",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span>✨ Order / Enquire for Your Date</span>
        </h3>

        {/* Size Selector */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label className="form-label">Select Available Size / Tier:</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
            {cake.available_sizes && cake.available_sizes.length > 0 ? (
              cake.available_sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  style={{
                    padding: "0.65rem 1.25rem",
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    background:
                      selectedSize === size
                        ? "rgba(212, 175, 55, 0.25)"
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
              <span className="cake-size-pill">Custom Tier Available</span>
            )}
          </div>
        </div>

        {/* Quick Details Form */}
        <form onSubmit={handleDirectWhatsAppOrder}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div>
              <label className="form-label" htmlFor="detail-name">
                Your Name *
              </label>
              <input
                id="detail-name"
                type="text"
                placeholder="e.g. Eleanor Vance"
                className="form-input"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label" htmlFor="detail-phone">
                Phone Number *
              </label>
              <input
                id="detail-phone"
                type="tel"
                placeholder="e.g. +44 7911 123456"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="detail-message">
              Optional Inscription / Message / Event Date
            </label>
            <textarea
              id="detail-message"
              className="form-textarea"
              rows={2}
              placeholder="e.g., 'Happy Anniversary James & Marie', delivery date next Friday, eggless preference..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
            ></textarea>
          </div>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1.5rem" }}>
            <button
              type="submit"
              className="btn-whatsapp"
              id="detail-order-btn"
              style={{ flex: 1, padding: "1rem", fontSize: "1rem" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
              </svg>
              Order on WhatsApp
            </button>
          </div>
        </form>
      </div>

      <WhatsAppOrderModal
        cake={cake}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
