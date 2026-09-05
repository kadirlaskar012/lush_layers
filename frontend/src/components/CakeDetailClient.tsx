"use client";

import React, { useState } from "react";
import { Cake } from "../lib/types";
import { createEnquiry } from "../lib/api";
import WhatsAppOrderModal from "./WhatsAppOrderModal";
import { getOptimizedImageUrl } from "../lib/imageHelper";
import { Sparkles } from "lucide-react";

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

  const bakeryWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918768388868";

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
            gap: "0.45rem",
            fontWeight: 600,
          }}
        >
          <Sparkles size={16} color="var(--gold)" />
          <span>Order / Enquire for Your Event</span>
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
            className="btn-order-now icon-hover-lift"
            style={{
              width: "100%",
              padding: "0.65rem 1rem",
              fontSize: "0.92rem",
              justifyContent: "center",
              gap: "0.45rem",
              height: "44px",
            }}
            id="detail-order-btn"
          >
            <span>Order Now</span>
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
