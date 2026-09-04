import os
import sys
from pathlib import Path
from PIL import Image, ImageDraw

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.config import settings
from backend.processor import processor
from backend.ai_analyzer import ai_analyzer
from backend.db import db
from backend.storage import storage

def create_sample_cake_image(dest_path: Path, cake_type: str = "rose"):
    """Generates a test cake image on a textured/colored background to test cutout."""
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    img = Image.new("RGB", (800, 800), (220, 205, 190)) # busy background
    draw = ImageDraw.Draw(img)

    # Add background pattern
    for i in range(0, 800, 40):
        draw.line([(0, i), (800, i)], fill=(210, 195, 180), width=1)
        draw.line([(i, 0), (i, 800)], fill=(210, 195, 180), width=1)

    if cake_type == "chocolate":
        # Dark chocolate cake tiers
        draw.rectangle([250, 450, 550, 680], fill=(45, 25, 18)) # bottom tier
        draw.rectangle([300, 300, 500, 450], fill=(55, 30, 22)) # middle tier
        draw.rectangle([340, 180, 460, 300], fill=(65, 35, 25)) # top tier
        # Gold drip accents
        for x in range(250, 550, 30):
            draw.ellipse([x, 440, x + 20, 470], fill=(212, 175, 55))
    elif cake_type == "berry":
        # Pink/Blush berry cake
        draw.rectangle([250, 420, 550, 680], fill=(235, 180, 195)) # bottom tier
        draw.rectangle([310, 240, 490, 420], fill=(245, 200, 215)) # top tier
        # Red berries
        for bx in range(270, 530, 40):
            draw.ellipse([bx, 405, bx + 25, 430], fill=(180, 30, 60))
    else:
        # Rose buttercream tier
        draw.rectangle([260, 420, 540, 680], fill=(250, 245, 235)) # bottom tier
        draw.rectangle([320, 240, 480, 420], fill=(255, 250, 240)) # top tier
        # Buttercream roses
        for rx in range(280, 520, 50):
            draw.ellipse([rx, 405, rx + 30, 435], fill=(230, 150, 165))

    img.save(dest_path, "JPEG", quality=95)
    return dest_path

def test_full_pipeline():
    print("=== STARTING LUSH LAYERS BACKEND VERIFICATION ===")
    
    # 1. Generate test image
    test_img_path = settings.DATA_DIR / "test_input_cake.jpg"
    create_sample_cake_image(test_img_path, "chocolate")
    print(f"[1/6] Created test input image at: {test_img_path}")

    # 2. Image Processor Test
    proc_res = processor.process_cake_image(test_img_path, "test_verification_cake")
    print(f"[2/6] Processed image successfully: {proc_res['master_filename']} ({proc_res['file_size_bytes']} bytes)")
    assert Path(proc_res["master_path"]).exists(), "Master WebP must exist"
    assert Path(proc_res["thumbnail_path"]).exists(), "Thumbnail WebP must exist"
    assert proc_res["width"] == 1200 and proc_res["height"] == 1200, "Must be 1200x1200"

    # 3. AI Metadata Analysis Test
    ai_meta = ai_analyzer.analyze_cake_image(Path(proc_res["master_path"]))
    print(f"[3/6] AI Generated: Name='{ai_meta['name']}', Flavour='{ai_meta['flavour']}', Cat='{ai_meta['category']}'")
    assert ai_meta.get("name"), "Name must be present"
    assert ai_meta.get("flavour"), "Flavour must be present"
    assert ai_meta.get("category"), "Category must be present"
    assert ai_meta.get("description"), "Description must be present"

    # 4. Storage Test
    upload_res = storage.upload_image(Path(proc_res["master_path"]), "test_verification_cake")
    print(f"[4/6] Storage image URL: {upload_res['image_url']}")
    assert upload_res.get("image_url"), "Image URL must be returned"

    # 5. Database Record Test: MUST START AS PENDING & NO PRICE
    cake_record = {
        "name": ai_meta["name"],
        "flavour": ai_meta["flavour"],
        "category_id": "c0000000-0000-0000-0000-000000000004", # Pure Belgian Chocolate
        "description": ai_meta["description"],
        "available_sizes": ai_meta.get("available_sizes", ["0.5 kg", "1.0 kg"]),
        "image_url": upload_res["image_url"],
        "ai_metadata": ai_meta
    }
    created_cake = db.create_cake(cake_record)
    print(f"[5/6] Created Cake in DB: id={created_cake['id']}, status='{created_cake['status']}'")
    assert created_cake["status"] == "pending", "Cake MUST start in 'pending' status"
    assert "price" not in created_cake, "Price column MUST NOT exist"

    # 6. Workflow: Approve -> Publish
    approved_cake = db.approve_cake(created_cake["id"])
    assert approved_cake["status"] == "approved", "Status must transition to approved"
    
    published_cake = db.publish_cake(created_cake["id"])
    assert published_cake["status"] == "published", "Status must transition to published"
    assert published_cake["published_at"] is not None, "Published at timestamp must be set"
    print(f"[6/6] Cake successfully published: slug='{published_cake['slug']}'")

    print("\n>>> ALL BACKEND PIPELINE TESTS PASSED WITH 100% SUCCESS! <<<")

if __name__ == "__main__":
    test_full_pipeline()
