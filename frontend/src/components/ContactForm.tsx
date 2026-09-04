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
          style={{ padding: "0.5rem 0.75rem", fontSize: "0.84rem" }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
        <div className="form-group">
          <label className="form-label" htmlFor="contact-date">
            Celebration Date
          </label>
          <input
            id="contact-date"
            name="date"
            type="date"
            className="form-input"
            required
            style={{ padding: "0.45rem 0.75rem", fontSize: "0.84rem" }}
          />
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
            placeholder="e.g. 50-80"
            required
            style={{ padding: "0.5rem 0.75rem", fontSize: "0.84rem" }}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="contact-notes">
          Design Concept / Flavour Preference
        </label>
        <textarea
          id="contact-notes"
          name="notes"
          rows={3}
          className="form-textarea"
          placeholder="e.g. Tiered floral baseline, pure Belgian dark ganache, white velvet..."
          style={{ padding: "0.5rem 0.75rem", fontSize: "0.84rem" }}
        />
      </div>

      <button
        type="submit"
        className="btn-whatsapp"
        style={{
          width: "100%",
          padding: "0.6rem 1rem",
          fontSize: "0.84rem",
          justifyContent: "center",
          marginTop: "0.25rem",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
        </svg>
        <span>Generate WhatsApp Brief</span>
      </button>
    </form>
  );
}
