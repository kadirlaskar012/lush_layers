"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Cake } from "../lib/types";
import WhatsAppOrderModal from "./WhatsAppOrderModal";

interface CakeCardProps {
  cake: Cake;
}

export default function CakeCard({ cake }: CakeCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="cake-card" id={`cake-card-${cake.slug}`}>
        {/* Visual-First Studio Image */}
        <Link href={`/cakes/${cake.slug}`} style={{ textDecoration: "none" }}>
          <div className="cake-card-image-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cake.image_url}
              alt={cake.name}
              className="cake-card-img"
              loading="lazy"
            />
          </div>
        </Link>

        {/* Cake Details */}
        <div className="cake-card-body">
          {cake.category_name && (
            <span className="cake-category-badge">{cake.category_name}</span>
          )}

          <Link href={`/cakes/${cake.slug}`} style={{ textDecoration: "none" }}>
            <h3 className="cake-title">{cake.name}</h3>
          </Link>

          <div className="cake-flavour">
            <span>✨ {cake.flavour}</span>
          </div>

          {/* Available Sizes (NO PRICE) */}
          {cake.available_sizes && cake.available_sizes.length > 0 && (
            <div className="cake-sizes-wrap">
              {cake.available_sizes.map((size, idx) => (
                <span key={idx} className="cake-size-pill">
                  {size}
                </span>
              ))}
            </div>
          )}

          {/* CTAs */}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-whatsapp"
              style={{
                flex: 1,
                padding: "0.75rem 1rem",
                fontSize: "0.85rem",
                borderRadius: "var(--radius-full)",
              }}
              id={`order-btn-${cake.slug}`}
            >
              Order on WhatsApp
            </button>

            <Link
              href={`/cakes/${cake.slug}`}
              className="btn-outline-gold"
              style={{
                padding: "0.75rem 1rem",
                fontSize: "0.85rem",
              }}
              aria-label={`View details for ${cake.name}`}
            >
              Details
            </Link>
          </div>
        </div>
      </div>

      <WhatsAppOrderModal
        cake={cake}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
