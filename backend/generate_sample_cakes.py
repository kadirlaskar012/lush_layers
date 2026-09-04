import random
from pathlib import Path
from PIL import Image, ImageDraw

def generate_20_cake_images(output_dir: Path):
    output_dir.mkdir(parents=True, exist_ok=True)
    
    cake_profiles = [
        ("dark_chocolate_truffle", (45, 25, 18), (60, 35, 25), (212, 175, 55), "chocolate"),
        ("belgian_noir_opera", (38, 20, 15), (50, 30, 22), (220, 180, 60), "chocolate"),
        ("espresso_hazelnut_tier", (55, 30, 20), (70, 42, 30), (200, 160, 50), "chocolate"),
        ("blush_peony_rose", (245, 200, 210), (235, 180, 195), (180, 50, 80), "floral"),
        ("wild_raspberry_chiffon", (230, 170, 185), (240, 190, 205), (190, 30, 70), "floral"),
        ("strawberry_champagne_dream", (250, 220, 225), (240, 195, 205), (210, 80, 100), "floral"),
        ("madagascar_vanilla_royale", (250, 245, 235), (245, 238, 225), (212, 175, 55), "tiered"),
        ("pristine_ivory_cascade", (248, 242, 230), (242, 235, 220), (212, 175, 55), "tiered"),
        ("alabaster_lace_tier", (252, 248, 240), (246, 240, 230), (200, 170, 70), "tiered"),
        ("salted_caramel_butterscotch", (205, 145, 75), (185, 125, 55), (225, 185, 95), "caramel"),
        ("amber_honeycomb_crunch", (215, 155, 80), (195, 135, 60), (240, 195, 100), "caramel"),
        ("gilded_biscoff_drip", (190, 130, 65), (175, 115, 50), (212, 175, 55), "caramel"),
        ("sicilian_pistachio_cardamom", (180, 210, 165), (160, 195, 145), (220, 180, 80), "artisan"),
        ("earl_grey_lavender_mousse", (190, 180, 210), (175, 165, 195), (212, 175, 55), "artisan"),
        ("meyer_lemon_poppyseed", (250, 235, 160), (240, 220, 140), (212, 175, 55), "artisan"),
        ("matcha_green_tea_velvet", (150, 185, 130), (135, 170, 115), (250, 245, 235), "artisan"),
        ("midnight_blackberry_violet", (80, 40, 85), (95, 50, 100), (212, 175, 55), "chocolate"),
        ("pink_guava_rosewater", (245, 180, 180), (235, 165, 165), (255, 220, 225), "floral"),
        ("salted_pecan_praline_tier", (165, 110, 65), (150, 95, 50), (215, 170, 85), "caramel"),
        ("chantilly_cloud_pavlova", (255, 252, 245), (250, 245, 235), (212, 175, 55), "tiered")
    ]
    
    file_paths = []
    for idx, (name, base_c, sec_c, accent_c, style) in enumerate(cake_profiles, 1):
        # Busy non-white background to test background removal
        bg_r = random.randint(180, 230)
        bg_g = random.randint(170, 215)
        bg_b = random.randint(160, 205)
        
        img = Image.new("RGB", (900, 900), (bg_r, bg_g, bg_b))
        draw = ImageDraw.Draw(img)
        
        # Add background kitchen/studio texture
        for line_y in range(0, 900, 50):
            draw.line([(0, line_y), (900, line_y)], fill=(bg_r - 15, bg_g - 15, bg_b - 15), width=2)
            
        # Draw Cake Structure
        # Cake Stand base
        draw.rectangle([340, 750, 560, 780], fill=(160, 160, 160))
        draw.ellipse([300, 720, 600, 750], fill=(190, 190, 190))
        
        # Tier 1 (Bottom)
        draw.rounded_rectangle([250, 520, 650, 725], radius=20, fill=base_c)
        # Tier 2 (Middle)
        draw.rounded_rectangle([300, 350, 600, 520], radius=18, fill=sec_c)
        # Tier 3 (Top)
        draw.rounded_rectangle([350, 210, 550, 350], radius=15, fill=base_c)
        
        # Gold or Floral Accents on each tier
        for drip_x in range(260, 640, 35):
            draw.ellipse([drip_x, 505, drip_x + 25, 545], fill=accent_c)
            
        for drip_x2 in range(310, 590, 30):
            draw.ellipse([drip_x2, 335, drip_x2 + 20, 370], fill=accent_c)
            
        # Cake Topper
        draw.ellipse([430, 170, 470, 210], fill=accent_c)
        
        filename = f"{idx:02d}_{name}.jpg"
        file_path = output_dir / filename
        img.save(file_path, "JPEG", quality=95)
        file_paths.append(file_path)
        
    print(f"Successfully generated {len(file_paths)} test cake images in {output_dir}")
    return file_paths

if __name__ == "__main__":
    generate_20_cake_images(Path(__file__).resolve().parent / "sample_20_cakes")
