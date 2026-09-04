"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getAdminCakes, publishCake, rejectCake } from "../../../../lib/api";
import { Cake } from "../../../../lib/types";

export default function ApprovedCakesPage() {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadApproved = async () => {
    try {
      const data = await getAdminCakes("approved");
      setCakes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApproved();
  }, []);

  const handlePublish = async (id: string) => {
    setActionLoading(id);
    try {
      await publishCake(id);
      loadApproved();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <span className="cake-category-badge">Approved Staging</span>
          <h1 style={{ fontSize: "2.4rem", color: "var(--text-primary)" }}>
            Approved Cakes Ready for Publishing ({cakes.length})
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            These confections have passed human review and are ready to be published to the public catalog.
          </p>
        </div>
        <Link href="/admin/cakes/pending" className="btn-outline-gold">
          View Pending Queue
        </Link>
      </div>

      {cakes.length === 0 && !loading ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--bg-surface)", borderRadius: "var(--radius-md)", border: "1px dashed var(--border-gold)" }}>
          No approved cakes waiting to be published.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
          {cakes.map((cake) => (
            <div key={cake.id} className="glass-card" style={{ padding: "1.5rem" }}>
              <div style={{ background: "#FFFFFF", borderRadius: "8px", height: "200px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cake.image_url} alt="" style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} />
              </div>
              <h3 style={{ fontSize: "1.2rem", color: "var(--text-primary)", marginBottom: "0.3rem" }}>{cake.name}</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--gold-light)", fontStyle: "italic", marginBottom: "1rem" }}>{cake.flavour}</p>
              <button
                onClick={() => handlePublish(cake.id)}
                disabled={actionLoading === cake.id}
                className="btn-gold"
                style={{ width: "100%", padding: "0.75rem" }}
              >
                Publish to Public Storefront 🚀
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
