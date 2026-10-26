"""Create responsive WebP copies without cropping or replacing source images."""

from pathlib import Path
import sys

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "responsive"
SOURCES = {
    "gaming-hero": "assets/catalog/g938-wireless/display/g938-dark-hero-wireless-gaming-headset.jpg",
    "g938-overview": "assets/catalog/g938-wireless/display/g938-product-overview-accessories.jpg",
    "g936-overview": "assets/catalog/g936-lightweight/evidence/display/g936-overview-receiver.jpg",
    "b9-desk": "assets/catalog/b9-bluetooth/reference/b9-black-lifestyle-desk.jpg",
    "b7-overview": "assets/catalog/b7-bluetooth/image-01.jpg",
    "tws044f-overview": "assets/catalog/tws-tws044f/evidence/display/tws044f-case-earbuds-overview.jpg",
    "g942-wired": "assets/catalog/g942-wired/image-01.png",
    "g935-wired": "assets/catalog/g935-wired/image-01.jpg",
    "g935-connectors": "insights/gaming-headset-usb-audio-or-lighting/g935-usb-35mm-scene.png",
    "g947-overview": "assets/catalog/g947-new/image-01.jpg",
    "g947-product-presentation": "assets/catalog/g947-new/creative/g947-product-presentation.png",
    "g947-gaming-desk-illustration": "assets/catalog/g947-new/creative/g947-gaming-desk-illustration.png",
    "g947-wearing-fit-illustration": "assets/catalog/g947-new/creative/g947-wearing-fit-illustration.png",
    "g947-packaging-concept": "assets/catalog/g947-new/creative/g947-packaging-concept.png",
    "g947-platform-connections-illustration": "assets/catalog/g947-new/creative/g947-platform-connections-illustration.png",
    "g940-overview": "assets/catalog/g940-wireless/image-01.jpg",
    "g940-product-presentation": "assets/catalog/g940-wireless/creative/g940-product-presentation.png",
    "g940-gaming-desk-illustration": "assets/catalog/g940-wireless/creative/g940-gaming-desk-illustration.png",
    "g940-wearing-fit-illustration": "assets/catalog/g940-wireless/creative/g940-wearing-fit-illustration.png",
    "g940-packaging-concept": "assets/catalog/g940-wireless/creative/g940-packaging-concept.png",
    "g940-feature-board": "assets/catalog/g940-wireless/creative/g940-feature-board.png",
    "g940-device-connections-illustration": "assets/catalog/g940-wireless/creative/g940-device-connections-illustration.png",
}


def main():
    requested = sys.argv[1:] or list(SOURCES)
    unknown = set(requested) - SOURCES.keys()
    if unknown:
        raise ValueError(f"Unknown image names: {sorted(unknown)}")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for name in requested:
        source = SOURCES[name]
        original = ROOT / source
        with Image.open(original) as opened:
            image = ImageOps.exif_transpose(opened).convert("RGB")
            widths = (480, 960, 1440) if name == "gaming-hero" else (480, 960)
            for width in widths:
                if width > image.width:
                    raise ValueError(f"{source} is narrower than {width}px")
                height = round(image.height * width / image.width)
                resized = image.resize((width, height), Image.Resampling.LANCZOS)
                target = OUTPUT / f"{name}-{width}.webp"
                resized.save(target, "WEBP", quality=85, method=6)
                print(f"{target.relative_to(ROOT)}: {width}x{height}, "
                      f"{target.stat().st_size} bytes; source {original.stat().st_size} bytes")


if __name__ == "__main__":
    main()
