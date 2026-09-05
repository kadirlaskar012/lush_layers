"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminStats, getAdminCakes, getEnquiries } from "../../lib/api";
import { AdminStats, Cake, Enquiry } from "../../lib/types";
import { ClipboardList, Clock, Zap, Cake as CakeIcon, ArrowUpRight } from "lucide-react";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentCakes, setRecentCakes] = useState<Cake[]>([]);
  const [recentEnquiries, setRecentEnquiries] = useState<Enquiry[]>([]);
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [s, c, e] = await Promise.all([
        getAdminStats(),
        getAdminCakes(undefined),
        getEnquiries(undefined, 6),
      ]);
      setStats(s);
      setRecentCakes(c.slice(0, 6));
      setRecentEnquiries(e.slice(0, 5));

      // Fetch LAN info
      const sysResp = await fetch("http://127.0.0.1:8000/api/system/status").catch(() => null);
      if (sysResp && sysResp.ok) {
        setSystemInfo(await sysResp.json());
      }
    } catch (err) {
      console.error("Failed to load admin overview data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return { bg: "#FEF3C7", text: "#92400E", border: "#FCD34D" };
      case "contacted":
        return { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" };
      case "confirmed":
        return { bg: "#D1FAE5", text: "#065F46", border: "#A7F3D0" };
      case "completed":
        return { bg: "#ECFDF5", text: "#047857", border: "#6EE7B7" };
      case "cancelled":
        return { bg: "#FEE2E2", text: "#991B1B", border: "#FECACA" };
      default:
        return { bg: "var(--bg-cream)", text: "var(--text-secondary)", border: "var(--border-subtle)" };
    }
  };

  return (
    <div id="admin-overview-view">
      {/* Top Header - Compact */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          flexWrap: "wrap",
          gap: "0.65rem",
        }}
      >
        <div>
          <span className="cake-category-badge">Executive Atelier</span>
          <h1 style={{ fontSize: "1.4rem", color: "var(--text-primary)", fontWeight: 700, margin: "0.1rem 0" }}>
            Management Overview
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
            Live confectionery studio KPIs, order pipeline, and catalog health.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Link href="/admin/orders" className="btn-gold icon-hover-lift" style={{ padding: "0.42rem 0.85rem", fontSize: "0.78rem", gap: "0.4rem" }}>
            <ClipboardList size={14} />
            <span>Orders / Enquiries</span>
          </Link>
          <Link href="/admin/cakes/pending" className="btn-outline-gold icon-hover-lift" style={{ padding: "0.42rem 0.85rem", fontSize: "0.78rem", gap: "0.4rem" }}>
            <Clock size={14} />
            <span>Pending Approval ({stats?.pending || 0})</span>
          </Link>
          <Link href="/admin/upload" className="btn-outline-gold icon-hover-lift" style={{ padding: "0.42rem 0.85rem", fontSize: "0.78rem", gap: "0.4rem" }}>
            <Zap size={14} />
            <span>Bulk Upload</span>
          </Link>
        </div>
      </div>



      {/* SECTION 1: CAKE STATISTICS (4 Compact Cards) */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
          <CakeIcon size={15} color="var(--gold-dark)" />
          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Cake Catalog Statistics
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: "0.65rem",
          }}
        >
          {/* Pending */}
          <Link href="/admin/cakes/pending" style={{ textDecoration: "none" }}>
            <div className="admin-stat-card" style={{ borderTop: "3px solid #F59E0B" }}>
              <div className="admin-stat-val" style={{ color: "#D97706" }}>
                {stats?.pending || 0}
              </div>
              <div className="admin-stat-lbl">Pending Approval</div>
            </div>
          </Link>

          {/* Approved (Staged) */}
          <Link href="/admin/cakes/approved" style={{ textDecoration: "none" }}>
            <div className="admin-stat-card" style={{ borderTop: "3px solid #10B981" }}>
              <div className="admin-stat-val" style={{ color: "#059669" }}>
                {stats?.approved || 0}
              </div>
              <div className="admin-stat-lbl">Approved (Staged)</div>
            </div>
          </Link>

          {/* Published Live */}
          <Link href="/admin/cakes/approved" style={{ textDecoration: "none" }}>
            <div className="admin-stat-card" style={{ borderTop: "3px solid var(--gold)" }}>
              <div className="admin-stat-val" style={{ color: "var(--gold-dark)" }}>
                {stats?.published || 0}
              </div>
              <div className="admin-stat-lbl">Published Live</div>
            </div>
          </Link>

          {/* Rejected Archive */}
          <Link href="/admin/cakes/rejected" style={{ textDecoration: "none" }}>
            <div className="admin-stat-card" style={{ borderTop: "3px solid #EF4444" }}>
              <div className="admin-stat-val" style={{ color: "#DC2626" }}>
                {stats?.rejected || 0}
              </div>
              <div className="admin-stat-lbl">Rejected Archive</div>
            </div>
          </Link>
        </div>
      </div>

      {/* SECTION 2: ORDER / ENQUIRY STATISTICS (5 Compact Cards) */}
      <div style={{ marginBottom: "1.35rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <ClipboardList size={15} color="var(--gold-dark)" />
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Customer Order / Enquiry Pipeline
            </span>
          </div>
          <Link href="/admin/orders" style={{ fontSize: "0.76rem", color: "var(--gold-dark)", textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.2rem" }} className="icon-hover-slide">
            <span>Manage All Enquiries</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
            gap: "0.55rem",
          }}
        >
          {/* New */}
          <Link href="/admin/orders?status=New" style={{ textDecoration: "none" }}>
            <div className="admin-stat-card" style={{ borderTop: "3px solid #F59E0B", background: stats?.enquiries?.new ? "#FFFBEB" : "var(--bg-surface)" }}>
              <div className="admin-stat-val" style={{ color: "#D97706" }}>
                {stats?.enquiries?.new || 0}
              </div>
              <div className="admin-stat-lbl">New</div>
            </div>
          </Link>

          {/* Contacted */}
          <Link href="/admin/orders?status=Contacted" style={{ textDecoration: "none" }}>
            <div className="admin-stat-card" style={{ borderTop: "3px solid #3B82F6" }}>
              <div className="admin-stat-val" style={{ color: "#2563EB" }}>
                {stats?.enquiries?.contacted || 0}
              </div>
              <div className="admin-stat-lbl">Contacted</div>
            </div>
          </Link>

          {/* Confirmed */}
          <Link href="/admin/orders?status=Confirmed" style={{ textDecoration: "none" }}>
            <div className="admin-stat-card" style={{ borderTop: "3px solid #10B981" }}>
              <div className="admin-stat-val" style={{ color: "#059669" }}>
                {stats?.enquiries?.confirmed || 0}
              </div>
              <div className="admin-stat-lbl">Confirmed</div>
            </div>
          </Link>

          {/* Completed */}
          <Link href="/admin/orders?status=Completed" style={{ textDecoration: "none" }}>
            <div className="admin-stat-card" style={{ borderTop: "3px solid #047857" }}>
              <div className="admin-stat-val" style={{ color: "#047857" }}>
                {stats?.enquiries?.completed || 0}
              </div>
              <div className="admin-stat-lbl">Completed</div>
            </div>
          </Link>

          {/* Cancelled */}
          <Link href="/admin/orders?status=Cancelled" style={{ textDecoration: "none" }}>
            <div className="admin-stat-card" style={{ borderTop: "3px solid #9CA3AF" }}>
              <div className="admin-stat-val" style={{ color: "#6B7280" }}>
                {stats?.enquiries?.cancelled || 0}
              </div>
              <div className="admin-stat-lbl">Cancelled</div>
            </div>
          </Link>
        </div>
      </div>

      {/* SECTION 3: RECENT ORDERS / ENQUIRIES + RECENT CAKES (Two compact dense panels) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1rem",
        }}
      >
        {/* Recent Orders / Enquiries Table */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "1rem",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <h3 style={{ fontSize: "0.98rem", color: "var(--text-primary)", fontWeight: 600 }}>
              Recent Orders / Enquiries
            </h3>
            <Link href="/admin/orders" style={{ fontSize: "0.76rem", color: "var(--gold-dark)", textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.2rem" }} className="icon-hover-slide">
              <span>All Enquiries ({stats?.enquiries?.total || recentEnquiries.length})</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>

          {recentEnquiries.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", padding: "1rem 0", textAlign: "center" }}>
              No customer order enquiries yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
              {recentEnquiries.map((enq) => {
                const badge = getStatusColor(enq.status);
                return (
                  <div
                    key={enq.id}
                    style={{
                      background: "var(--bg-main)",
                      borderRadius: "var(--radius-sm)",
                      padding: "0.6rem 0.75rem",
                      border: "1px solid var(--border-light)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <span style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--text-primary)" }}>
                          {enq.customer_name}
                        </span>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                          • {enq.phone}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.74rem", color: "var(--gold-dark)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <CakeIcon size={12} color="var(--gold-dark)" />
                        <span>{enq.cake_name} ({enq.selected_size})</span>
                      </div>
                      {enq.custom_message && (
                        <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "0.1rem" }}>
                          "{enq.custom_message}"
                        </div>
                      )}
                    </div>

                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        padding: "0.18rem 0.5rem",
                        borderRadius: "var(--radius-full)",
                        background: badge.bg,
                        color: badge.text,
                        border: `1px solid ${badge.border}`,
                        flexShrink: 0,
                      }}
                    >
                      {enq.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Cakes Stream */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "1rem",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <h3 style={{ fontSize: "0.98rem", color: "var(--text-primary)", fontWeight: 600 }}>
              Recent Confections
            </h3>
            <Link href="/admin/cakes" style={{ fontSize: "0.76rem", color: "var(--gold-dark)", textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.2rem" }} className="icon-hover-slide">
              <span>All Cakes ({((stats?.published || 0) + (stats?.approved || 0) + (stats?.pending || 0)) || recentCakes.length})</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>

          {recentCakes.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", padding: "1rem 0", textAlign: "center" }}>
              No cakes in catalog.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
              {recentCakes.map((cake) => (
                <div
                  key={cake.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.5rem 0.75rem",
                    background: "var(--bg-main)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", minWidth: 0 }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "var(--radius-xs)",
                        background: "#FFFFFF",
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cake.image_url}
                        alt={cake.name}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {cake.name}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {cake.flavour}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      padding: "0.15rem 0.5rem",
                      borderRadius: "var(--radius-full)",
                      background:
                        cake.status === "published"
                          ? "#DBEAFE"
                          : cake.status === "pending"
                          ? "#FEF3C7"
                          : cake.status === "approved"
                          ? "#D1FAE5"
                          : "#FEE2E2",
                      color:
                        cake.status === "published"
                          ? "#1E40AF"
                          : cake.status === "pending"
                          ? "#92400E"
                          : cake.status === "approved"
                          ? "#065F46"
                          : "#991B1B",
                      flexShrink: 0,
                    }}
                  >
                    {cake.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
