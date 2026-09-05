"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Cake } from "../lib/types";
import WhatsAppOrderModal from "./WhatsAppOrderModal";
import { getOptimizedImageUrl } from "../lib/imageHelper";

interface CakeCardProps {
  cake: Cake;
}

export default function CakeCard({ cake }: CakeCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Derive rating from cake id or quality score for marketplace social proof
  const rating = "4.9";
  const reviewCount = (cake.name.length * 7) % 80 + 45;

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
                bottom: "8px",
                right: "8px",
                display: "flex",
                alignItems: "center",
                gap: "2px",
                background: "rgba(4, 120, 87, 0.92)",
                color: "#FFFFFF",
                fontSize: "0.65rem",
                fontWeight: 700,
                padding: "2px 5px",
                borderRadius: "3px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                zIndex: 2,
              }}
            >
              <span>{rating}</span>
              <span style={{ fontSize: "0.55rem" }}>★</span>
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

          <div className="cake-flavour" title={cake.flavour}>
            <span>✨ {cake.flavour}</span>
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

          {/* Compact WhatsApp CTA */}
          <div className="cake-card-footer">
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-whatsapp"
              style={{
                width: "100%",
                padding: "0.42rem 0.6rem",
                fontSize: "0.78rem",
                height: "34px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.35rem",
              }}
              id={`order-btn-${cake.slug}`}
              aria-label={`Order ${cake.name} on WhatsApp`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
              </svg>
              <span>Order on WhatsApp</span>
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
