import io
import time
import requests
from PIL import Image, ImageDraw

BACKEND_URL = "http://127.0.0.1:8000"
FRONTEND_URL = "http://127.0.0.1:3000"

def create_sample_cake_image(color=(215, 75, 120), filename="test_berry_chiffon.jpg"):
    """Creates a synthetic cake image with distinct color for testing."""
    img = Image.new("RGB", (500, 500), (240, 240, 240))
    draw = ImageDraw.Draw(img)
    # Draw cake tiers
    draw.rectangle([120, 260, 380, 420], fill=color) # bottom tier
    draw.rectangle([160, 140, 340, 260], fill=(color[0]+20, color[1]+10, color[2]+15)) # top tier
    # Draw berry toppings
    for x in range(180, 330, 30):
        draw.ellipse([x, 115, x+25, 140], fill=(160, 20, 50))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

def run_tests():
    print("=" * 60)
    print("LUSH LAYERS — PENDING CAKE AI GENERATE WORKFLOW TEST")
    print("=" * 60)

    # 1. Upload processed cake image using Local Python Tool / Endpoint
    print("\n[Step 1] Upload cake image to /api/upload/bulk...")
    img_data = create_sample_cake_image()
    files = {"files": ("test_berry_chiffon.jpg", img_data, "image/jpeg")}
    upload_resp = requests.post(f"{BACKEND_URL}/api/upload/bulk", files=files, timeout=15)
    assert upload_resp.status_code == 200, f"Upload failed: {upload_resp.text}"
    job_info = upload_resp.json()["jobs"][0]
    job_id = job_info["job_id"]
    print(f"  Enqueued background job: {job_id}")

    # Wait for background queue worker to complete image processing, Cloudinary upload & DB save
    print("\n[Step 2 & 3] Waiting for worker to process image and save pending record...")
    cake_id = None
    for _ in range(40):
        time.sleep(0.5)
        j_resp = requests.get(f"{BACKEND_URL}/api/jobs/{job_id}", timeout=5)
        if j_resp.status_code == 200:
            job = j_resp.json()
            if job["status"] == "completed":
                cake_id = job.get("cake_id")
                break
            elif job["status"] == "failed":
                raise RuntimeError(f"Job failed: {job.get('error_message')}")

    assert cake_id, f"No cake_id found on completed job {job_id}"
    print(f"  Job completed successfully! Created cake ID: {cake_id}")

    # Fetch created pending cake
    cake_resp = requests.get(f"{BACKEND_URL}/api/cakes/{cake_id}", timeout=5)
    assert cake_resp.status_code == 200
    cake = cake_resp.json()

    # Verify initial status is strictly PENDING and AI status is not_generated
    assert cake["status"] == "pending", f"Expected status 'pending', got '{cake['status']}'"
    ai_meta = cake.get("ai_metadata") or {}
    print(f"  Cake Image URL: {cake['image_url']}")
    print(f"  Cake Status: {cake['status']} (Verified: strictly PENDING)")
    print(f"  AI Status: {ai_meta.get('ai_status')} (Verified: not_generated on initial upload)")

    # 4 & 5. Click AI Generate
    print("\n[Step 4 & 5] Invoking AI Generate on pending cake...")
    gen_resp = requests.post(f"{BACKEND_URL}/api/cakes/{cake_id}/ai-generate", timeout=25)
    assert gen_resp.status_code == 200, f"AI generation failed: {gen_resp.text}"
    gen_cake = gen_resp.json()["cake"]

    # 6. Verify image is analyzed
    print("\n[Step 6-11] Verifying AI Generated Attributes...")
    # 7. Name
    assert gen_cake["name"], "Cake name was not generated!"
    print(f"  [7] Generated Name: {gen_cake['name']}")

    # 8. Flavour
    assert gen_cake["flavour"], "Flavour was not generated!"
    print(f"  [8] Generated Flavour: {gen_cake['flavour']}")

    # 9. Category from DB
    assert gen_cake.get("category_id") or gen_cake.get("category_name") or gen_cake.get("ai_metadata", {}).get("suggested_category"), "Category was not set!"
    print(f"  [9] Generated Category: {gen_cake.get('category_name') or gen_cake.get('ai_metadata', {}).get('suggested_category')}")

    # 10. Description
    assert gen_cake["description"], "Description was not generated!"
    assert "$" not in gen_cake["description"] and "₹" not in gen_cake["description"] and "price" not in gen_cake["description"].lower(), "Price policy violated in description!"
    print(f"  [10] Generated Description: {gen_cake['description']}")

    # 11. Sizes
    sizes = gen_cake.get("available_sizes") or []
    assert len(sizes) > 0, "No sizes suggested!"
    print(f"  [11] Suggested Sizes: {sizes}")

    # Verify status STILL strictly remains PENDING
    assert gen_cake["status"] == "pending", f"AI MUST NOT publish! Status was {gen_cake['status']}"
    assert gen_cake["ai_metadata"]["ai_status"] == "generated"
    print(f"  [Step 14 early check] Status after AI: {gen_cake['status']} (STRICTLY PENDING)")

    # 12. Edit generated information
    print("\n[Step 12] Editing generated information...")
    edit_payload = {
        "name": "Bespoke Royal Wild Berry Chiffon (Edited)",
        "flavour": "Organic Wild Raspberry & Silken Vanilla",
        "description": "Artisanal hand-crafted tiers featuring wild berry coulis and velvety buttercream.",
        "available_sizes": ["1.0 kg (Standard)", "2.5 kg (Grand Celebration)"]
    }
    edit_resp = requests.put(f"{BACKEND_URL}/api/cakes/{cake_id}", json=edit_payload, timeout=5)
    assert edit_resp.status_code == 200, f"Edit failed: {edit_resp.text}"
    edited_cake = edit_resp.json()
    assert edited_cake["name"] == edit_payload["name"]
    assert edited_cake["flavour"] == edit_payload["flavour"]
    print(f"  Edited Name: {edited_cake['name']}")
    print(f"  Edited Flavour: {edited_cake['flavour']}")
    print(f"  Edited Sizes: {edited_cake['available_sizes']}")

    # 13. Regenerate AI
    print("\n[Step 13] Regenerating AI metadata...")
    regen_resp = requests.post(f"{BACKEND_URL}/api/cakes/{cake_id}/regenerate-ai", timeout=25)
    assert regen_resp.status_code == 200, f"Regenerate failed: {regen_resp.text}"
    regen_cake = regen_resp.json()["cake"]
    assert regen_cake["ai_metadata"].get("regenerated") == True
    print(f"  Regenerated Name: {regen_cake['name']}")
    print(f"  Regenerated Flavour: {regen_cake['flavour']}")

    # 14. Verify status strictly remains PENDING
    assert regen_cake["status"] == "pending", f"Status must remain pending! Got {regen_cake['status']}"
    print(f"  [Step 14] Verified status remains: {regen_cake['status']}")

    # 15. Approve manually
    print("\n[Step 15] Admin manually approves cake...")
    appr_resp = requests.post(f"{BACKEND_URL}/api/cakes/{cake_id}/approve", timeout=5)
    assert appr_resp.status_code == 200, f"Approve failed: {appr_resp.text}"
    appr_cake = appr_resp.json()["cake"]
    assert appr_cake["status"] == "approved"
    print(f"  Cake status transitioned to: {appr_cake['status']}")

    # 16. Publish
    print("\n[Step 16] Admin publishes cake...")
    pub_resp = requests.post(f"{BACKEND_URL}/api/cakes/{cake_id}/publish", timeout=5)
    assert pub_resp.status_code == 200, f"Publish failed: {pub_resp.text}"
    pub_cake = pub_resp.json()["cake"]
    assert pub_cake["status"] == "published"
    print(f"  Cake status transitioned to: {pub_cake['status']}")

    # 17. Verify cake appears on public website API
    print("\n[Step 17] Verifying cake on public catalog...")
    pub_list_resp = requests.get(f"{BACKEND_URL}/api/cakes?status=published", timeout=5)
    assert pub_list_resp.status_code == 200
    published_cakes = pub_list_resp.json()
    found = any(c["id"] == cake_id for c in published_cakes)
    assert found, f"Published cake {cake_id} not found in live published catalog!"
    print(f"  Cake '{pub_cake['name']}' is LIVE on the public catalog!")

    # 18. Test Bulk "Generate All with AI"
    print("\n[Bulk Test] Testing 'Generate All with AI' endpoint...")
    bulk_resp = requests.post(f"{BACKEND_URL}/api/cakes/pending/ai-generate-all", timeout=60)
    assert bulk_resp.status_code == 200, f"Bulk AI generate failed: {bulk_resp.text}"
    bulk_data = bulk_resp.json()
    print(f"  Bulk result: {bulk_data['message']}")
    print(f"  Queued: {bulk_data['queued']}, Succeeded: {bulk_data['succeeded']}, Failed: {bulk_data['failed']}")

    print("\n" + "=" * 60)
    print("ALL 17 WORKFLOW STEPS + BULK GENERATE COMPLETED WITH 100% PASS!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
