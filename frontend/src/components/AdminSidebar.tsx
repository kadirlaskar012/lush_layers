"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAdminStats } from "../lib/api";
import { AdminStats } from "../lib/types";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    getAdminStats().then(setStats).catch(() => {});
    const interval = setInterval(() => {
      getAdminStats().then(setStats).catch(() => {});
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { href: "/admin", label: "Dashboard Overview", icon: "📊" },
    { href: "/admin/cakes", label: "All Cakes Catalog", icon: "🎂" },
    {
      href: "/admin/cakes/pending",
      label: "Pending Approval",
      icon: "⏳",
      count: stats?.pending,
      highlight: true,
    },
    { href: "/admin/cakes/approved", label: "Approved Cakes", icon: "✨", count: stats?.approved },
    { href: "/admin/cakes/rejected", label: "Rejected Archive", icon: "🚫", count: stats?.rejected },
    { href: "/admin/upload", label: "Bulk Image Upload", icon: "⚡" },
    {
      href: "/admin/reviews",
      label: "Review Moderation",
      icon: "⭐",
      count: stats?.pending_reviews,
    },
    { href: "/admin/categories", label: "Category Manager", icon: "🏷️" },
  ];

  return (
    <aside className="admin-sidebar" id="admin-sidebar">
      {/* Brand & Mode */}
      <div style={{ marginBottom: "2.5rem" }}>
        <Link href="/admin" style={{ textDecoration: "none" }}>
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.4rem",
              letterSpacing: "0.12em",
              color: "var(--gold-light)",
              textTransform: "uppercase",
              display: "block",
            }}
          >
            LUSH LAYERS
          </span>
          <span
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.2em",
              color: "var(--text-muted)",
              textTransform: "uppercase",
            }}
          >
            Management Atelier
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-item ${isActive ? "active" : ""}`}
              id={`admin-nav-${item.href.replace(/\//g, "-")}`}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {typeof item.count === "number" && item.count > 0 && (
                <span
                  className="count-pill"
                  style={{
                    background: item.highlight ? "rgba(245, 158, 11, 0.2)" : "rgba(255,255,255,0.08)",
                    color: item.highlight ? "#FBBF24" : "var(--gold-light)",
                    fontWeight: 600,
                  }}
                >
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer link to public website */}
      <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1.5rem", marginTop: "1rem" }}>
        <Link
          href="/"
          target="_blank"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--gold)",
            textDecoration: "none",
            fontSize: "0.85rem",
            fontWeight: 500,
          }}
        >
          <span>View Public Storefront</span>
          <span>↗</span>
        </Link>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.35rem", display: "block" }}>
          LAN Address: 0.0.0.0:8000
        </span>
      </div>
    </aside>
  );
}
