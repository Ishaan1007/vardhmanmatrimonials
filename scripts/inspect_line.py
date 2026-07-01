from PIL import Image
import os
import math

path = os.path.join('public', 'ezgif-2a8ae843605b09e2-jpg')
frames = sorted([f for f in os.listdir(path) if f.endswith('.jpg')])
# choose a frame near the artifact if possible
for fn in [frames[74], frames[75], frames[76]]:
    im = Image.open(os.path.join(path, fn)).convert('RGB')
    w, h = im.size
    print('frame', fn, 'size', w, h)
    for y in range(h-20, h):
        row = [im.getpixel((x, y)) for x in range(w)]
        avg = sum(sum(px) for px in row)/(3*w)
        darkest = min(row)
        lightest = max(row)
        dark_count = sum(1 for px in row if sum(px) < 60)
        print(f' y={y} avg={avg:.1f} dark={dark_count} min={darkest} max={lightest}')
    print()
