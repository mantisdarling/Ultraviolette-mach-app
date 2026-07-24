import os
from PIL import Image, ImageDraw

def generatePwaIcons():
    os.makedirs(os.path.join("assets", "icons"), exist_ok=True)
    
    # Stylized M points for drawings
    # Left vertical stem, right vertical stem, and diagonal center points.
    
    # 1. Generate 192x192 Icon
    icon192 = Image.new("RGBA", (192, 192), (8, 8, 8, 255))
    draw192 = ImageDraw.Draw(icon192)
    # Outer glowing purple ring/circle
    draw192.ellipse([20, 20, 172, 172], fill=(123, 44, 191, 255))
    # Draw stylized 'M'
    draw192.rectangle([64, 56, 78, 136], fill=(255, 255, 255, 255))     # Left stem
    draw192.rectangle([114, 56, 128, 136], fill=(255, 255, 255, 255))   # Right stem
    draw192.polygon([(78, 56), (96, 100), (114, 56), (96, 76)], fill=(255, 255, 255, 255)) # Diagonals
    
    path192 = os.path.join("assets", "icons", "icon-192.png")
    icon192.save(path192, "PNG")
    print(f"Generated {path192}")

    # 2. Generate 512x512 Icon
    icon512 = Image.new("RGBA", (512, 512), (8, 8, 8, 255))
    draw512 = ImageDraw.Draw(icon512)
    # Outer glowing purple ring/circle
    draw512.ellipse([54, 54, 458, 458], fill=(123, 44, 191, 255))
    # Draw stylized 'M'
    draw512.rectangle([170, 150, 208, 362], fill=(255, 255, 255, 255))   # Left stem
    draw512.rectangle([304, 150, 342, 362], fill=(255, 255, 255, 255))   # Right stem
    draw512.polygon([(208, 150), (256, 266), (304, 150), (256, 202)], fill=(255, 255, 255, 255)) # Diagonals
    
    path512 = os.path.join("assets", "icons", "icon-512.png")
    icon512.save(path512, "PNG")
    print(f"Generated {path512}")

if __name__ == "__main__":
    generatePwaIcons()
