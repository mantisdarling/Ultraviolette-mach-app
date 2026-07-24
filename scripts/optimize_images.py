import os
import urllib.request
import io
from PIL import Image

# Setup directories
imageDir = os.path.join("assets", "images")
os.makedirs(imageDir, exist_ok=True)

# List of assets to download and optimize into responsive formats
primaryAssets = {
    "ss04": "https://d2atk76x06g5eh.cloudfront.net/website/india/home/F77/desktop/SS04.png",
    "ss05": "https://d2atk76x06g5eh.cloudfront.net/website/india/home/F77/desktop/SS05.png",
    "ss06": "https://d2atk76x06g5eh.cloudfront.net/website/india/home/F77/desktop/SS06.png",
}

# Responsive sizes (width, nameSuffix)
sizes = [
    (1920, "desktop"),
    (1024, "tablet"),
    (640, "mobile")
]

# Colour swatch assets (only converted to WebP, not resized because they need transparent background details)
swatchAssets = {
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

def downloadImage(url):
    print(f"Downloading {url}...")
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            return response.read()
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return None

def processPrimaryAssets():
    print("--- Processing Primary Images ---")
    for key, url in primaryAssets.items():
        data = downloadImage(url)
        if not data:
            continue
        
        try:
            img = Image.open(io.BytesIO(data))
            for width, suffix in sizes:
                outputName = f"{key}-{suffix}.webp"
                outputPath = os.path.join(imageDir, outputName)
                
                # Maintain aspect ratio
                w, h = img.size
                scale = width / float(w)
                # Don't scale up
                if scale >= 1.0:
                    resizedImg = img
                else:
                    height = int(h * scale)
                    resizedImg = img.resize((width, height), Image.Resampling.LANCZOS)
                
                # Save as WebP
                resizedImg.save(outputPath, "WEBP", quality=85)
                print(f"Saved {outputPath} (width: {width})")
        except Exception as e:
            print(f"Failed to process {key}: {e}")

def processSwatches():
    print("--- Processing Color Swatches ---")
    for key, url in swatchAssets.items():
        data = downloadImage(url)
        if not data:
            continue
        
        try:
            img = Image.open(io.BytesIO(data))
            outputPath = os.path.join(imageDir, f"{key}.webp")
            
            # Save swatch image directly as WebP with transparency
            img.save(outputPath, "WEBP", quality=85)
            print(f"Saved {outputPath}")
        except Exception as e:
            print(f"Failed to process swatch {key}: {e}")

if __name__ == "__main__":
    processPrimaryAssets()
    processSwatches()
    print("Image optimization complete!")
