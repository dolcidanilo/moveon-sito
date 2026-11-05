#!/usr/bin/env python3
"""Crea dist/moveon-blocks.zip, il file da caricare in WordPress (Plugin → Aggiungi nuovo → Carica plugin)."""
import os, zipfile, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'wordpress', 'moveon-blocks')
OUT = os.path.join(ROOT, 'dist', 'moveon-blocks.zip')

version = re.search(r"Version:\s*([\d.]+)", open(os.path.join(SRC, 'moveon-blocks.php'), encoding='utf-8').read()).group(1)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
n = 0
with zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED) as z:
    for base, dirs, files in os.walk(SRC):
        dirs[:] = sorted(d for d in dirs if not d.startswith('.'))
        for f in sorted(files):
            if f.startswith('.'):
                continue
            path = os.path.join(base, f)
            arc = os.path.join('moveon-blocks', os.path.relpath(path, SRC))
            info = zipfile.ZipInfo(arc, date_time=(2026, 1, 1, 0, 0, 0))  # data fissa: lo zip cambia solo se cambiano i file
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            with open(path, 'rb') as fh:
                z.writestr(info, fh.read())
            n += 1
print(f'dist/moveon-blocks.zip · versione {version} · {n} file · {os.path.getsize(OUT) // 1024} KB')
