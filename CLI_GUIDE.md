# 🍰 LUSH LAYERS - ARTISAN CONFECTIONERY CLI
**Professional Local Image Processing & Catalog Management System**

This command-line tool allows you to process raw cake photos, remove backgrounds, composite onto 1:1 luxury studio canvases with ambient contact drop-shadows, extract AI sensory copy (Gemini Vision), upload to Cloudinary/local media, save to SQLite & Supabase PostgreSQL, and trigger instant Next.js ISR storefront revalidation.

---

## 🚀 Quick Start / কিভাবে চালাবেন

You can run the CLI from **PowerShell**, **Command Prompt (CMD)**, or by simply typing:

```bash
# Interactive Menu (সবচেয়ে সহজ - মেনু দেখে এক এক করে সিলেক্ট করুন)
.\cake.bat
```

or via Python:

```bash
python -m backend.cli
```

---

## 🛠️ Main Commands & Examples

### 1. Interactive Wizard (স্টেপ বাই স্টেপ উইজার্ড)
Run without arguments or pass `interactive`:
```bash
.\cake.bat interactive
```
- Drag-and-drop cake image path directly into terminal.
- Choose whether to run AI copywriting (Gemini Vision).
- Choose category from numbered list.
- Stage as `pending` for review in Admin Panel OR publish live immediately!

---

### 2. Process & Add a Single Cake Image (সরাসরি কমান্ড দিয়ে কেক যোগ করা)

#### A. AI Auto-Generated (AI টাইটেল, বিবরণ, ক্যাটাগরি ও ফ্লেভার ঠিক করবে)
```bash
.\cake.bat add "C:\Users\KadiR-PC\Pictures\my_cake.jpg" --publish
```

#### B. Custom Title, Flavour & Category (নিজের পছন্দমতো নাম ও ক্যাটাগরি দিয়ে)
```bash
.\cake.bat add "C:\Users\KadiR-PC\Pictures\red_velvet.png" --name "Royal Crimson Velvet" --category "birthday-cakes" --flavour "Madagascar Cocoa & Cream Cheese" --publish
```

#### C. Add to Pending Review (সরাসরি লাইভ না করে অ্যাডমিন প্যানেলে রিভিউ এর জন্য রাখা)
```bash
.\cake.bat add "C:\Users\KadiR-PC\Pictures\bento_1.jpg"
```
*(Admin review URL: `http://localhost:3000/admin/cakes/pending`)*

#### D. Keep Original Background without RemBG (ব্যাকগ্রাউন্ড রিমুভ না করে শুধু ১:১ স্কয়ার স্টুডিও ক্যানভাসে সাজানো)
```bash
.\cake.bat add "C:\Users\KadiR-PC\Pictures\photo.jpg" --no-bg --publish
```

---

### 3. Bulk Folder Import (একটি সম্পূর্ণ ফোল্ডারের সব ছবি একসাথে প্রসেস করা)

```bash
.\cake.bat bulk "C:\Users\KadiR-PC\Pictures\NewCakes\" --publish
```
- ফোল্ডারের সব `.jpg`, `.jpeg`, `.png`, `.webp` ছবি পর্যায়ক্রমে প্রসেস করে স্টুডিও শ্যাডো বানিয়ে আপলোড করবে।

---

### 4. List All Cakes in Catalog (ওয়েবসাইটে বর্তমানে কী কী কেক আছে দেখা)

```bash
.\cake.bat list
```
Filter by status:
```bash
.\cake.bat list --status published
.\cake.bat list --status pending
```

---

### 5. View Categories (সব ৭টি ক্যাটাগরির Slug ও ID দেখা)

```bash
.\cake.bat categories
```

Available Categories:
1. `birthday-cakes` (Birthday Cakes)
2. `wedding-tiered-cakes` (Wedding & Tiered Cakes)
3. `anniversary-cakes` (Anniversary & Romance)
4. `bento-petite-cakes` (Bento & Petite Cakes)
5. `botanical-floral-cakes` (Botanical & Floral Cakes)
6. `belgian-chocolate-cakes` (Pure Belgian Chocolate)
7. `custom-theme-cakes` (Custom & Theme Cakes)

---

### 6. Publish / Unpublish / Delete

```bash
# Publish a pending cake
.\cake.bat publish <cake_id_or_slug>

# Move back to staged
.\cake.bat unpublish <cake_id_or_slug>

# Delete a cake permanently
.\cake.bat delete <cake_id>
```

---

### 7. Trigger Live Website Cache Revalidation (ক্যাশে রিফ্রেশ)

```bash
.\cake.bat revalidate
```

---

### 8. System Diagnostics (সিস্টেম হেলথ চেক)

```bash
.\cake.bat diagnostics
```
Checks:
- SQLite database status
- Supabase direct PostgreSQL pooler connection
- Cloudinary CDN status
- Gemini AI Vision status
- Background Removal (`rembg`) engine
- Next.js frontend server status
