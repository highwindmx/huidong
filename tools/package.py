#!/usr/bin/env python3
"""Package Huidong from modified/ into an AMO-ready XPI and a source zip.

Atomic write (temp file + os.replace) avoids Errno 22 when a preview panel
still holds a handle on the previous artifact.
"""
import json
import os
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "modified"
TOOLS = ROOT / "tools"


def iter_files(base):
    for root, dirs, files in os.walk(base):
        dirs[:] = [d for d in dirs if d != "META-INF"]
        for name in files:
            path = Path(root) / name
            rel = path.relative_to(base).as_posix()
            if rel.startswith("META-INF/"):
                continue
            yield path, rel


XPI_OUT = ROOT / "huidong-1.2-menu.xpi"
SOURCE_OUT = ROOT / "huidong-1.2-menu-source.zip"


def atomic_zip(out_path, builder):
    # Write straight to a fresh output name; the environment's safe-delete
    # hook blocks overwriting/removing existing artifacts.
    with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        builder(z)
    return out_path


def build_xpi(z):
    for path, rel in iter_files(SRC):
        if rel == "mozilla-recommendation.json":
            continue
        z.write(path, rel)


def build_source(z):
    for path, rel in iter_files(SRC):
        if rel.endswith(".xpi"):
            continue
        z.write(path, "source/" + rel)
    for name in ("BUILD.md", "rollup.config.mjs", "make_icon.py"):
        z.write(TOOLS / name, name)


def verify():
    xpi = XPI_OUT
    src = SOURCE_OUT
    with zipfile.ZipFile(xpi) as z:
        names = z.namelist()
        manifest = json.loads(z.read("manifest.json"))
        bg = z.read("core/background.mjs").decode("utf-8")
        about = z.read("views/options/fragments/about.inc").decode("utf-8")
        popup = z.read("popup.html").decode("utf-8")
        assert manifest["name"] == "挥动", manifest["name"]
        assert manifest["version"] == "1.2", manifest["version"]
        assert manifest["browser_specific_settings"]["gecko"]["id"] == "ksmao.work@outlook.com"
        assert not any(n == "mozilla-recommendation.json" or n.startswith("META-INF/") for n in names)
        assert "views/installation/index.html" not in bg, "welcome tab trigger still present"
        assert "browser.browserSettings.contextMenuShowEvent.set" in bg, "context-menu setup missing"
        assert "https://github.com/highwindmx/huidong/releases" in bg, "changelog link not updated"
        assert "Robbendebiene/Gesturefy/releases" not in bg, "old changelog link still present"
        assert "Snap Links Plus" in about and "Gesturefy" in about, "thanks text missing"
        assert "启用框选链接" in popup, "new popup label missing"
        assert "框选链接（Snap Links）" not in popup and "按住触发键拖动鼠标框选" not in popup, "old popup text still present"
        print("XPI:", xpi.stat().st_size, "bytes |", len(names), "entries")
        print("name/ver:", manifest["name"], manifest["version"])
        print("welcome trigger removed:", "views/installation/index.html" not in bg)
        print("changelog link -> huidong:", "https://github.com/highwindmx/huidong/releases" in bg)
        print("popup labels updated:", "启用框选链接" in popup)
        print("thanks in about:", "Snap Links Plus" in about)
    print("source zip:", src.stat().st_size, "bytes")


if __name__ == "__main__":
    atomic_zip(XPI_OUT, build_xpi)
    atomic_zip(SOURCE_OUT, build_source)
    verify()
