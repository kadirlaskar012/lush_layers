"use client";

import React from "react";
import { Cake as CakeType } from "../lib/types";
import CakeCard from "./CakeCard";
import { Cake } from "lucide-react";

interface MasonryGalleryProps {
  cakes: CakeType[];
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
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: "var(--bg-cream)",
            border: "1px solid var(--border-subtle)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "0.6rem",
            color: "var(--gold-dark)",
          }}
        >
          <Cake size={24} strokeWidth={1.75} />
        </div>
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
      {cakes.map((cake, idx) => (
        <div key={cake.id} className="masonry-item">
          <CakeCard cake={cake} priority={idx < 4} />
        </div>
      ))}
    </div>
  );
}
