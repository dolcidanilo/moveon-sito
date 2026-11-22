"""Immagini della demo del pannello clienti (studio dentistico immaginario «Studio Dentistico Luce»).
Foto segnaposto morbide (da sostituire dal pannello: è proprio la cosa da mostrare al cliente) e il logo.
Uso: python3 tools/demo-dentista-img.py  →  wordpress/moveon-blocks/assets/pannello/demo/
"""
import math
import os
import random

from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT = os.path.join(os.path.dirname(__file__), '..', 'wordpress', 'moveon-blocks', 'assets', 'pannello', 'demo')
os.makedirs(OUT, exist_ok=True)
FONT_B = '/usr/share/fonts/opentype/inter/Inter-Bold.otf'
FONT_M = '/usr/share/fonts/opentype/inter/Inter-Medium.otf'
FONT_S = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'


def hexrgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def sfumatura(w, h, a, b, angolo=35):
    img = Image.new('RGB', (w, h))
    px = img.load()
    ca, cb = hexrgb(a), hexrgb(b)
    r = math.radians(angolo)
    dx, dy = math.cos(r), math.sin(r)
    L = abs(w * dx) + abs(h * dy)
    for y in range(h):
        for x in range(w):
            t = max(0, min(1, (x * dx + y * dy) / L))
            px[x, y] = tuple(int(ca[i] + (cb[i] - ca[i]) * t) for i in range(3))
    return img


def scintilla(d, cx, cy, r, colore):
    # stella a quattro punte morbida (la «luce» del marchio)
    pts = []
    for i in range(16):
        ang = i * math.pi / 8
        rr = r if i % 4 == 0 else (r * 0.22 if i % 2 else r * 0.34)
        pts.append((cx + rr * math.cos(ang - math.pi / 2), cy + rr * math.sin(ang - math.pi / 2)))
    d.polygon(pts, fill=colore)


def foto(nome, w, h, a, b, seme, etichetta='Foto di esempio · sostituiscila dal pannello'):
    random.seed(seme)
    sw, sh = w // 4, h // 4  # disegno piccolo e poi ingrandisco: più veloce e più morbido
    img = sfumatura(sw, sh, a, b, random.choice([20, 35, 60, 120]))
    luce = Image.new('RGBA', (sw, sh), (0, 0, 0, 0))
    d = ImageDraw.Draw(luce)
    for _ in range(7):
        r = random.randint(sh // 5, sh // 2)
        x, y = random.randint(-r // 2, sw), random.randint(-r // 2, sh)
        d.ellipse((x - r, y - r, x + r, y + r), fill=(255, 255, 255, random.randint(18, 46)))
    luce = luce.filter(ImageFilter.GaussianBlur(sh // 14))
    img = Image.alpha_composite(img.convert('RGBA'), luce).resize((w, h), Image.LANCZOS)
    d = ImageDraw.Draw(img)
    s = min(w, h)
    scintilla(d, int(w * 0.72), int(h * 0.38), int(s * 0.16), (255, 255, 255, 235))
    scintilla(d, int(w * 0.84), int(h * 0.24), int(s * 0.05), (255, 255, 255, 190))
    f = ImageFont.truetype(FONT_M, max(18, s // 38))
    tw = d.textlength(etichetta, font=f)
    pad = s // 60
    x, y = (w - tw) / 2, h * 0.8 - f.size / 2  # al centro in orizzontale: resta visibile anche quando la foto viene ritagliata
    d.rounded_rectangle((x - pad * 1.6, y - pad, x + tw + pad * 1.6, y + f.size + pad * 1.3), radius=pad * 2, fill=(0, 0, 0, 70))
    d.text((x, y), etichetta, font=f, fill=(255, 255, 255, 235))
    img.convert('RGB').save(os.path.join(OUT, nome), quality=84, optimize=True, progressive=True)


def logo(nome, colore_testo, colore_marchio):
    W, H = 1200, 260
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((10, 30, 210, 230), radius=56, fill=hexrgb(colore_marchio) + (255,))
    scintilla(d, 110, 130, 70, (255, 255, 255, 255))
    f1 = ImageFont.truetype(FONT_B, 92)
    f2 = ImageFont.truetype(FONT_S, 44)
    d.text((250, 34), 'Luce', font=f1, fill=colore_testo)
    d.text((254, 150), 'STUDIO DENTISTICO', font=f2, fill=colore_testo)
    img = img.crop(img.getbbox())
    img.save(os.path.join(OUT, nome), optimize=True)


def icona(nome, colore):
    img = Image.new('RGBA', (512, 512), hexrgb(colore) + (255,))
    d = ImageDraw.Draw(img)
    scintilla(d, 256, 256, 170, (255, 255, 255, 255))
    img.save(os.path.join(OUT, nome), optimize=True)


TEAL, SCURO = '#0f766e', '#0b3d3a'
foto('studio.jpg', 1920, 1080, '#0b3d3a', '#14b8a6', 1, 'Foto dello studio · sostituiscila dal pannello')
foto('accoglienza.jpg', 1200, 900, '#0f766e', '#5eead4', 2)
foto('tecnologia.jpg', 1200, 900, '#134e4a', '#38bdf8', 3)
foto('sorriso.jpg', 1200, 900, '#0f766e', '#fbbf77', 4)
foto('contatti.jpg', 1200, 1500, '#0b3d3a', '#2dd4bf', 5)
logo('logo-luce-chiaro.png', (11, 61, 58, 255), TEAL)
logo('logo-luce-scuro.png', (255, 255, 255, 255), '#14b8a6')
icona('icona-luce.png', TEAL)
print('ok', sorted(os.listdir(OUT)))
