import React from "react";
import AdminLayoutWrapper from "../../components/AdminLayoutWrapper";

export const metadata = {
  title: "Admin Studio • Lush Layers",
  description: "Management portal for cake approval, bulk image ingestion, and catalog publishing.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
