"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, Sparkles } from "lucide-react";
import { Cake } from "../lib/types";
import WhatsAppOrderModal from "./WhatsAppOrderModal";
import { getOptimizedImageUrl } from "../lib/imageHelper";

interface CakeCardProps {
  cake: Cake;
}

export default function CakeCard({ cake }: CakeCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Derive rating for marketplace social proof
  const rating = "4.9";

  return (
    <>
      <div className="cake-card" id={`cake-card-${cake.slug}`} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Studio White Image Container */}
        <Link href={`/cakes/${cake.slug}`} style={{ textDecoration: "none", position: "relative", display: "block" }}>
          <div className="cake-card-image-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getOptimizedImageUrl(cake.image_url, { width: 480 })}
              alt={cake.name}
              className="cake-card-img"
              loading="lazy"
              decoding="async"
              width={300}
              height={300}
            />
            {/* Rating pill floating on image bottom-right */}
            <div
              style={{
                position: "absolute",
                bottom: "7px",
                right: "7px",
                display: "flex",
                alignItems: "center",
                gap: "2px",
                background: "rgba(4, 120, 87, 0.92)",
                color: "#FFFFFF",
                fontSize: "0.64rem",
                fontWeight: 700,
                padding: "2px 5px",
                borderRadius: "3px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                zIndex: 2,
              }}
            >
              <span>{rating}</span>
              <Star size={9} fill="#FFFFFF" strokeWidth={0} />
            </div>
          </div>
        </Link>

        {/* Details Area */}
        <div className="cake-card-body" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {cake.category_name && (
            <span className="cake-category-badge">{cake.category_name}</span>
          )}

          <Link href={`/cakes/${cake.slug}`} style={{ textDecoration: "none" }}>
            <h3 className="cake-title" title={cake.name}>{cake.name}</h3>
          </Link>

          <div className="cake-flavour" title={cake.flavour} style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            <Sparkles size={11} style={{ color: "var(--gold)", flexShrink: 0 }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cake.flavour}</span>
          </div>

          {/* Available Sizes (STRICT: NO PRICE) */}
          {cake.available_sizes && cake.available_sizes.length > 0 && (
            <div className="cake-sizes-wrap">
              {cake.available_sizes.slice(0, 2).map((size, idx) => (
                <span key={idx} className="cake-size-pill">
                  {size.replace(/ \([^)]*\)/, "")}
                </span>
              ))}
              {cake.available_sizes.length > 2 && (
                <span className="cake-size-pill">+{cake.available_sizes.length - 2}</span>
              )}
            </div>
          )}

          {/* Compact Order CTA - White Button with Crisp Outer Line */}
          <div className="cake-card-footer">
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-order-now"
              id={`order-btn-${cake.slug}`}
              aria-label={`Order ${cake.name} Now`}
            >
              <span>Order Now</span>
            </button>
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
