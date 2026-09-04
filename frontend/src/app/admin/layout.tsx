import React from "react";
import AdminSidebar from "../../components/AdminSidebar";

export const metadata = {
  title: "Admin Studio & Workflow Atelier • LUSH LAYERS",
  description: "Management portal for cake approval, bulk image ingestion, and catalog publishing.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout" id="admin-root-layout">
      <AdminSidebar />
      <main className="admin-content" id="admin-main-content">
        {children}
      </main>
    </div>
  );
}
