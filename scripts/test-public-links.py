import tempfile
import unittest
from pathlib import Path
from importlib.util import module_from_spec, spec_from_file_location

spec = spec_from_file_location("public_links", Path(__file__).with_name("audit-public-links.py"))
module = module_from_spec(spec)
spec.loader.exec_module(module)


class PublicLinksTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / "sitemap.xml").write_text(
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url>'
            '<loc>https://talrivo.com/</loc></url></urlset>', encoding="utf-8")
        (self.root / "details").mkdir()
        (self.root / "details/index.html").write_text('<h1 id="receiver">Receiver</h1>', encoding="utf-8")
        (self.root / "image.webp").write_bytes(b"test asset")

    def run_page(self, html):
        (self.root / "index.html").write_text(html, encoding="utf-8")
        return module.audit(self.root)

    def test_valid_relative_absolute_and_same_page_links(self):
        result = self.run_page('<h1 id="top">Title</h1><a href="#top">Top</a>'
                               '<a href="details/?product=a&amp;inquiry=sample#receiver">Details</a>'
                               '<a href="https://www.talrivo.com/details/#receiver">Absolute</a>')
        self.assertEqual(result["issues"], [])
        self.assertEqual(result["links"], 3)

    def test_missing_anchor_and_missing_download(self):
        result = self.run_page('<a href="details/#absent">Bad anchor</a>'
                               '<a href="missing.txt" download>Bad download</a>')
        self.assertEqual({item["reason"] for item in result["issues"]}, {"missing anchor", "missing file"})

    def test_missing_srcset_variant(self):
        result = self.run_page('<img src="image.webp" srcset="image.webp 480w, missing.webp 960w">')
        self.assertEqual(result["assets"], 3)
        self.assertEqual(len(result["issues"]), 1)

    def test_external_and_non_http_links_are_not_local_targets(self):
        result = self.run_page('<a href="https://example.com/unknown">External</a>'
                               '<a href="mailto:sales@example.com">Email</a>'
                               '<img src="data:image/png;base64,AAAA">')
        self.assertEqual(result["issues"], [])
        self.assertEqual(result["links"], 0)


if __name__ == "__main__":
    unittest.main()
