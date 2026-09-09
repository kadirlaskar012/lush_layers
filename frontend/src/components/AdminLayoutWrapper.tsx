"use client";

import React, { useState } from "react";
import Image from "next/image";
import AdminSidebar from "./AdminSidebar";
import { Menu } from "lucide-react";

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="admin-layout" id="admin-root-layout">
      {/* Mobile Top Bar */}
      <div
        style={{
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.6rem 1rem",
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-subtle)",
          position: "sticky",
          top: 0,
          zIndex: 90,
        }}
        className="admin-mobile-header"
      >
        <button
          onClick={() => setIsMobileOpen(true)}
          style={{
            background: "var(--bg-cream)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-xs)",
            padding: "6px 10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
          aria-label="Open navigation menu"
        >
          <Menu size={16} />
          <span>Admin Menu</span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              position: "relative",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "1px solid rgba(191, 154, 62, 0.4)",
              flexShrink: 0,
              background: "#2A1810",
            }}
          >
            <Image
              src="/logo.png"
              alt="LUSH LAYERS"
              width={28}
              height={28}
              style={{ width: "100%", height: "100%", objectFit: "contain", aspectRatio: "1 / 1" }}
            />
          </div>
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.95rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "var(--text-primary)",
            }}
          >
            LUSH LAYERS
          </span>
        </div>
      </div>

      <AdminSidebar isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />
      
      <main className="admin-content" id="admin-main-content">
        {children}
      </main>
    </div>
  );
}
