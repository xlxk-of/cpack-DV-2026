"""The foil textures (fx/): all of them tile seamlessly, because the card slides them about under the pointer.

  oil.webp      an oil-slick: warped fractal noise run through thin-film interference colours
  glitter.png   dense fine sparkle, greyscale; two copies are multiplied and slid past each other so flakes twinkle
  flakes.png    sparse larger flakes and four-point glints

Run:  python3 tools/fx/make.py
"""
import os
import numpy as np
from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'fx')
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)


def fractal(n, beta=2.2, seed=0):
    """Tileable 1/f noise, 0..1."""
    r = np.random.default_rng(seed)
    f = np.fft.fft2(r.standard_normal((n, n)))
    fx = np.fft.fftfreq(n)[:, None]
    fy = np.fft.fftfreq(n)[None, :]
    k = np.sqrt(fx * fx + fy * fy)
    k[0, 0] = 1
    out = np.real(np.fft.ifft2(f / k ** (beta / 2 + 0.5)))
    out -= out.min()
    return out / out.max()


def warp(img, dx, dy):
    n = img.shape[0]
    yy, xx = np.mgrid[0:n, 0:n]
    return img[(yy + dy).astype(int) % n, (xx + dx).astype(int) % n]


def blur_wrap(img, k=2):
    """A small box blur that wraps, to take the stair-steps out of the warp."""
    acc = np.zeros_like(img)
    for dy in range(-k, k + 1):
        for dx in range(-k, k + 1):
            acc += np.roll(np.roll(img, dy, 0), dx, 1)
    return acc / (2 * k + 1) ** 2


def oil(n=768):
    a, b, c, d = (fractal(n, 3.6, s) for s in (1, 2, 3, 4))
    t = warp(a, (b - 0.5) * n * 0.5, (c - 0.5) * n * 0.5)
    t = blur_wrap(warp(t, (c - 0.5) * n * 0.2, (d - 0.5) * n * 0.2), 3)
    t = t * 3.4 + d * 0.9
    two_pi = np.pi * 2
    rgb = np.stack([0.5 + 0.5 * np.cos(two_pi * (t + p)) for p in (0.0, 0.33, 0.67)], axis=-1)
    # push towards the saturated magenta / teal / gold of a real slick, with soft dark water between the bands
    rgb = np.clip((rgb - 0.5) * 1.35 + 0.5, 0, 1) ** 1.1
    veins = (0.5 + 0.5 * np.cos(two_pi * (t * 0.5 + 0.1)))[..., None] ** 0.8
    rgb = rgb * (0.3 + 0.7 * veins)
    Image.fromarray((rgb * 255).astype(np.uint8)).save(os.path.join(OUT, 'oil.webp'), quality=88)


def splat(img, x, y, rad, v):
    n = img.shape[0]
    k = int(np.ceil(rad * 2.5))
    ys, xs = np.mgrid[-k:k + 1, -k:k + 1]
    g = np.exp(-(xs * xs + ys * ys) / (2 * (rad * 0.6) ** 2)) * v
    iy = (int(y) + ys) % n
    ix = (int(x) + xs) % n
    np.maximum.at(img, (iy, ix), g)


def star(img, x, y, size, v):
    n = img.shape[0]
    for i in range(-size, size + 1):
        fall = (1 - abs(i) / (size + 1)) ** 2.2 * v
        for (dx, dy) in ((i, 0), (0, i)):
            iy, ix = (int(y) + dy) % n, (int(x) + dx) % n
            img[iy, ix] = max(img[iy, ix], fall)
    splat(img, x, y, 1.6, v)


def glitter(n=512):
    img = np.zeros((n, n))
    for _ in range(9000):
        splat(img, rng.uniform(0, n), rng.uniform(0, n), rng.uniform(0.7, 1.7), rng.uniform(0.15, 1) ** 1.6)
    # fine facet grain so the multiply of two copies never goes fully black
    img = np.maximum(img, fractal(n, 0.4, 9) * 0.22)
    Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)).save(os.path.join(OUT, 'glitter.png'), optimize=True)


def flakes(n=512):
    img = np.zeros((n, n))
    for _ in range(420):
        splat(img, rng.uniform(0, n), rng.uniform(0, n), rng.uniform(1.4, 3.2), rng.uniform(0.4, 1))
    for _ in range(46):
        star(img, rng.uniform(0, n), rng.uniform(0, n), int(rng.uniform(5, 15)), rng.uniform(0.7, 1))
    Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)).save(os.path.join(OUT, 'flakes.png'), optimize=True)


oil()
glitter()
flakes()
print('fx written')
