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
      setJobs(j.slice(0, 8));
      setRecentCakes(c.slice(0, 5));

      // Try fetching LAN info from backend API
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
      {/* Top Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <span className="cake-category-badge">Executive Atelier</span>
          <h1 style={{ fontSize: "2.4rem", color: "var(--text-primary)" }}>
            Management Overview
          </h1>
        </div>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link href="/admin/upload" className="btn-gold" id="overview-bulk-upload-btn">
            ⚡ Bulk Upload Images
          </Link>
          <Link href="/admin/cakes/pending" className="btn-outline-gold" id="overview-pending-btn">
            ⏳ Review Pending ({stats?.pending || 0})
          </Link>
        </div>
      </div>

      {/* LAN Access Notice Banner */}
      {systemInfo && (
        <div
          style={{
            background: "rgba(212, 175, 55, 0.08)",
            border: "1px solid var(--border-gold)",
            borderRadius: "var(--radius-md)",
            padding: "1rem 1.5rem",
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#10B981",
                boxShadow: "0 0 8px #10B981",
              }}
            ></span>
            <span style={{ fontSize: "0.92rem", color: "var(--text-primary)" }}>
              <strong>LAN Backend Active:</strong> Access from any computer on your network at:{" "}
              <code style={{ background: "rgba(0,0,0,0.3)", padding: "0.2rem 0.5rem", borderRadius: "4px", color: "var(--gold-light)" }}>
                {systemInfo.lan_url}
              </code>
            </span>
          </div>
          <a
            href={`${systemInfo.lan_url}/portal`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "0.85rem", color: "var(--gold)", textDecoration: "none", fontWeight: 600 }}
          >
            Open LAN Bulk Portal ↗
          </a>
        </div>
      )}

      {/* Stats Counters Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1.25rem",
          marginBottom: "3rem",
        }}
      >
        <Link href="/admin/cakes/pending" style={{ textDecoration: "none" }}>
          <div className="admin-stat-card" style={{ borderLeft: "4px solid #F59E0B" }}>
            <span className="admin-stat-val" style={{ color: "#FBBF24" }}>
              {stats?.pending ?? "-"}
            </span>
            <span className="admin-stat-lbl">Pending Approval</span>
          </div>
        </Link>

        <Link href="/admin/cakes/approved" style={{ textDecoration: "none" }}>
          <div className="admin-stat-card" style={{ borderLeft: "4px solid #10B981" }}>
            <span className="admin-stat-val" style={{ color: "#34D399" }}>
              {stats?.approved ?? "-"}
            </span>
            <span className="admin-stat-lbl">Approved (Unpublished)</span>
          </div>
        </Link>

        <Link href="/admin/cakes" style={{ textDecoration: "none" }}>
          <div className="admin-stat-card" style={{ borderLeft: "4px solid var(--gold)" }}>
            <span className="admin-stat-val" style={{ color: "var(--gold-light)" }}>
              {stats?.published ?? "-"}
            </span>
            <span className="admin-stat-lbl">Published Live</span>
          </div>
        </Link>

        <Link href="/admin/cakes/rejected" style={{ textDecoration: "none" }}>
          <div className="admin-stat-card" style={{ borderLeft: "4px solid #EF4444" }}>
            <span className="admin-stat-val" style={{ color: "#F87171" }}>
              {stats?.rejected ?? "-"}
            </span>
            <span className="admin-stat-lbl">Rejected</span>
          </div>
        </Link>

        <Link href="/admin/upload" style={{ textDecoration: "none" }}>
          <div className="admin-stat-card" style={{ borderLeft: "4px solid #6366F1" }}>
            <span className="admin-stat-val" style={{ color: "#818CF8" }}>
              {stats?.processing ?? "-"}
            </span>
            <span className="admin-stat-lbl">Jobs Processing</span>
          </div>
        </Link>

        <Link href="/admin/upload" style={{ textDecoration: "none" }}>
          <div className="admin-stat-card" style={{ borderLeft: "4px solid #9CA3AF" }}>
            <span className="admin-stat-val" style={{ color: stats?.failed ? "#F87171" : "#9CA3AF" }}>
              {stats?.failed ?? "-"}
            </span>
            <span className="admin-stat-lbl">Failed Jobs</span>
          </div>
        </Link>
      </div>

      {/* Two Column Layout: Recent Processing Jobs & Recent Cakes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        {/* Left: Background Job Stream */}
        <div className="glass-card" style={{ padding: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1.25rem", color: "var(--gold-light)" }}>
              Background Processing Queue
            </h3>
            <Link href="/admin/upload" style={{ fontSize: "0.82rem", color: "var(--gold)", textDecoration: "none" }}>
              View Queue ↗
            </Link>
          </div>

          {jobs.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center", padding: "2rem" }}>
              No recent background jobs.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {jobs.map((j) => (
                <div
                  key={j.id}
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "8px",
                    padding: "0.85rem 1rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                    <span style={{ fontSize: "0.88rem", fontWeight: 600, maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {j.file_name}
                    </span>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        padding: "0.15rem 0.5rem",
                        borderRadius: "9999px",
                        background:
                          j.status === "completed"
                            ? "rgba(16,185,129,0.15)"
                            : j.status === "failed"
                            ? "rgba(239,68,68,0.15)"
                            : "rgba(245,158,11,0.15)",
                        color:
                          j.status === "completed"
                            ? "#34D399"
                            : j.status === "failed"
                            ? "#F87171"
                            : "#FBBF24",
                      }}
                    >
                      {j.status.replace("_", " ")}
                    </span>
                  </div>
                  <div style={{ height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${j.progress}%`, background: "var(--gold)" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Recent Cakes In Catalog */}
        <div className="glass-card" style={{ padding: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1.25rem", color: "var(--gold-light)" }}>
              Recent Ingestion Stream
            </h3>
            <Link href="/admin/cakes" style={{ fontSize: "0.82rem", color: "var(--gold)", textDecoration: "none" }}>
              All Cakes ↗
            </Link>
          </div>

          {recentCakes.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center", padding: "2rem" }}>
              No cakes in database yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {recentCakes.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "0.6rem",
                    background: "rgba(255,255,255,0.02)",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      background: "#FFFFFF",
                      borderRadius: "6px",
                      overflow: "hidden",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.image_url} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
                      {c.flavour}
                    </div>
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "9999px",
                        background:
                          c.status === "published"
                            ? "rgba(212,175,55,0.2)"
                            : c.status === "approved"
                            ? "rgba(16,185,129,0.15)"
                            : "rgba(245,158,11,0.15)",
                        color:
                          c.status === "published"
                            ? "var(--gold-light)"
                            : c.status === "approved"
                            ? "#34D399"
                            : "#FBBF24",
                        fontWeight: 600,
                      }}
                    >
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
