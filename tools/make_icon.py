"""生成「挥动」图标：蓝紫渐变圆角矩形 + 白色「挥」字。"""
import os
from PIL import Image, ImageDraw, ImageFont

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                       "modified", "resources", "img")
FONT_PATH = r"C:\Windows\Fonts\msyhbd.ttc"  # 微软雅黑粗体
SIZES = [96, 48, 32]
SS = 8  # 超大画布倍数，最后 LANCZOS 缩小保证抗锯齿


def lerp(a, b, t):
    return int(a + (b - a) * t)


def make(size):
    n = size * SS
    img = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    px = img.load()

    # 蓝紫对角渐变：左上 #4A5BE8(蓝) -> 右下 #8B3FD6(紫)
    c0 = (74, 91, 232)
    c1 = (139, 63, 214)
    for y in range(n):
        for x in range(n):
            t = (x + y) / (2 * (n - 1))
            px[x, y] = (lerp(c0[0], c1[0], t),
                        lerp(c0[1], c1[1], t),
                        lerp(c0[2], c1[2], t), 255)

    # 圆角矩形遮罩，圆角半径按尺寸比例
    radius = int(n * 0.22)
    mask = Image.new("L", (n, n), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle([0, 0, n - 1, n - 1], radius=radius, fill=255)
    img.putalpha(mask)

    # 白色「挥」字居中
    draw = ImageDraw.Draw(img)
    font_size = int(n * 0.60)
    font = ImageFont.truetype(FONT_PATH, font_size)
    text = "\u6325"  # 挥
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = (n - tw) / 2 - bbox[0]
    ty = (n - th) / 2 - bbox[1] - n * 0.01
    draw.text((tx, ty), text, font=font, fill=(255, 255, 255, 255))

    return img.resize((size, size), Image.LANCZOS)


os.makedirs(OUT_DIR, exist_ok=True)
for s in SIZES:
    p = os.path.join(OUT_DIR, f"iconx{s}.png")
    make(s).save(p, "PNG", optimize=True)
    print("wrote", p, os.path.getsize(p), "bytes")
