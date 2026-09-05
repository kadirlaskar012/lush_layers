# 🍰 LUSH LAYERS - ALL-IN-ONE MASTER CONTROL & CLI
**Full-Stack Bakery Operations, Image Processing & Catalog Management System**

This All-in-One system combines the **Python AI Image Processor**, **Interactive Browser Tools Portal**, **FastAPI Backend**, **Next.js Storefront**, and **Admin Dashboard** into a unified, one-click launcher.

---

## 🚀 Quick Start / কিভাবে শুরু করবেন

You can launch the All-in-One Master Control from **PowerShell**, **Command Prompt (CMD)**, or simply by double-clicking:

```powershell
.\start.bat
```
*(You can also use `.\lush.bat`, `.\cake.bat`, or `python -m backend.cli`)*

When launched, it presents an interactive master console displaying real-time server health badges:

```text
+----------------------------------------------------------------------+
|            * LUSH LAYERS - ALL-IN-ONE MASTER CONTROL *               |
|       Full Stack Bakery System: Python Tools + Website + Admin       |
+----------------------------------------------------------------------+
  Backend: [ONLINE :8000]   Frontend: [ONLINE :3000]

=== [SERVER & BROWSER LAUNCHERS] ===
  1. 🎨 Open Python Image Processing Web Tools (Browser: http://localhost:8000/portal)
  2. 🌐 Open Website Storefront (Browser: http://localhost:3000)
  3. 👑 Open Admin Dashboard (Browser: http://localhost:3000/admin)
  4. ⏳ Open Pending Approval Queue (Browser: http://localhost:3000/admin/cakes/pending)
  5. 🚀 Start Both Servers (Backend + Frontend)
  6. 🛑 Stop All Servers

=== [IMAGE PROCESSING & CATALOG TOOLS] ===
  7. 🍰 Process Single Cake Photo (Terminal Drag & Drop Wizard)
  8. 📁 Bulk Process Photo Folder (Terminal Batch)
  9. 📋 View All Cakes in Catalog (Table)
 10. 🏷️  View Available Categories
 11. 🚀 Publish a Staged Cake by ID / Slug
 12. ⏸️  Unpublish a Cake (Move back to Staged)
 13. 🗑️  Delete a Cake Record
 14. 🔄 Refresh Website Cache (Revalidate)
 15. 🩺 System Health Diagnostics
  0. ❌ Exit
```

---

## 🎯 ৩টি মূল ফিচারের ব্যবহার ও ওয়ার্কফ্লো

### ১. অপশন ১: ব্রাউজারে পাইথন ইমেজ প্রসেসিং টুলস ওপেন করা
- টার্মিনালে **`1`** চাপলে ব্যাকএন্ড অটো-স্টার্ট হয়ে আপনার ব্রাউজারে **`http://localhost:8000/portal`** চালু হয়ে যাবে।
- এখানে আপনি একসাথে ১টি বা ২০টি কেকের ছবি মাউস দিয়ে **Drag & Drop** করে ছেড়ে দিলেই:
  1. `rembg` স্বয়ংক্রিয়ভাবে ছবির ব্যাকগ্রাউন্ড কেটে বাদ দিয়ে দেয়।
  2. ১:১ লাক্সারি সাদা স্টুডিও ক্যানভাসে ড্রপ-শ্যাডো সহ সাজিয়ে দেয়।
  3. 1200x1200 Master ও 600x600 Thumbnail WebP জেনারেট করে।
  4. Google Gemini Vision AI ছবি দেখে সুন্দর টাইটেল, ফ্লেভার ও ডেসক্রিপশন লিখে ফেলে।
  5. ক্লাউডিনারি ও ডাটাবেসে সেভ হয়ে অ্যাডমিন প্যানেলের পেন্ডিং কিউতে যুক্ত হয়ে যায়।

---

### ২. অপশন ২ ও ৩: ওয়েবসাইট ও অ্যাডমিন প্যানেল ওপেন করা
- **`2`** চাপলে সরাসরি মূল ওয়েবসাইট ওপেন হবে (`http://localhost:3000`)।
- **`3`** চাপলে অ্যাডমিন ড্যাশবোর্ড ওপেন হবে (`http://localhost:3000/admin`)।
- **`4`** চাপলে পেন্ডিং কেক রিভিউ কিউ ওপেন হবে (`http://localhost:3000/admin/cakes/pending`)।
- সার্ভার বন্ধ থাকলে এই অপশনগুলো স্বয়ংক্রিয়ভাবে ব্যাকএন্ড ও ফ্রন্টএন্ড চালু করে ব্রাউজারে পেজ খুলে দেবে।

---

### ৩. সম্পূর্ণ ডাটাফ্লো (প্রসেসিং থেকে লাইভ ওয়েবসাইট):
```
[কেকের ছবি] 
    ↓ (ব্রাউজার পোর্টাল বা CLI দিয়ে আপলোড)
[Python Image Processing & AI Engine]
    ↓ (ব্যাকগ্রাউন্ড রিমুভ, স্টুডিও শ্যাডো, WebP, Gemini AI কপিরাইটিং)
[Database (SQLite & Supabase PostgreSQL)]
    ↓ (Status: 'pending')
[Admin Panel: http://localhost:3000/admin/cakes/pending]
    ↓ (অ্যাডমিন চেক করে 'Publish' বাটনে ক্লিক করবেন)
[Live Storefront: http://localhost:3000/cakes]
    (Next.js ISR অটোমেটিক ক্যাশে রিফ্রেশ করে ওয়েবসাইটে লাইভ দেখিয়ে দেয়!)
```

---

## ⚡ ডিরেক্ট শর্টকাট কমান্ড (টার্মিনাল থেকে এক লাইনে)

| কাজ | কমান্ড |
| :--- | :--- |
| **ব্রাউজারে পাইথন প্রসেসিং টুলস খোলা** | `.\start.bat tools` |
| **ব্রাউজারে ওয়েবসাইট খোলা** | `.\start.bat site` |
| **ব্রাউজারে অ্যাডমিন প্যানেল খোলা** | `.\start.bat admin` |
| **ব্রাউজারে পেন্ডিং কিউ খোলা** | `.\start.bat pending` |
| **উভয় সার্ভার চালু করা** | `.\start.bat start` |
| **সব সার্ভার বন্ধ করা** | `.\start.bat stop` |
| **টার্মিনাল দিয়ে ১টি ছবি প্রসেস ও লাইভ করা** | `.\start.bat add "C:\path\to\cake.jpg" --publish` |
| **একটি ফোল্ডারের সব ছবি প্রসেস করা** | `.\start.bat bulk "C:\path\to\folder\" --publish` |
| **ডাটাবেসের সব কেকের তালিকা দেখা** | `.\start.bat list` |
| **৭টি ক্যাটাগরি ও স্লাগ দেখা** | `.\start.bat categories` |
| **ওয়েবসাইট ক্যাশে রিভ্যালিডেট করা** | `.\start.bat revalidate` |
| **সিস্টেম হেলথ চেক** | `.\start.bat diagnostics` |
