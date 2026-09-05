"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Menu,
  X,
  Cake,
  Tag,
  BookOpen,
  Star,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import WhatsAppIcon from "./WhatsAppIcon";

export default function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpenMobile, setIsSearchOpenMobile] = useState(false);

  const bakeryWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918768388868";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/cakes?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
      setIsSearchOpenMobile(false);
    }
  };

  return (
    <header className="glass-header" id="site-header">
      <div className="container-lux">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "58px",
            gap: "1rem",
          }}
        >
          {/* Brand Logo - Compact & Elegant */}
          <Link
            href="/"
            style={{ textDecoration: "none", display: "flex", flexDirection: "column" }}
            id="brand-logo-link"
          >
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.05rem, 4vw, 1.25rem)",
                letterSpacing: "0.1em",
                fontWeight: 700,
                color: "var(--text-primary)",
                textTransform: "uppercase",
                lineHeight: 1.05,
                whiteSpace: "nowrap",
              }}
            >
              LUSH LAYERS
            </span>
            <span
              style={{
                fontFamily: "var(--font-editorial)",
                fontSize: "0.7rem",
                letterSpacing: "0.2em",
                color: "var(--gold)",
                fontStyle: "italic",
              }}
            >
              Made with Love
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            style={{
              display: "none",
              alignItems: "center",
              gap: "1.25rem",
            }}
            className="desktop-nav"
            id="desktop-navigation"
          >
            <Link href="/cakes" className="header-nav-link">All Cakes</Link>
            <Link href="/#categories" className="header-nav-link">Categories</Link>
            <Link href="/about" className="header-nav-link">Our Story</Link>
            <Link href="/reviews" className="header-nav-link">Guest Reviews</Link>
            <Link href="/contact" className="header-nav-link">Contact</Link>
            <Link
              href="/admin"
              style={{
                fontSize: "0.75rem",
                padding: "0.2rem 0.55rem",
                borderRadius: "var(--radius-xs)",
                background: "var(--bg-cream)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)",
                textDecoration: "none",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <ShieldCheck size={13} style={{ color: "var(--gold-dark)" }} />
              <span>Admin</span>
            </Link>
          </nav>

          {/* Desktop Search */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: "none",
              position: "relative",
              width: "280px",
            }}
            className="desktop-search-form"
          >
            <input
              type="text"
              placeholder="Search cakes, flavours, designs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="header-search-input"
              style={{
                width: "100%",
                background: "var(--bg-main)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-full)",
                padding: "0.38rem 2.2rem 0.38rem 0.95rem",
                color: "var(--text-primary)",
                fontSize: "0.8rem",
                outline: "none",
              }}
            />
            <button
              type="submit"
              aria-label="Submit search"
              className="icon-hover-pulse"
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--gold-dark)",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Search size={15} />
            </button>
          </form>

          {/* Desktop Right Actions */}
          <div style={{ display: "none", alignItems: "center", gap: "0.75rem" }} className="desktop-actions">
            <a
              href={`https://wa.me/${bakeryWhatsApp.replace(/[^0-9]/g, "")}?text=Hello%20LUSH%20LAYERS%2C%20I%20would%20like%20to%20enquire%20about%20your%20artisanal%20cakes.`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp icon-hover-pulse"
              id="header-whatsapp-btn"
              style={{ padding: "0.4rem 0.85rem", fontSize: "0.78rem" }}
            >
              <WhatsAppIcon size={14} />
              <span>Order on WhatsApp</span>
            </a>
          </div>

          {/* Mobile Right Controls: WhatsApp Icon + Search Toggle + Hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }} className="mobile-controls">
            <a
              href={`https://wa.me/${bakeryWhatsApp.replace(/[^0-9]/g, "")}?text=Hello%20LUSH%20LAYERS%2C%20I%20would%20like%20to%20enquire%20about%20your%20artisanal%20cakes.`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Order on WhatsApp"
              className="whatsapp-pulse-badge icon-hover-pulse"
              style={{
                background: "var(--whatsapp-soft)",
                color: "var(--whatsapp)",
                border: "1px solid rgba(37, 211, 102, 0.25)",
                borderRadius: "var(--radius-sm)",
                width: "34px",
                height: "34px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
              }}
            >
              <WhatsAppIcon size={17} />
            </a>
            <button
              onClick={() => setIsSearchOpenMobile(!isSearchOpenMobile)}
              className="icon-hover-rotate"
              style={{
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                padding: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Toggle mobile search"
            >
              <Search size={18} />
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                background: "var(--bg-cream)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-primary)",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "background 0.2s ease",
              }}
              id="mobile-menu-toggle-btn"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Dropdown */}
        {isSearchOpenMobile && (
          <form
            onSubmit={handleSearchSubmit}
            style={{
              padding: "0.5rem 0 0.75rem",
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search artisanal creations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                style={{
                  width: "100%",
                  background: "var(--bg-main)",
                  border: "1px solid var(--gold-border)",
                  borderRadius: "var(--radius-full)",
                  padding: "0.45rem 2.2rem 0.45rem 0.95rem",
                  color: "var(--text-primary)",
                  fontSize: "0.85rem",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--gold)",
                  cursor: "pointer",
                }}
              >
                <Search size={15} />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div
          style={{
            position: "fixed",
            top: "58px",
            left: 0,
            right: 0,
            bottom: 0,
            background: "var(--bg-surface)",
            borderTop: "1px solid var(--border-subtle)",
            zIndex: 99,
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            overflowY: "auto",
            boxShadow: "var(--shadow-md)",
          }}
          id="mobile-navigation-drawer"
        >
          <Link
            href="/cakes"
            onClick={() => setIsMobileMenuOpen(false)}
            className="mobile-nav-link"
          >
            <Cake size={18} style={{ color: "var(--gold-dark)" }} />
            <span>All Cakes</span>
          </Link>
          <Link
            href="/#categories"
            onClick={() => setIsMobileMenuOpen(false)}
            className="mobile-nav-link"
          >
            <Tag size={18} style={{ color: "var(--gold-dark)" }} />
            <span>Categories</span>
          </Link>
          <Link
            href="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="mobile-nav-link"
          >
            <BookOpen size={18} style={{ color: "var(--gold-dark)" }} />
            <span>Our Story</span>
          </Link>
          <Link
            href="/reviews"
            onClick={() => setIsMobileMenuOpen(false)}
            className="mobile-nav-link"
          >
            <Star size={18} style={{ color: "var(--gold-dark)" }} />
            <span>Guest Reviews</span>
          </Link>
          <Link
            href="/contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className="mobile-nav-link"
          >
            <MapPin size={18} style={{ color: "var(--gold-dark)" }} />
            <span>Contact Us</span>
          </Link>
          <Link
            href="/admin"
            onClick={() => setIsMobileMenuOpen(false)}
            className="mobile-nav-link"
            style={{ color: "var(--gold-dark)", fontWeight: 600 }}
          >
            <ShieldCheck size={18} style={{ color: "var(--gold-dark)" }} />
            <span>Admin Panel</span>
          </Link>

          <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-subtle)" }}>
            <a
              href={`https://wa.me/${bakeryWhatsApp.replace(/[^0-9]/g, "")}?text=Hello%20LUSH%20LAYERS%2C%20I%20would%20like%20to%20enquire%20about%20your%20cakes.`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
              style={{ width: "100%", justifyContent: "center", padding: "0.65rem 1rem", gap: "0.45rem" }}
            >
              <WhatsAppIcon size={16} />
              <span>Order on WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {/* Media Query Styles for Header */}
      <style jsx global>{`
        @media (min-width: 900px) {
          .desktop-nav {
            display: flex !important;
          }
          .desktop-search-form {
            display: block !important;
          }
          .desktop-actions {
            display: flex !important;
          }
          .mobile-controls {
            display: none !important;
          }
        }
        .header-nav-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.84rem;
          font-weight: 500;
          transition: color 0.15s;
          white-space: nowrap;
        }
        .header-nav-link:hover {
          color: var(--gold);
        }
        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
          background: var(--bg-main);
          border: 1px solid var(--border-light);
        }
        .mobile-nav-link:hover {
          background: var(--bg-cream);
          color: var(--gold-dark);
        }
      `}</style>
    </header>
  );
}
