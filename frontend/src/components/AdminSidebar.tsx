"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAdminStats } from "../lib/api";
import { AdminStats } from "../lib/types";
import {
  LayoutDashboard,
  ClipboardList,
  Cake,
  Clock,
  Copy,
  Sparkles,
  ArchiveX,
  Star,
  Tag,
  Zap,
  Palette,
  X,
  ArrowUpRight,
} from "lucide-react";

interface AdminSidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function AdminSidebar({ isMobileOpen = false, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    getAdminStats().then(setStats).catch(() => {});
    const interval = setInterval(() => {
      getAdminStats().then(setStats).catch(() => {});
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const newEnquiriesCount = stats?.enquiries?.new ?? (stats as any)?.enquiries_new ?? 0;
  const approvedTotalCount = stats?.total_approved ?? ((stats?.approved || 0) + (stats?.published || 0));

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={16} strokeWidth={1.8} /> },
    {
      href: "/admin/orders",
      label: "Orders / Enquiries",
      icon: <ClipboardList size={16} strokeWidth={1.8} />,
      count: newEnquiriesCount,
      highlight: true,
    },
    { href: "/admin/cakes", label: "All Cakes", icon: <Cake size={16} strokeWidth={1.8} /> },
    {
      href: "/admin/cakes/pending",
      label: "Pending Approval",
      icon: <Clock size={16} strokeWidth={1.8} />,
      count: stats?.pending,
      highlight: true,
    },
    {
      href: "/admin/cakes/duplicates",
      label: "Duplicate Review",
      icon: <Copy size={16} strokeWidth={1.8} />,
      count: stats?.duplicates,
      highlight: (stats?.duplicates || 0) > 0,
    },
    {
      href: "/admin/cakes/approved",
      label: "Approved & Published",
      icon: <Sparkles size={16} strokeWidth={1.8} />,
      count: approvedTotalCount,
    },
    { href: "/admin/cakes/rejected", label: "Rejected / Archive", icon: <ArchiveX size={16} strokeWidth={1.8} />, count: stats?.rejected },
    {
      href: "/admin/reviews",
      label: "Reviews",
      icon: <Star size={16} strokeWidth={1.8} />,
      count: stats?.pending_reviews,
    },
    { href: "/admin/categories", label: "Categories", icon: <Tag size={16} strokeWidth={1.8} /> },
    { href: "/admin/upload", label: "Bulk Upload", icon: <Zap size={16} strokeWidth={1.8} /> },
    { href: "/admin/hero-preview", label: "Hero Designs (5 Ideas)", icon: <Palette size={16} strokeWidth={1.8} />, highlight: true },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(30, 25, 20, 0.4)",
            zIndex: 998,
          }}
          aria-hidden="true"
        />
      )}

      <aside
        className={`admin-sidebar ${isMobileOpen ? "mobile-open" : ""}`}
        id="admin-sidebar"
        style={{
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          padding: "1rem",
        }}
      >
        {/* Brand & Mobile Close Button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.25rem",
            paddingBottom: "0.75rem",
            borderBottom: "1px solid var(--border-light)",
          }}
        >
          <Link href="/admin" style={{ textDecoration: "none" }} onClick={onCloseMobile}>
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.15rem",
                letterSpacing: "0.12em",
                color: "var(--text-primary)",
                textTransform: "uppercase",
                display: "block",
                fontWeight: 700,
                lineHeight: 1.1,
              }}
            >
              LUSH LAYERS
            </span>
            <span
              style={{
                fontSize: "0.68rem",
                letterSpacing: "0.15em",
                color: "var(--gold-dark)",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Management Atelier
            </span>
          </Link>

          {/* Close button for mobile drawer */}
          <button
            onClick={onCloseMobile}
            style={{
              display: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-secondary)",
              padding: "4px",
            }}
            className="mobile-close-sidebar-btn icon-hover-rotate"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Links - Compact */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.15rem" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`admin-nav-item ${isActive ? "active" : ""}`}
                id={`admin-nav-${item.href.replace(/\//g, "-")}`}
                style={{
                  padding: "0.45rem 0.75rem",
                  fontSize: "0.82rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                  <span style={{ display: "inline-flex", alignItems: "center" }} className="icon-hover-pulse">
                    {item.icon}
                  </span>
                  <span style={{ fontWeight: isActive ? 600 : 500 }}>{item.label}</span>
                </div>
                {typeof item.count === "number" && item.count > 0 && (
                  <span
                    className="count-pill"
                    style={{
                      background: item.highlight ? "#FEF3C7" : "var(--bg-cream)",
                      color: item.highlight ? "#92400E" : "var(--text-secondary)",
                      border: item.highlight ? "1px solid #FCD34D" : "1px solid var(--border-light)",
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

        {/* Compact Footer */}
        <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "0.85rem", marginTop: "0.75rem" }}>
          <Link
            href="/"
            target="_blank"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "var(--gold-dark)",
              textDecoration: "none",
              fontSize: "0.78rem",
              fontWeight: 600,
            }}
            className="icon-hover-slide"
          >
            <span>Storefront</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </aside>

      <style jsx global>{`
        @media (max-width: 900px) {
          .admin-sidebar {
            position: fixed !important;
            top: 0;
            left: 0;
            bottom: 0;
            width: 260px !important;
            z-index: 999 !important;
            transform: translateX(-100%);
            transition: transform 0.25s ease-in-out;
            box-shadow: var(--shadow-md);
          }
          .admin-sidebar.mobile-open {
            transform: translateX(0) !important;
          }
          .mobile-close-sidebar-btn {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}
