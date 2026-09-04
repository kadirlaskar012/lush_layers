"use client";

import React from "react";
import { Cake } from "../lib/types";
import CakeCard from "./CakeCard";

interface MasonryGalleryProps {
  cakes: Cake[];
  emptyMessage?: string;
}

export default function MasonryGallery({
  cakes,
  emptyMessage = "No cakes available yet.",
}: MasonryGalleryProps) {
  if (!cakes || cakes.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "4rem 2rem",
          background: "var(--bg-surface)",
          border: "1px dashed var(--border-gold)",
          borderRadius: "var(--radius-lg)",
          margin: "2rem 0",
        }}
        id="empty-gallery-state"
      >
        <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "1rem" }}>🍰</span>
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.5rem",
            color: "var(--gold-light)",
            marginBottom: "0.5rem",
          }}
        >
          {emptyMessage}
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Our master bakers are preparing seasonal confections. Please check back soon or enquire via WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <div className="masonry-container" id="cake-masonry-gallery">
      {cakes.map((cake) => (
        <div key={cake.id} className="masonry-item">
          <CakeCard cake={cake} />
        </div>
      ))}
    </div>
  );
}
