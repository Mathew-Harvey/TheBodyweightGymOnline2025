// Colour grade used for every photograph on the site (scripts/build-images.js).
//
// One look for all images so that a 2016 studio shoot, a 2020 live-stream frame and a
// phone photo read as one set, and match the book covers:
//   - warm colours (skin, wood, brick, the orange accent) keep their saturation;
//     cool colours (the gym's blue shirts, foam rollers, purple casts) are pulled
//     back towards grey, a print-film look
//   - an S-curve for contrast and a warm push in the mid-tones
//   - blacks lifted to the page black (#121214) and whites rolled off to the paper
//     colour (#F3F1EC), so photos meet the black bands and the paper page cleanly
//   - optional black and white (red-filter mix, ink-to-paper duotone) for small
//     archival photos, where the grain hides their low resolution
//   - fine film grain from a seeded generator, so rebuilds are byte-for-byte identical
//
// Works on raw 8-bit RGB buffers from sharp.

const INK = [18, 18, 20];        // --black
const PAPER = [243, 241, 236];   // --paper

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

const smooth = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

// 1 for warm hues (red, orange, yellow), falling to 0 for cool hues (cyan, blue,
// violet and magenta, which is mostly stage lighting in these photos).
function warmWeight(h) {
  if (h < 60) return 1;
  if (h < 150) return 1 - smooth(60, 150, h);
  if (h < 325) return 0;
  return smooth(325, 352, h);
}

/**
 * @param {Buffer} data   raw RGB (3 channels, 8-bit)
 * @param {object} opt
 *   saturation  0..1.5   (default 0.9)  saturation of warm colours
 *   coolSat     0..1.5   (default 0.4)  saturation of cool colours
 *   warmth      0..1     (default 0.5)  warm push in the mid-tones
 *   contrast    0..1     (default 0.32) S-curve strength
 *   exposure    -1..1    (default 0)    mid-tone lift (+) or drop (-)
 *   bw          boolean  black and white duotone (ink to paper)
 *   grain       0..0.1   (default 0.02) noise amplitude, strongest in the mid-tones
 *   seed        string   seeds the grain
 */
function grade(data, opt = {}) {
  const sat = opt.saturation ?? 0.9;
  const coolSat = opt.coolSat ?? 0.4;
  const warmth = opt.warmth ?? 0.5;
  const k = opt.contrast ?? 0.32;
  const exposure = opt.exposure ?? 0;
  const bw = !!opt.bw;
  const grain = opt.grain ?? 0.02;
  const lo = INK, hi = PAPER;
  const rand = mulberry32(hashString(opt.seed || 'bwg'));

  const gamma = Math.pow(2, -exposure * 0.7);
  const lut = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const x = Math.pow(i / 255, gamma);
    const s = 0.5 - 0.5 * Math.cos(Math.PI * x);
    lut[i] = x + (s - x) * k;
  }

  let spare = null;
  const gauss = () => {
    if (spare !== null) { const s = spare; spare = null; return s; }
    let u = 0;
    while (u === 0) u = rand();
    const v = rand();
    const m = Math.sqrt(-2 * Math.log(u));
    spare = m * Math.sin(2 * Math.PI * v);
    return m * Math.cos(2 * Math.PI * v);
  };

  const out = Buffer.allocUnsafe(data.length);
  for (let i = 0; i < data.length; i += 3) {
    let r = lut[data[i]], g = lut[data[i + 1]], b = lut[data[i + 2]];
    let L;

    if (bw) {
      // red-filter mix: skin and wood light up, blue shirts go dark
      L = 0.42 * r + 0.48 * g + 0.10 * b;
      r = g = b = L;
    } else {
      L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const max = Math.max(r, g, b), min = Math.min(r, g, b), c = max - min;
      let h = 0;
      if (c > 1e-6) {
        if (max === r) h = 60 * (((g - b) / c) % 6);
        else if (max === g) h = 60 * ((b - r) / c + 2);
        else h = 60 * ((r - g) / c + 4);
        if (h < 0) h += 360;
      }
      const s = coolSat + (sat - coolSat) * warmWeight(h);
      r = L + (r - L) * s;
      g = L + (g - L) * s;
      b = L + (b - L) * s;
      const w = warmth * 4 * L * (1 - L) * 0.07;
      r += w;
      g += w * 0.25;
      b -= w * 1.1;
    }

    if (grain) {
      const n = gauss() * grain * (0.35 + 2.6 * L * (1 - L));
      r += n; g += n; b += n;
    }

    r = r < 0 ? 0 : r > 1 ? 1 : r;
    g = g < 0 ? 0 : g > 1 ? 1 : g;
    b = b < 0 ? 0 : b > 1 ? 1 : b;
    out[i] = Math.round(lo[0] + (hi[0] - lo[0]) * r);
    out[i + 1] = Math.round(lo[1] + (hi[1] - lo[1]) * g);
    out[i + 2] = Math.round(lo[2] + (hi[2] - lo[2]) * b);
  }
  return out;
}

module.exports = { grade, INK, PAPER };
