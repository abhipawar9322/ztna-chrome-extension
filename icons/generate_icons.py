import os
import math
from PIL import Image, ImageDraw

def draw_ztna_icon(size):
    # High-resolution canvas for supersampling
    scale = 4
    canvas_size = size * scale
    img = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    cx, cy = canvas_size / 2, canvas_size / 2
    r = canvas_size * 0.44

    # Outer Shield / Hexagon vertices
    points = []
    # Shield shape points
    # Top center, top right, mid right, bottom tip, mid left, top left
    points = [
        (cx, cy - r),
        (cx + r * 0.85, cy - r * 0.7),
        (cx + r * 0.85, cy + r * 0.1),
        (cx, cy + r * 0.95),
        (cx - r * 0.85, cy + r * 0.1),
        (cx - r * 0.85, cy - r * 0.7),
    ]

    # Draw Shield Background with dark cyber navy
    draw.polygon(points, fill=(10, 25, 47, 255), outline=(0, 229, 255, 255), width=max(2, int(scale * 1.5)))

    # Inner Glow Hexagon
    inner_r = r * 0.82
    inner_points = [
        (cx, cy - inner_r),
        (cx + inner_r * 0.85, cy - inner_r * 0.7),
        (cx + inner_r * 0.85, cy + inner_r * 0.1),
        (cx, cy + inner_r * 0.95),
        (cx - inner_r * 0.85, cy + inner_r * 0.1),
        (cx - inner_r * 0.85, cy - inner_r * 0.7),
    ]
    draw.polygon(inner_points, fill=(16, 37, 66, 255))

    # Center Padlock / AI Core
    # Shackle (arc)
    shackle_w = inner_r * 0.48
    shackle_h = inner_r * 0.48
    shackle_box = [cx - shackle_w/2, cy - inner_r * 0.45, cx + shackle_w/2, cy - inner_r * 0.45 + shackle_h]
    shackle_thickness = max(2, int(inner_r * 0.14))
    draw.arc(shackle_box, start=180, end=0, fill=(0, 240, 255, 255), width=shackle_thickness)

    # Lock Body
    body_w = inner_r * 0.6
    body_h = inner_r * 0.46
    body_box = [cx - body_w/2, cy - inner_r * 0.15, cx + body_w/2, cy - inner_r * 0.15 + body_h]
    draw.rounded_rectangle(body_box, radius=int(body_w * 0.15), fill=(0, 200, 150, 255), outline=(255, 255, 255, 255), width=max(1, int(scale)))

    # Keyhole
    kh_r = body_w * 0.1
    draw.ellipse([cx - kh_r, cy + inner_r * 0.01 - kh_r, cx + kh_r, cy + inner_r * 0.01 + kh_r], fill=(10, 25, 47, 255))
    draw.polygon([
        (cx - kh_r * 0.7, cy + inner_r * 0.01),
        (cx + kh_r * 0.7, cy + inner_r * 0.01),
        (cx + kh_r * 0.5, cy + inner_r * 0.18),
        (cx - kh_r * 0.5, cy + inner_r * 0.18)
    ], fill=(10, 25, 47, 255))

    # Circuit nodes at top corners
    node_r = max(2, int(scale * 1.8))
    draw.ellipse([cx - inner_r*0.6 - node_r, cy - inner_r*0.4 - node_r, cx - inner_r*0.6 + node_r, cy - inner_r*0.4 + node_r], fill=(0, 240, 255, 255))
    draw.ellipse([cx + inner_r*0.6 - node_r, cy - inner_r*0.4 - node_r, cx + inner_r*0.6 + node_r, cy - inner_r*0.4 + node_r], fill=(0, 240, 255, 255))

    # Resize with LANCZOS downsampling for crisp edges
    resampled = img.resize((size, size), Image.Resampling.LANCZOS)
    return resampled

output_dir = r"C:\Users\Abhishek Pawar\.gemini\antigravity\scratch\ztna-chrome-extension\icons"
for s in [16, 32, 48, 128]:
    out_img = draw_ztna_icon(s)
    out_path = os.path.join(output_dir, f"icon{s}.png")
    out_img.save(out_path, "PNG")
    print(f"Generated {out_path} ({s}x{s})")
