"""Check sitemap-page links, fragments and local HTML resource references offline."""

import argparse
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
import xml.etree.ElementTree as ET


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.ids = set()
        self.links = []
        self.assets = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get("id"):
            self.ids.add(attrs["id"])
        if tag == "a":
            if attrs.get("name"):
                self.ids.add(attrs["name"])
            if attrs.get("href"):
                self.links.append(attrs["href"])
        if tag in {"img", "script", "source", "video", "audio"} and attrs.get("src"):
            self.assets.append(attrs["src"])
        if tag == "video" and attrs.get("poster"):
            self.assets.append(attrs["poster"])
        if tag == "link" and attrs.get("rel") in {"stylesheet", "icon", "preload"}:
            if attrs.get("href"):
                self.assets.append(attrs["href"])
        if tag in {"img", "source"} and attrs.get("srcset"):
            candidates = attrs["srcset"]
            if not candidates.startswith("data:"):
                self.assets.extend(item.strip().split()[0] for item in candidates.split(",") if item.strip())


def audit(root):
    root = Path(root).resolve()
    parsed = {}
    issues = []
    counts = {"pages": 0, "links": 0, "assets": 0}

    def page(file):
        if file not in parsed:
            parsed[file] = Page(file.read_text(encoding="utf-8"))
        return parsed[file]

    for node in ET.parse(root / "sitemap.xml").findall(".//{*}loc"):
        url = node.text.strip()
        source = root / unquote(urlsplit(url).path).lstrip("/") / "index.html"
        if not source.is_file():
            issues.append({"page": url, "target": url, "reason": "missing sitemap page"})
            continue
        counts["pages"] += 1
        document = page(source)
        for kind, references in (("links", document.links), ("assets", document.assets)):
            for reference in references:
                target_url = urlsplit(urljoin(url, reference))
                if target_url.scheme not in {"http", "https"} or target_url.netloc not in {"talrivo.com", "www.talrivo.com"}:
                    continue
                counts[kind] += 1
                target = (root / unquote(target_url.path).lstrip("/")).resolve()
                if not target.is_relative_to(root):
                    issues.append({"page": url, "target": reference, "reason": "path outside public root"})
                    continue
                if target.is_dir():
                    target /= "index.html"
                if not target.is_file():
                    issues.append({"page": url, "target": reference, "reason": "missing file"})
                elif kind == "links" and target_url.fragment and target.suffix == ".html":
                    if unquote(target_url.fragment) not in page(target).ids:
                        issues.append({"page": url, "target": reference, "reason": "missing anchor"})
    return {**counts, "issues": issues}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path.cwd())
    args = parser.parse_args()
    result = audit(args.root)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    raise SystemExit(bool(result["issues"]))
