"use client";

import React from "react";

export default function ContactForm({ bakeryWhatsApp }: { bakeryWhatsApp: string }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.currentTarget as any;
    const name = target.name.value;
    const date = target.date.value;
    const guests = target.guests.value;
    const notes = target.notes.value;

    const text = [
      "Hello LUSH LAYERS,",
      "",
      "I would like to enquire about a bespoke celebration cake:",
      `Client: ${name}`,
      `Event Date: ${date}`,
      `Guest Count: ${guests}`,
      "",
      "Vision / Flavour Notes:",
      notes || "None specified",
    ].join("\n");

    window.open(
      `https://wa.me/${bakeryWhatsApp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  return (
    <form onSubmit={handleSubmit} id="contact-enquiry-form">
      <div className="form-group">
        <label className="form-label" htmlFor="contact-name">
          Your Full Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          className="form-input"
          placeholder="e.g. Charlotte Dubois"
          required
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div className="form-group">
          <label className="form-label" htmlFor="contact-date">
            Celebration Date
          </label>
          <input id="contact-date" name="date" type="date" className="form-input" required />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="contact-guests">
            Approx. Guests
          </label>
          <input
            id="contact-guests"
            name="guests"
            type="text"
            className="form-input"
            placeholder="e.g. 50 guests"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="contact-notes">
          Design Concept / Dietary Preferences
        </label>
        <textarea
          id="contact-notes"
          name="notes"
          className="form-textarea"
          rows={3}
          placeholder="Describe tiers, palette, flavours, or floral aesthetics..."
        ></textarea>
      </div>

      <button
        type="submit"
        className="btn-gold"
        id="submit-contact-form-btn"
        style={{ width: "100%", padding: "1rem", marginTop: "1rem" }}
      >
        Send Enquiry via WhatsApp
      </button>
    </form>
  );
}
