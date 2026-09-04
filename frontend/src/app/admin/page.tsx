"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminStats, getProcessingJobs, getAdminCakes } from "../../lib/api";
import { AdminStats, ProcessingJob, Cake } from "../../lib/types";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [recentCakes, setRecentCakes] = useState<Cake[]>([]);
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [s, j, c] = await Promise.all([
        getAdminStats(),
        getProcessingJobs(),
        getAdminCakes(undefined),
      ]);
      setStats(s);
      setJobs(j.slice(0, 6));
      setRecentCakes(c.slice(0, 5));

      // Fetch LAN info
      const sysResp = await fetch("http://127.0.0.1:8000/api/system/status").catch(() => null);
      if (sysResp && sysResp.ok) {
        setSystemInfo(await sysResp.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="admin-overview-view">
      {/* Top Bar - Compact */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.25rem",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div>
          <span className="cake-category-badge">Executive Atelier</span>
          <h1 style={{ fontSize: "1.5rem", color: "var(--text-primary)", fontWeight: 700 }}>
            Management Overview
          </h1>
        </div>

        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          <Link href="/admin/upload" className="btn-gold" id="overview-bulk-upload-btn" style={{ padding: "0.45rem 0.95rem", fontSize: "0.8rem" }}>
            ⚡ Bulk Upload
          </Link>
          <Link href="/admin/cakes/pending" className="btn-outline-gold" id="overview-pending-btn" style={{ padding: "0.45rem 0.95rem", fontSize: "0.8rem" }}>
            ⏳ Review Pending ({stats?.pending || 0})
          </Link>
        </div>
      </div>

      {/* LAN Access Notice Banner - Compact */}
      {systemInfo && (
        <div
          style={{
            background: "var(--bg-cream)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            padding: "0.65rem 1rem",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#10B981",
              }}
            ></span>
            <span style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>
              <strong>LAN Backend Active:</strong>{" "}
              <code style={{ background: "var(--bg-surface)", padding: "0.15rem 0.4rem", borderRadius: "4px", border: "1px solid var(--border-light)" }}>
                {systemInfo.lan_url}
              </code>
            </span>
          </div>
          <a
            href={`${systemInfo.lan_url}/portal`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "0.78rem", color: "var(--gold-dark)", textDecoration: "none", fontWeight: 600 }}
          >
            Open LAN Bulk Portal ↗
          </a>
        </div>
      )}

      {/* Compact 6 Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "0.75rem",
          marginBottom: "1.5rem",
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

        {/* Approved */}
        <Link href="/admin/cakes/approved" style={{ textDecoration: "none" }}>
          <div className="admin-stat-card" style={{ borderTop: "3px solid #10B981" }}>
            <div className="admin-stat-val" style={{ color: "#059669" }}>
              {stats?.approved || 0}
            </div>
            <div className="admin-stat-lbl">Approved (Staged)</div>
          </div>
        </Link>

        {/* Published */}
        <Link href="/admin/cakes" style={{ textDecoration: "none" }}>
          <div className="admin-stat-card" style={{ borderTop: "3px solid var(--gold)" }}>
            <div className="admin-stat-val" style={{ color: "var(--gold-dark)" }}>
              {stats?.published || 0}
            </div>
            <div className="admin-stat-lbl">Published Live</div>
          </div>
        </Link>

        {/* Rejected */}
        <Link href="/admin/cakes/rejected" style={{ textDecoration: "none" }}>
          <div className="admin-stat-card" style={{ borderTop: "3px solid #EF4444" }}>
            <div className="admin-stat-val" style={{ color: "#DC2626" }}>
              {stats?.rejected || 0}
            </div>
            <div className="admin-stat-lbl">Rejected Archive</div>
          </div>
        </Link>

        {/* Processing */}
        <Link href="/admin/upload" style={{ textDecoration: "none" }}>
          <div className="admin-stat-card" style={{ borderTop: "3px solid #6366F1" }}>
            <div className="admin-stat-val" style={{ color: "#4F46E5" }}>
              {stats?.processing || 0}
            </div>
            <div className="admin-stat-lbl">Jobs Processing</div>
          </div>
        </Link>

        {/* Failed */}
        <Link href="/admin/upload" style={{ textDecoration: "none" }}>
          <div className="admin-stat-card" style={{ borderTop: "3px solid #9CA3AF" }}>
            <div className="admin-stat-val" style={{ color: "#6B7280" }}>
              {stats?.failed || 0}
            </div>
            <div className="admin-stat-lbl">Failed Jobs</div>
          </div>
        </Link>
      </div>

      {/* Dual Information Density Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {/* Background Processing Queue Panel */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "1.25rem",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
            <h3 style={{ fontSize: "1.05rem", color: "var(--text-primary)", fontWeight: 600 }}>
              Background Processing Queue
            </h3>
            <Link href="/admin/upload" style={{ fontSize: "0.78rem", color: "var(--gold-dark)", textDecoration: "none", fontWeight: 600 }}>
              View Queue ↗
            </Link>
          </div>

          {jobs.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.84rem", padding: "1rem 0" }}>
              No active or recent ingestion jobs.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {jobs.map((job) => (
                <div
                  key={job.id}
                  style={{
                    background: "var(--bg-main)",
                    borderRadius: "var(--radius-sm)",
                    padding: "0.65rem 0.85rem",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-primary)", fontWeight: 500, maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {job.file_name}
                    </span>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        padding: "0.15rem 0.45rem",
                        borderRadius: "var(--radius-full)",
                        background: job.status === "completed" ? "#D1FAE5" : job.status === "failed" ? "#FEE2E2" : "#FEF3C7",
                        color: job.status === "completed" ? "#065F46" : job.status === "failed" ? "#991B1B" : "#92400E",
                      }}
                    >
                      {job.status}
                    </span>
                  </div>
                  <div style={{ width: "100%", height: "4px", background: "var(--border-subtle)", borderRadius: "2px", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${job.progress}%`,
                        height: "100%",
                        background: job.status === "completed" ? "#10B981" : job.status === "failed" ? "#EF4444" : "var(--gold)",
                        transition: "width 0.3s ease",
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Ingestion Stream Panel */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "1.25rem",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
            <h3 style={{ fontSize: "1.05rem", color: "var(--text-primary)", fontWeight: 600 }}>
              Recent Confections Stream
            </h3>
            <Link href="/admin/cakes" style={{ fontSize: "0.78rem", color: "var(--gold-dark)", textDecoration: "none", fontWeight: 600 }}>
              All Cakes ↗
            </Link>
          </div>

          {recentCakes.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.84rem", padding: "1rem 0" }}>
              No cakes in database yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {recentCakes.map((cake) => (
                <div
                  key={cake.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.55rem 0.75rem",
                    background: "var(--bg-main)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", minWidth: 0 }}>
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
