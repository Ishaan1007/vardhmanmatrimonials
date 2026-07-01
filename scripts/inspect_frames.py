from PIL import Image
import os

path = os.path.join('public', 'ezgif-2a8ae843605b09e2-jpg')
frames = sorted([f for f in os.listdir(path) if f.endswith('.jpg')])
idxs = [0, 10, 20, 50, 100, 149]
for idx in idxs:
    fn = frames[idx]
    im = Image.open(os.path.join(path, fn))
    w, h = im.size
    pix = im.convert('RGB')
    bottom = [pix.getpixel((x, h - 1)) for x in range(w)]
    unique = sorted(set(bottom))
    print(idx, fn, w, h, 'unique bottom colors:', len(unique), 'sample:', unique[:10])
    mid_row = h // 2
    middle = [pix.getpixel((x, mid_row)) for x in range(w)]
    mids = sorted(set(middle))
    print('  mid-row unique colors:', len(mids), 'sample:', mids[:10])
