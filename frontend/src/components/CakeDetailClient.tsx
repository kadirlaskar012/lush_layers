"use client";

import React, { useState } from "react";
import { Cake } from "../lib/types";
import { createEnquiry } from "../lib/api";
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

  const handleDirectWhatsAppOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim()) {
      setIsModalOpen(true);
      return;
    }

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
    const whatsappUrl = `https://wa.me/${bakeryWhatsApp.replace(/[^0-9]/g, "")}?text=${encodedText}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "1.25rem",
          marginTop: "1.25rem",
          boxShadow: "var(--shadow-xs)",
        }}
        id="order-enquiry-box"
      >
        <h3
          style={{
            fontSize: "1.15rem",
            color: "var(--text-primary)",
            marginBottom: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontWeight: 600,
          }}
        >
          <span>✨ Order / Enquire for Your Event</span>
        </h3>

        {/* Size Selector */}
        <div style={{ marginBottom: "1rem" }}>
          <label className="form-label">Available Size / Portion Tier:</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {cake.available_sizes && cake.available_sizes.length > 0 ? (
              cake.available_sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  style={{
                    padding: "0.4rem 0.85rem",
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    background:
                      selectedSize === size
                        ? "var(--gold)"
                        : "var(--bg-main)",
                    border:
                      selectedSize === size
                        ? "1px solid var(--gold)"
                        : "1px solid var(--border-subtle)",
                    color: selectedSize === size ? "#FFFFFF" : "var(--text-secondary)",
                    fontWeight: selectedSize === size ? 600 : 500,
                  }}
                >
                  {size}
                </button>
              ))
            ) : (
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Custom portions on consultation</span>
            )}
          </div>
        </div>

        {/* Inline Quick WhatsApp Form */}
        <form onSubmit={handleDirectWhatsAppOrder}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginBottom: "0.6rem" }}>
            <div>
              <label className="form-label">Your Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Eleanor Vance"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="form-input"
                style={{ padding: "0.5rem 0.75rem", fontSize: "0.84rem" }}
              />
            </div>
            <div>
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="e.g. +44 7911 123456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-input"
                style={{ padding: "0.5rem 0.75rem", fontSize: "0.84rem" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "0.85rem" }}>
            <label className="form-label">Event Date / Special Inscription (Optional)</label>
            <textarea
              rows={2}
              placeholder="e.g. 'Happy 30th Sophia', delivery next Friday, eggless preference..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="form-textarea"
              style={{ padding: "0.5rem 0.75rem", fontSize: "0.84rem" }}
            />
          </div>

          <button
            type="submit"
            className="btn-whatsapp"
            style={{
              width: "100%",
              padding: "0.65rem 1rem",
              fontSize: "0.88rem",
              justifyContent: "center",
            }}
            id="detail-order-btn"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
            </svg>
            <span>Enquire & Order on WhatsApp</span>
          </button>
        </form>
      </div>

      <WhatsAppOrderModal
        cake={cake}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialSize={selectedSize}
      />
    </>
  );
}
