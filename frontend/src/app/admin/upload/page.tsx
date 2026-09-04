"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getProcessingJobs, retryProcessingJob } from "../../../lib/api";
import { ProcessingJob } from "../../../lib/types";

export default function BulkUploadPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchJobs = async () => {
    try {
      const data = await getProcessingJobs();
      setJobs(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const allowed = Array.from(files).filter((f) =>
      /\.(jpg|jpeg|png|webp|avif|heic)$/i.test(f.name)
    );
    setSelectedFiles(allowed);
    setUploadMessage(`${allowed.length} image(s) ready for parallel processing.`);
  };

  const handleStartUpload = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    setUploadMessage("Uploading files to local parallel processing queue...");

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));

    try {
      const resp = await fetch("http://127.0.0.1:8000/api/upload/bulk", {
        method: "POST",
        body: formData,
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.detail || "Bulk upload failed");
      }
      const res = await resp.json();
      setUploadMessage(`Success! Queued ${res.total_queued} images for parallel background processing.`);
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchJobs();
    } catch (err: any) {
      setUploadMessage(`Error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetry = async (jobId: string) => {
    const ok = await retryProcessingJob(jobId);
    if (ok) {
      fetchJobs();
    } else {
      alert("Could not retry job. Please verify source image.");
    }
  };

  // Job counts
  const totalJobs = jobs.length;
  const queuedCount = jobs.filter((j) => j.status === "queued").length;
  const processingCount = jobs.filter(
    (j) => j.status === "processing" || j.status === "image_processed"
  ).length;
  const aiCount = jobs.filter((j) => j.status === "ai_processing").length;
  const uploadingCount = jobs.filter((j) => j.status === "uploading").length;
  const completedCount = jobs.filter((j) => j.status === "completed").length;
  const failedCount = jobs.filter((j) => j.status === "failed").length;

  return (
    <div id="bulk-upload-view">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <span className="cake-category-badge">High Concurrency Engine</span>
          <h1 style={{ fontSize: "2.4rem", color: "var(--text-primary)" }}>
            Bulk Cake Ingestion & Background Queue
          </h1>
        </div>

        <Link href="/admin/cakes/pending" className="btn-gold" id="goto-pending-btn">
          Review Pending Cakes Queue →
        </Link>
      </div>

      {/* Upload Box */}
      <div
        className="glass-card"
        style={{
          padding: "2.5rem",
          marginBottom: "3rem",
          border: isDragOver ? "2px dashed var(--gold)" : "2px dashed var(--border-gold)",
          background: isDragOver ? "rgba(212, 175, 55, 0.05)" : "var(--bg-card)",
          textAlign: "center",
          transition: "all 0.3s ease",
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <div style={{ maxWidth: "550px", margin: "0 auto" }}>
          <div style={{ fontSize: "3rem", color: "var(--gold)", marginBottom: "1rem" }}>
            📸
          </div>
          <h2 style={{ fontSize: "1.6rem", color: "var(--gold-light)", marginBottom: "0.5rem" }}>
            Select Multiple Cake Photographs
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", marginBottom: "1.5rem" }}>
            Drag and drop 20+ cake images or click below. Our engine validates, cuts out background with AI, composites on studio white, optimizes to WebP, extracts AI metadata, and marks cakes as <strong>PENDING</strong> for approval.
          </p>

          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            onChange={(e) => handleFiles(e.target.files)}
            style={{ display: "none" }}
            id="bulk-file-input"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn-outline-gold"
            style={{ padding: "0.85rem 2rem", fontSize: "0.95rem" }}
            id="browse-files-btn"
          >
            Select Images from Computer
          </button>

          {selectedFiles.length > 0 && (
            <div style={{ marginTop: "1.5rem" }}>
              <div
                style={{
                  display: "inline-block",
                  padding: "0.5rem 1rem",
                  borderRadius: "var(--radius-full)",
                  background: "rgba(212,175,55,0.15)",
                  color: "var(--gold-light)",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  marginBottom: "1rem",
                }}
              >
                {selectedFiles.length} file(s) selected
              </div>
              <br />
              <button
                type="button"
                onClick={handleStartUpload}
                disabled={isUploading}
                className="btn-gold"
                style={{ padding: "0.95rem 2.5rem", fontSize: "1rem" }}
                id="start-bulk-upload-btn"
              >
                {isUploading ? "Enqueuing Images..." : "Upload & Begin Parallel Background Jobs"}
              </button>
            </div>
          )}

          {uploadMessage && (
            <div
              style={{
                marginTop: "1.25rem",
                fontSize: "0.88rem",
                color: uploadMessage.startsWith("Error") ? "#F87171" : "var(--gold-light)",
              }}
            >
              {uploadMessage}
            </div>
          )}
        </div>
      </div>

      {/* Real-Time Processing Metrics Bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "1rem",
          marginBottom: "2.5rem",
        }}
      >
        <div className="admin-stat-card" style={{ padding: "1rem", textAlign: "center" }}>
          <span className="admin-stat-val" style={{ fontSize: "1.8rem" }}>{totalJobs}</span>
          <span className="admin-stat-lbl">Total Jobs</span>
        </div>
        <div className="admin-stat-card" style={{ padding: "1rem", textAlign: "center" }}>
          <span className="admin-stat-val" style={{ fontSize: "1.8rem", color: "#9CA3AF" }}>{queuedCount}</span>
          <span className="admin-stat-lbl">Queued</span>
        </div>
        <div className="admin-stat-card" style={{ padding: "1rem", textAlign: "center" }}>
          <span className="admin-stat-val" style={{ fontSize: "1.8rem", color: "#FBBF24" }}>{processingCount}</span>
          <span className="admin-stat-lbl">Image Processing</span>
        </div>
        <div className="admin-stat-card" style={{ padding: "1rem", textAlign: "center" }}>
          <span className="admin-stat-val" style={{ fontSize: "1.8rem", color: "#818CF8" }}>{aiCount}</span>
          <span className="admin-stat-lbl">AI Analyzing</span>
        </div>
        <div className="admin-stat-card" style={{ padding: "1rem", textAlign: "center" }}>
          <span className="admin-stat-val" style={{ fontSize: "1.8rem", color: "#60A5FA" }}>{uploadingCount}</span>
          <span className="admin-stat-lbl">Storage Upload</span>
        </div>
        <div className="admin-stat-card" style={{ padding: "1rem", textAlign: "center" }}>
          <span className="admin-stat-val" style={{ fontSize: "1.8rem", color: "#34D399" }}>{completedCount}</span>
          <span className="admin-stat-lbl">Completed</span>
        </div>
        <div className="admin-stat-card" style={{ padding: "1rem", textAlign: "center" }}>
          <span className="admin-stat-val" style={{ fontSize: "1.8rem", color: failedCount > 0 ? "#F87171" : "#9CA3AF" }}>{failedCount}</span>
          <span className="admin-stat-lbl">Failed</span>
        </div>
      </div>

      {/* Jobs Detailed Table */}
      <div className="glass-card" style={{ padding: "2rem" }}>
        <h3 style={{ fontSize: "1.3rem", color: "var(--gold-light)", marginBottom: "1.25rem" }}>
          Processing Jobs Status Stream
        </h3>

        {jobs.length === 0 ? (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "3rem" }}>
            No jobs found. Upload cake images above to start background processing.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {jobs.map((job) => (
              <div
                key={job.id}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "10px",
                  padding: "1.25rem",
                }}
                id={`job-item-${job.id}`}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div>
                    <strong style={{ fontSize: "1rem", color: "var(--text-primary)" }}>{job.file_name}</strong>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                      Job ID: {job.id} • Created: {new Date(job.created_at).toLocaleTimeString()}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "9999px",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        background:
                          job.status === "completed"
                            ? "rgba(16,185,129,0.15)"
                            : job.status === "failed"
                            ? "rgba(239,68,68,0.15)"
                            : "rgba(245,158,11,0.15)",
                        color:
                          job.status === "completed"
                            ? "#34D399"
                            : job.status === "failed"
                            ? "#F87171"
                            : "#FBBF24",
                      }}
                    >
                      {job.status.replace("_", " ")} ({job.progress}%)
                    </span>

                    {job.status === "failed" && (
                      <button
                        onClick={() => handleRetry(job.id)}
                        className="btn-outline-gold"
                        style={{ padding: "0.3rem 0.75rem", fontSize: "0.75rem" }}
                      >
                        Retry Job
                      </button>
                    )}

                    {job.cake_id && (
                      <Link
                        href="/admin/cakes/pending"
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--gold-light)",
                          textDecoration: "none",
                          fontWeight: 500,
                        }}
                      >
                        View Pending Cake ↗
                      </Link>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div
                  style={{
                    height: "6px",
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: "999px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${job.progress}%`,
                      background:
                        job.status === "completed"
                          ? "#10B981"
                          : job.status === "failed"
                          ? "#EF4444"
                          : "linear-gradient(90deg, #D4AF37, #F6E7B9)",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>

                {job.error_message && (
                  <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#FCA5A5" }}>
                    Error: {job.error_message}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
