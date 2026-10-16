#!/usr/bin/env python3
"""Generate the missing 1200x630 Open Graph image for The Boring Education platform.

Root cause of issue #1358: the SEO component renders og:image from seoMeta.image,
which defaults to https://theboringeducation.com/images/large-og.png, but that file
does not exist anywhere in the repo. This script reproduces it from brand tokens.
"""
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
PRIMARY = (255, 87, 87)      # #FF5757
DARK = (4, 5, 5)            # #040505
BLUE = (37, 85, 255)        # #2555FF
PURPLE = (146, 60, 255)     # #923CFF
WHITE = (255, 255, 255)
GREY = (132, 132, 132)      # #848484

FONT_DIR = "/usr/share/fonts/truetype/dejavu"

def font(size, bold=True):
    name = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    return ImageFont.truetype(f"{FONT_DIR}/{name}", size)

img = Image.new("RGB", (W, H), DARK)
d = ImageDraw.Draw(img)

# subtle diagonal brand gradient accents
for i in range(0, H, 2):
    t = i / H
    r = int(DARK[0] + (18 - DARK[0]) * t)
    g = int(DARK[1] + (18 - DARK[1]) * t)
    b = int(DARK[2] + (24 - DARK[2]) * t)
    d.line([(0, i), (W, i)], fill=(r, g, b))

# top-left brand mark: rounded square with "TBE" monogram
ms = 150
mx, my = 90, 90
d.rounded_rectangle([mx, my, mx + ms, my + ms], radius=34, fill=PRIMARY)
f_mono = font(64, bold=True)
mono = "TBE"
tw = d.textlength(mono, font=f_mono)
d.text((mx + (ms - tw) / 2, my + 34), mono, font=f_mono, fill=WHITE)

# headline
f_h1 = font(72, bold=True)
d.text((90, 300), "The Boring Education", font=f_h1, fill=WHITE)
f_sub = font(34, bold=False)
d.text((92, 392), "Tech education for everyone — courses, interview prep,", font=f_sub, fill=GREY)
d.text((92, 436), "open source projects, and webinars.", font=f_sub, fill=GREY)

# feature chips
chips = [("Courses", BLUE), ("Interview Prep", PURPLE), ("Open Source", PRIMARY)]
cx = 90
cy = 520
for label, color in chips:
    tw = d.textlength(label, font=font(24, bold=True))
    pad = 22
    w = tw + pad * 2
    d.rounded_rectangle([cx, cy, cx + w, cy + 52], radius=26, fill=color)
    d.text((cx + pad, cy + 10), label, font=font(24, bold=True), fill=WHITE)
    cx += w + 18

# footer URL
f_url = font(24, bold=False)
d.text((90, 590), "theboringeducation.com", font=f_url, fill=PRIMARY)

img.save("apps/platform/public/images/large-og.png", quality=95)
print("saved apps/platform/public/images/large-og.png")
