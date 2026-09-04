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
  emptyMessage = "No cakes available in this selection yet.",
}: MasonryGalleryProps) {
  if (!cakes || cakes.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "2.5rem 1.5rem",
          background: "var(--bg-surface)",
          border: "1px dashed var(--gold-border)",
          borderRadius: "var(--radius-md)",
          margin: "1.5rem 0",
        }}
        id="empty-gallery-state"
      >
        <span style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }}>🍰</span>
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.2rem",
            color: "var(--text-primary)",
            marginBottom: "0.35rem",
          }}
        >
          {emptyMessage}
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
          Our pastry atelier is currently crafting bespoke creations. Please check other collections or enquire directly on WhatsApp.
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
