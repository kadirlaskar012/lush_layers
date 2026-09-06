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
  PackageCheck,
} from "lucide-react";

export default function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpenMobile, setIsSearchOpenMobile] = useState(false);

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
            className="desktop-nav"
            id="desktop-navigation"
          >
            <Link href="/cakes" className="header-nav-link">All Cakes</Link>
            <Link href="/#categories" className="header-nav-link">Categories</Link>
            <Link href="/about" className="header-nav-link">Our Story</Link>
            <Link href="/reviews" className="header-nav-link">Guest Reviews</Link>
            <Link href="/track" className="header-nav-link" id="nav-track-order-link">Track Order</Link>
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



          {/* Mobile Right Controls: Search Toggle + Hamburger */}
          <div className="mobile-controls">
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
            href="/track"
            onClick={() => setIsMobileMenuOpen(false)}
            className="mobile-nav-link"
            id="mobile-nav-track-order-link"
          >
            <PackageCheck size={18} style={{ color: "var(--gold-dark)" }} />
            <span>Track Order</span>
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


        </div>
      )}
    </header>
  );
}
