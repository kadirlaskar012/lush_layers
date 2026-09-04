"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const bakeryWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "1234567890";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/cakes?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
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
            height: "85px",
            gap: "1.5rem",
          }}
        >
          {/* Brand Logo */}
          <Link
            href="/"
            style={{ textDecoration: "none", display: "flex", flexDirection: "column" }}
            id="brand-logo-link"
          >
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.65rem",
                letterSpacing: "0.15em",
                fontWeight: 600,
                color: "var(--text-primary)",
                textTransform: "uppercase",
                lineHeight: 1.1,
              }}
            >
              LUSH LAYERS
            </span>
            <span
              style={{
                fontFamily: "var(--font-editorial)",
                fontSize: "0.82rem",
                letterSpacing: "0.22em",
                color: "var(--gold)",
                fontStyle: "italic",
              }}
            >
              Made with Love
            </span>
          </Link>

          {/* Desktop Search */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: "none",
              position: "relative",
              flex: 1,
              maxWidth: "340px",
            }}
            className="desktop-search-form"
          >
            <input
              type="text"
              placeholder="Search artisanal creations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="header-search-input"
              style={{
                width: "100%",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-full)",
                padding: "0.6rem 2.5rem 0.6rem 1.25rem",
                color: "var(--text-primary)",
                fontSize: "0.88rem",
                outline: "none",
                transition: "border-color 0.2s",
              }}
            />
            <button
              type="submit"
              aria-label="Submit search"
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--gold)",
                cursor: "pointer",
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>

          {/* Desktop Navigation */}
          <nav
            style={{
              display: "none",
              alignItems: "center",
              gap: "2rem",
            }}
            className="desktop-nav"
            id="desktop-navigation"
          >
            <Link
              href="/cakes"
              style={{
                color: "var(--text-secondary)",
                textDecoration: "none",
                fontSize: "0.92rem",
                fontWeight: 500,
                letterSpacing: "0.03em",
                transition: "color 0.2s",
              }}
              className="nav-link"
            >
              All Cakes
            </Link>
            <Link
              href="/#categories"
              style={{
                color: "var(--text-secondary)",
                textDecoration: "none",
                fontSize: "0.92rem",
                fontWeight: 500,
                letterSpacing: "0.03em",
                transition: "color 0.2s",
              }}
              className="nav-link"
            >
              Categories
            </Link>
            <Link
              href="/about"
              style={{
                color: "var(--text-secondary)",
                textDecoration: "none",
                fontSize: "0.92rem",
                fontWeight: 500,
                letterSpacing: "0.03em",
                transition: "color 0.2s",
              }}
              className="nav-link"
            >
              Our Story
            </Link>
            <Link
              href="/reviews"
              style={{
                color: "var(--text-secondary)",
                textDecoration: "none",
                fontSize: "0.92rem",
                fontWeight: 500,
                letterSpacing: "0.03em",
                transition: "color 0.2s",
              }}
              className="nav-link"
            >
              Guest Reviews
            </Link>
            <Link
              href="/contact"
              style={{
                color: "var(--text-secondary)",
                textDecoration: "none",
                fontSize: "0.92rem",
                fontWeight: 500,
                letterSpacing: "0.03em",
                transition: "color 0.2s",
              }}
              className="nav-link"
            >
              Contact
            </Link>
            <Link
              href="/admin"
              style={{
                color: "var(--gold)",
                textDecoration: "none",
                fontSize: "0.85rem",
                fontWeight: 600,
                padding: "0.35rem 0.75rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-gold)",
                background: "rgba(212, 175, 55, 0.08)",
              }}
            >
              Admin
            </Link>
          </nav>

          {/* Desktop WhatsApp Button */}
          <div style={{ display: "none" }} className="desktop-cta">
            <a
              href={`https://wa.me/${bakeryWhatsApp.replace(/[^0-9]/g, "")}?text=Hello%20LUSH%20LAYERS%2C%20I%20would%20like%20to%20enquire%20about%20your%20artisanal%20cakes.`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
              id="header-whatsapp-btn"
              style={{ padding: "0.65rem 1.35rem", fontSize: "0.88rem" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
              </svg>
              WhatsApp Us
            </a>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="mobile-menu-toggle"
            id="mobile-menu-btn"
            aria-label="Toggle menu"
            style={{
              background: "none",
              border: "1px solid var(--border-gold)",
              color: "var(--gold-light)",
              padding: "0.5rem 0.75rem",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {isMobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Slide-Down Drawer */}
        {isMobileMenuOpen && (
          <div
            id="mobile-drawer"
            style={{
              padding: "1.5rem 0 2rem",
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              animation: "fadeIn 0.2s ease",
            }}
          >
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search cakes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="mobile-search-input"
                style={{
                  width: "100%",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-full)",
                  padding: "0.75rem 2.5rem 0.75rem 1.25rem",
                  color: "var(--text-primary)",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--gold)",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </form>

            <Link
              href="/cakes"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ color: "var(--text-primary)", fontSize: "1.1rem", textDecoration: "none" }}
            >
              Browse All Cakes
            </Link>
            <Link
              href="/#categories"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ color: "var(--text-primary)", fontSize: "1.1rem", textDecoration: "none" }}
            >
              Categories
            </Link>
            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ color: "var(--text-primary)", fontSize: "1.1rem", textDecoration: "none" }}
            >
              Our Story & Philosophy
            </Link>
            <Link
              href="/reviews"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ color: "var(--text-primary)", fontSize: "1.1rem", textDecoration: "none" }}
            >
              Guest Reviews
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ color: "var(--text-primary)", fontSize: "1.1rem", textDecoration: "none" }}
            >
              Contact & Hours
            </Link>
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ color: "var(--gold)", fontSize: "1.1rem", textDecoration: "none" }}
            >
              Admin Dashboard
            </Link>

            <a
              href={`https://wa.me/${bakeryWhatsApp.replace(/[^0-9]/g, "")}?text=Hello%20LUSH%20LAYERS`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
              style={{ width: "100%", textAlign: "center", marginTop: "0.5rem" }}
            >
              Order on WhatsApp
            </a>
          </div>
        )}
      </div>

      <style jsx>{`
        @media (min-width: 992px) {
          .desktop-search-form {
            display: block !important;
          }
          .desktop-nav {
            display: flex !important;
          }
          .desktop-cta {
            display: block !important;
          }
          .mobile-menu-toggle {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
