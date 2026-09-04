"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpenMobile, setIsSearchOpenMobile] = useState(false);

  const bakeryWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "1234567890";

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
                fontSize: "1.25rem",
                letterSpacing: "0.12em",
                fontWeight: 700,
                color: "var(--text-primary)",
                textTransform: "uppercase",
                lineHeight: 1.05,
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
              }}
            >
              Admin
            </Link>
          </nav>

          {/* Desktop Search */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: "none",
              position: "relative",
              width: "220px",
            }}
            className="desktop-search-form"
          >
            <input
              type="text"
              placeholder="Search cakes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="header-search-input"
              style={{
                width: "100%",
                background: "var(--bg-main)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-full)",
                padding: "0.35rem 2rem 0.35rem 0.85rem",
                color: "var(--text-primary)",
                fontSize: "0.8rem",
                outline: "none",
              }}
            />
            <button
              type="submit"
              aria-label="Submit search"
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--gold)",
                cursor: "pointer",
                padding: 0,
                display: "flex",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>

          {/* Desktop Right Actions */}
          <div style={{ display: "none", alignItems: "center", gap: "0.75rem" }} className="desktop-actions">
            <a
              href={`https://wa.me/${bakeryWhatsApp.replace(/[^0-9]/g, "")}?text=Hello%20LUSH%20LAYERS%2C%20I%20would%20like%20to%20enquire%20about%20your%20artisanal%20cakes.`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
              id="header-whatsapp-btn"
              style={{ padding: "0.4rem 0.85rem", fontSize: "0.78rem" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
              </svg>
              <span>WhatsApp Us</span>
            </a>
          </div>

          {/* Mobile Right Controls: Search Toggle + Hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }} className="mobile-controls">
            <button
              onClick={() => setIsSearchOpenMobile(!isSearchOpenMobile)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                padding: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
              aria-label="Toggle mobile search"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
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
              }}
              id="mobile-menu-toggle-btn"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
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
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
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
            🎂 All Cakes
          </Link>
          <Link
            href="/#categories"
            onClick={() => setIsMobileMenuOpen(false)}
            className="mobile-nav-link"
          >
            🏷️ Categories
          </Link>
          <Link
            href="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="mobile-nav-link"
          >
            📜 Our Story
          </Link>
          <Link
            href="/reviews"
            onClick={() => setIsMobileMenuOpen(false)}
            className="mobile-nav-link"
          >
            ⭐ Guest Reviews
          </Link>
          <Link
            href="/contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className="mobile-nav-link"
          >
            📍 Contact & Atelier
          </Link>
          <Link
            href="/admin"
            onClick={() => setIsMobileMenuOpen(false)}
            className="mobile-nav-link"
            style={{ color: "var(--gold-dark)", fontWeight: 600 }}
          >
            ⚙️ Admin Panel
          </Link>

          <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-subtle)" }}>
            <a
              href={`https://wa.me/${bakeryWhatsApp.replace(/[^0-9]/g, "")}?text=Hello%20LUSH%20LAYERS%2C%20I%20would%20like%20to%20enquire%20about%20your%20cakes.`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
              style={{ width: "100%", justifyContent: "center", padding: "0.65rem 1rem" }}
            >
              Order on WhatsApp
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
