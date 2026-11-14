"""Create responsive WebP copies without cropping or replacing source images."""

from pathlib import Path
import sys

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "responsive"
SOURCES = {
    "home-g946-lifestyle": "marketing/visuals/home-hero-20261114/g946-lifestyle-concept-original.png",
    # Product-detail previews; source files remain available through gallery links.
    "detail-g926-product-overview-receiver": "assets/catalog/g926-wireless/evidence/display/g926-product-overview-receiver.jpg",
    "detail-g926-rgb-logo-microphone-detail": "assets/catalog/g926-wireless/evidence/display/g926-rgb-logo-microphone-detail.jpg",
    "detail-g926-comfort-receiver-detail-collage": "assets/catalog/g926-wireless/evidence/display/g926-comfort-receiver-detail-collage.jpg",
    "detail-g926-accessory-receiver-cable-set": "assets/catalog/g926-wireless/evidence/display/g926-accessory-receiver-cable-set.jpg",
    "detail-g926-wearing-fit-reference": "assets/catalog/g926-wireless/evidence/display/g926-wearing-fit-reference.jpg",
    "detail-g926-packaging-accessory-set": "assets/catalog/g926-wireless/evidence/display/g926-packaging-accessory-set.jpg",
    "detail-g935-packaging-accessory-set": "assets/catalog/g935-wireless/evidence/display/g935-packaging-accessory-set.jpg",
    "detail-g935-detachable-microphone-detail": "assets/catalog/g935-wireless/evidence/display/g935-detachable-microphone-detail.jpg",
    "detail-g935-accessory-manual-flatlay": "assets/catalog/g935-wireless/evidence/display/g935-accessory-manual-flatlay.jpg",
    "detail-g935-wearing-fit-reference": "assets/catalog/g935-wireless/evidence/display/g935-wearing-fit-reference.jpg",
    "detail-g935-comfort-controls-detail-collage": "assets/catalog/g935-wireless/evidence/display/g935-comfort-controls-detail-collage.jpg",
    "detail-g936-microphone-controls-receiver": "assets/catalog/g936-lightweight/evidence/display/g936-microphone-controls-receiver.jpg",
    "detail-g936-accessories-cable-set": "assets/catalog/g936-lightweight/evidence/display/g936-accessories-cable-set.jpg",
    "detail-g936-knitted-cushion-detail": "assets/catalog/g936-lightweight/evidence/display/g936-knitted-cushion-detail.jpg",
    "detail-g936-packaging-accessory-set": "assets/catalog/g936-lightweight/evidence/display/g936-packaging-accessory-set.jpg",
    "detail-g936-use-scene-references": "assets/catalog/g936-lightweight/evidence/display/g936-use-scene-references.jpg",
    "detail-g938-detachable-boom-microphone-detail": "assets/catalog/g938-wireless/display/g938-detachable-boom-microphone-detail.jpg",
    "detail-g938-tri-mode-accessories-receivers-cables": "assets/catalog/g938-wireless/display/g938-tri-mode-accessories-receivers-cables.jpg",
    "detail-g938-packaging-accessory-set": "assets/catalog/g938-wireless/display/g938-packaging-accessory-set.jpg",
    "detail-g938-wearing-fit-sample-review": "assets/catalog/g938-wireless/display/g938-wearing-fit-sample-review.jpg",
    "detail-g938-comfort-control-detail-collage": "assets/catalog/g938-wireless/display/g938-comfort-control-detail-collage.jpg",
    "detail-g938-headband-controls-detail-collage": "assets/catalog/g938-wireless/display/g938-headband-controls-detail-collage.jpg",
    "detail-g938-gaming-desk-use-scenes": "assets/catalog/g938-wireless/display/g938-gaming-desk-use-scenes.jpg",
    "detail-g941-hero-scenes": "assets/catalog/g941-wireless/evidence/g941-tri-mode-use-scenes.jpg",
    "detail-g941-packaging-accessory-set-no-pouch": "assets/catalog/g941-wireless/evidence/display/g941-packaging-accessory-set-no-pouch.jpg",
    "detail-g941-detachable-boom-microphone-detail": "assets/catalog/g941-wireless/evidence/display/g941-detachable-boom-microphone-detail.jpg",
    "detail-g941-product-overview-receiver": "assets/catalog/g941-wireless/evidence/display/g941-product-overview-receiver.jpg",
    "detail-g941-tri-mode-use-scenes": "assets/catalog/g941-wireless/evidence/display/g941-tri-mode-use-scenes.jpg",
    "detail-g941-wearing-fit-reference": "assets/catalog/g941-wireless/evidence/display/g941-wearing-fit-reference.jpg",
    "detail-g941-comfort-controls-detail-collage": "assets/catalog/g941-wireless/evidence/display/g941-comfort-controls-detail-collage.jpg",
    "detail-g941-black-red-wireless-gaming-headset": "assets/catalog/g941-wireless/evidence/display/g941-black-red-wireless-gaming-headset.jpg",
    "detail-g941-white-wireless-gaming-headset": "assets/catalog/g941-wireless/evidence/display/g941-white-wireless-gaming-headset.jpg",
    "g935-browse": "assets/catalog/g935-wireless/evidence/display/g935-gaming-desk-use-scene.jpg",
    "g936-browse": "assets/catalog/g936-lightweight/evidence/display/g936-wearing-fit-reference.jpg",
    "g941-browse": "assets/catalog/g941-wireless/image-01.jpg",
    "g926-browse": "assets/catalog/g926-wireless/evidence/display/g926-use-scenes.jpg",
    "g940-browse": "assets/catalog/g940-wireless/image-01.jpg",
    "g947-browse": "assets/catalog/g947-new/image-01.jpg",

    "brand-wordmark-dark": "assets/brand/talrivo-wordmark-new-dark.png",
    "g946-dock-bundle": "assets/catalog/g946-rgb/supplied-20261105/dock-bundle.jpg",
    "g946-headset-front": "assets/catalog/g946-rgb/supplied-20261105/headset-front.jpg",
    "g946-headset-controls": "assets/catalog/g946-rgb/supplied-20261105/headset-controls.jpg",
    "g946-dock-rear": "assets/catalog/g946-rgb/supplied-20261105/dock-rear.jpg",
    "g946-configuration-presentation": "assets/catalog/g946-rgb/supplied-20261105/configuration-presentation.jpg",
    "tws042s-overview": "assets/catalog/tws-tws042s/image-01.jpg",

    "gaming-hero": "assets/catalog/g938-wireless/display/g938-dark-hero-wireless-gaming-headset.jpg",
    "g938-overview": "assets/catalog/g938-wireless/display/g938-product-overview-accessories.jpg",
    "g936-overview": "assets/catalog/g936-lightweight/evidence/display/g936-overview-receiver.jpg",
    "b9-desk": "assets/catalog/b9-bluetooth/reference/b9-black-lifestyle-desk.jpg",
    "b7-overview": "assets/catalog/b7-bluetooth/image-01.jpg",
    "tws044f-desk": "assets/catalog/tws-tws044f/evidence/display/tws044f-office-lifestyle-open-case.jpg",
    "earclip09s-case": "assets/catalog/tws-earclip-09s/evidence/display/earclip09s-open-case.jpg",
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
    "g926-feature-overview": "assets/catalog/g926-wireless/creative/g926-feature-overview.png",
    "g926-product-presentation": "assets/catalog/g926-wireless/creative/g926-product-presentation.png",
    "g926-gaming-scene-illustration": "assets/catalog/g926-wireless/creative/g926-gaming-scene-illustration.png",
    "g926-wearing-fit-illustration": "assets/catalog/g926-wireless/creative/g926-wearing-fit-illustration.png",
    "g926-controls-material-illustration": "assets/catalog/g926-wireless/creative/g926-controls-material-illustration.png",
    "g926-device-connections-illustration": "assets/catalog/g926-wireless/creative/g926-device-connections-illustration.png",
    "factory-assembly": "assets/quality-review/gaming-headset-assembly-line-reference.jpg",
    "factory-audio-check": "assets/quality-review/gaming-headset-audio-check-reference.jpg",
    "factory-packaging": "assets/quality-review/gaming-headset-packaging-line-reference.jpg",
    "factory-assembly-closeup": "assets/quality-review/gaming-headset-assembly-closeup-reference.jpg",
    "factory-charging-area": "assets/quality-review/gaming-headset-charging-review-reference.jpg",
    "factory-cable-fixture": "assets/quality-review/gaming-headset-cable-fixture-reference.jpg",
    "factory-cert-red": "assets/certificates/sit240719190301-red-preview.webp",
    "factory-cert-rohs": "assets/certificates/sit240719190302r-rohs-preview.webp",
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
            image = ImageOps.exif_transpose(opened).convert("RGBA" if name.startswith("brand-") else "RGB")
            widths = (240, 480) if name.startswith("factory-cert-") else (
                (480, 960, 1440) if name == "gaming-hero" else (480, 960)
            )
            if name == "home-g946-lifestyle":
                widths = (640, 960, 1672)
            elif name.startswith("brand-"):
                widths = (320, 480)
            elif name.endswith("-browse"):
                widths = (480, 800, 960)
            elif name.startswith("g946-"):
                widths = (480, 800, 1200)
            elif name == "tws042s-overview":
                widths = (320, 480, 616)
            elif (name.startswith("factory-") and not name.startswith("factory-cert-")) or name in ("g938-overview", "b9-desk"):
                widths = (480, 720, 960)
            for width in widths:
                if width > image.width:
                    raise ValueError(f"{source} is narrower than {width}px")
                height = round(image.height * width / image.width)
                resized = image.resize((width, height), Image.Resampling.LANCZOS)
                target = OUTPUT / f"{name}-{width}.webp"
                resized.save(target, "WEBP", quality=75 if name == "g926-browse" else 85, method=6)
                print(f"{target.relative_to(ROOT)}: {width}x{height}, "
                      f"{target.stat().st_size} bytes; source {original.stat().st_size} bytes")


if __name__ == "__main__":
    main()
