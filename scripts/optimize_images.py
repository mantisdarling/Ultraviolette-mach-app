import os
import urllib.request
import io
from PIL import Image

# Setup directories
IMAGE_DIR = os.path.join("assets", "images")
os.makedirs(IMAGE_DIR, exist_ok=True)

# List of assets to download and optimize into responsive formats
primary_assets = {
    "ss04": "https://d2atk76x06g5eh.cloudfront.net/website/india/home/F77/desktop/SS04.png",
    "ss05": "https://d2atk76x06g5eh.cloudfront.net/website/india/home/F77/desktop/SS05.png",
    "ss06": "https://d2atk76x06g5eh.cloudfront.net/website/india/home/F77/desktop/SS06.png",
}

# Responsive sizes (width, name_suffix)
sizes = [
    (1920, "desktop"),
    (1024, "tablet"),
    (640, "mobile")
]

# Colour swatch assets (only converted to WebP, not resized because they need transparent background details)
swatch_assets = {
    "laser-turbo-red": "https://d2atk76x06g5eh.cloudfront.net/website/india/schema/vechicles/Mach_2/Laser/Turbo+Red.png",
    "laser-afterburner-yellow": "https://d2atk76x06g5eh.cloudfront.net/website/india/schema/vechicles/Mach_2/Laser/Afterburner+Yellow.png",
    "laser-plasma-red": "https://d2atk76x06g5eh.cloudfront.net/website/india/schema/vechicles/Mach_2/Laser/Plasma+Red.png",
    "airstrike-stellar-white": "https://d2atk76x06g5eh.cloudfront.net/website/india/schema/vechicles/Mach_2/Airstrike/Stellar+White.png",
    "airstrike-supersonic-silver": "https://d2atk76x06g5eh.cloudfront.net/website/india/schema/vechicles/Mach_2/Airstrike/Supersonic+Silver.png",
    "airstrike-lightning-blue": "https://d2atk76x06g5eh.cloudfront.net/website/india/schema/vechicles/Mach_2/Airstrike/Lighting+Blue.png",
    "shadow-stealth-grey": "https://d2atk76x06g5eh.cloudfront.net/website/india/schema/vechicles/Mach_2/Shadow/Stealth+Grey.png",
    "shadow-asteroid-grey": "https://d2atk76x06g5eh.cloudfront.net/website/india/schema/vechicles/Mach_2/Shadow/Asteroid+Grey.png",
    "shadow-cosmic-black": "https://d2atk76x06g5eh.cloudfront.net/website/india/schema/vechicles/Mach_2/Shadow/Cosmic+Black.png",
    "superstreet-laser-turbo-red": "https://d2atk76x06g5eh.cloudfront.net/website/india/schema/vechicles/SuperStreet/laser/turbo_red.png"
}

def download_image(url):
    print(f"Downloading {url}...")
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            return response.read()
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return None

def process_primary_assets():
    print("--- Processing Primary Images ---")
    for key, url in primary_assets.items():
        data = download_image(url)
        if not data:
            continue
        
        try:
            img = Image.open(io.BytesIO(data))
            for width, suffix in sizes:
                output_name = f"{key}-{suffix}.webp"
                output_path = os.path.join(IMAGE_DIR, output_name)
                
                # Maintain aspect ratio
                w, h = img.size
                scale = width / float(w)
                # Don't scale up
                if scale >= 1.0:
                    resized_img = img
                else:
                    height = int(h * scale)
                    resized_img = img.resize((width, height), Image.Resampling.LANCZOS)
                
                # Save as WebP
                resized_img.save(output_path, "WEBP", quality=85)
                print(f"Saved {output_path} (width: {width})")
        except Exception as e:
            print(f"Failed to process {key}: {e}")

def process_swatches():
    print("--- Processing Color Swatches ---")
    for key, url in swatch_assets.items():
        data = download_image(url)
        if not data:
            continue
        
        try:
            img = Image.open(io.BytesIO(data))
            output_path = os.path.join(IMAGE_DIR, f"{key}.webp")
            
            # Save swatch image directly as WebP with transparency
            img.save(output_path, "WEBP", quality=85)
            print(f"Saved {output_path}")
        except Exception as e:
            print(f"Failed to process swatch {key}: {e}")

if __name__ == "__main__":
    process_primary_assets()
    process_swatches()
    print("Image optimization complete!")
