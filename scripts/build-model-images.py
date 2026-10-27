"""Build uncropped model-page previews without enlarging source images."""

import json
import sys
from pathlib import Path
from shutil import copyfile
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]


def main():
    group = sys.argv[1] if len(sys.argv) > 1 else "all"
    if group not in ("all", "gaming", "tws"):
        raise ValueError("Expected all, gaming or tws")
    models = json.loads((ROOT / "content/model-page-reviews.json").read_text())["models"]
    output = ROOT / "assets/responsive/model-pages"
    output.mkdir(parents=True, exist_ok=True)
    metadata_path = ROOT / "content/model-page-image-sizes.json"
    metadata = json.loads(metadata_path.read_text()) if metadata_path.exists() else {}
    count = 0
    for model in models:
        if group != "all" and (model["category"] == "tws") != (group == "tws"):
            continue
        sizes = []
        for index, source in enumerate(model["assets"]):
            with Image.open(ROOT / source) as opened:
                image = ImageOps.exif_transpose(opened).convert("RGB")
                dimensions = {"width": image.width, "height": image.height}
                sizes.append(dimensions)
                if index == 0 or model.get("responsiveGallery"):
                    widths = sorted({min(480, max(1, image.width // 2)), min(960, image.width)})
                    variants = []
                    for width in widths:
                        height = round(image.height * width / image.width)
                        role = "hero" if index == 0 else f"view-{index + 1}"
                        target = output / f"{model['folder']}-{role}-{width}.webp"
                        image.resize((width, height), Image.Resampling.LANCZOS).save(
                            target, "WEBP", quality=85, method=6)
                        variants.append({"path": str(target.relative_to(ROOT)), "width": width})
                    if index == 0:
                        hero_variants = variants
                    if model.get("responsiveGallery"):
                        dimensions["variants"] = variants
                    if model.get("cataloguePreviews"):
                        copyfile(ROOT / variants[-1]["path"], (ROOT / source).with_suffix(".webp"))
        metadata[model["folder"]] = {"assets": sizes, "variants": hero_variants}
        count += 1
    metadata_path.write_text(json.dumps(metadata, indent=2) + "\n")
    print(f"Built responsive previews and image sizes for {count} {group} model pages.")


if __name__ == "__main__":
    main()
