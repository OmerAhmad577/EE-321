# VOLTA — Sonic Engineering

Single-page, cinematic portfolio site for **Volta**, Pakistan's first electric sports
crosskart, built by **Sonic Engineering** in collaboration with the Ghulam Ishaq Khan
Institute of Science and Technology (GIKI).

Plain HTML / CSS / JS — no build step, no external dependencies. Libraries are
vendored in `assets/vendor/`: [`<model-viewer>`](https://modelviewer.dev/)
(interactive 3D), GSAP + ScrollTrigger (scroll animation), Lenis (smooth scrolling).
Only the Google Fonts stylesheet loads from a CDN.

---

## Running it locally

The 3D model and fonts won't load from `file://` — serve the folder over HTTP:

```bash
# from the repo root, any one of:
python3 -m http.server 8000
npx serve .
```

Then open <http://localhost:8000>.

For **GitHub Pages**: Settings → Pages → deploy from the branch root. `index.html` is
already at the top level.

---

## Assets you need to drop in

The site is fully functional before assets arrive — every slot shows a styled
"AWAITING ASSET" placeholder until the file exists. Use **exactly these paths**:

| Path | What it is | Where it appears |
|---|---|---|
| `assets/model/volta.glb` | **Compressed** 3D model (see below) | §3 The Machine |
| `assets/img/hero-silhouette.jpg` | Dark side-profile silhouette shot | Hero background · Gallery FIG.01 |
| `assets/img/powertrain-rear.jpg` | Rear powertrain close-up (motor / HV pack) | Mission background · Gallery FIG.02 |
| `assets/img/top-view.jpg` | Top-down render | Gallery FIG.03 |
| `assets/img/render-front.jpg` | Three-quarter chassis render | 3D poster/fallback · Gallery FIG.04 · social preview |
| `assets/img/team-lead.jpg` | Interview / on-record photo | Gallery FIG.05 |

Export images as JPG (or WebP with the same names updated in `index.html`),
**≤ 300 KB each** ideally (~1920 px on the long edge, quality ~75).

---

## ⚠️ The 3D model MUST be compressed first

The raw GLB is **~140 MB — do not ship it**. It will destroy load times, especially on
mobile. Target **under ~15 MB** (under 8 MB is better). Two ways:

**Option A — CLI (recommended):**

```bash
npm install -g @gltf-transform/cli

# Draco mesh compression + WebP texture compression + resize textures
gltf-transform optimize raw-volta.glb assets/model/volta.glb \
  --compress draco --texture-compress webp --texture-size 2048
```

If it's still too big, lower `--texture-size` to `1024`, or add
`--simplify --simplify-error 0.001` to reduce mesh density.

**Option B — browser:** open <https://gltf.report/>, drop the GLB in, run the
optimization script (Draco + texture resize), and export.

`<model-viewer>` decodes Draco automatically — no extra setup needed. The site shows a
loading readout inside the frame while the model streams in, and falls back to the
static render if WebGL or the file is unavailable.

---

## Nudging the 3D hotspots

The three markers (**Battery / Motor / ECU**) are positioned automatically as fractions
of the model's bounding box, so they land sensibly at any model scale. To fine-tune
them, edit the `HOTSPOTS` object at the top of `assets/js/main.js`:

```js
frac: { x: 0.0, y: -0.05, z: 0.05 }
// each axis runs -1 … +1 from the model's center to the box faces:
// x: -1 left … +1 right   y: -1 floor … +1 top   z: -1 back … +1 front
```

If the markers land on the wrong end of the car (front vs. rear), your model faces the
opposite way — just flip the sign of `z` in each entry.

---

## Structure

```
index.html            — the whole page (9 sections + preloader)
assets/css/style.css  — design system + all styling
assets/js/main.js     — preloader, scroll animation, 3D + hotspot logic
assets/vendor/        — model-viewer, GSAP, ScrollTrigger, Lenis (vendored)
assets/img/           — drop the 5 photos/renders here
assets/model/         — drop the compressed volta.glb here
```

Accessibility: honors `prefers-reduced-motion` (calm, static presentation), alt text on
all imagery, keyboard-operable hotspots and cards, visible focus states.

---

© 2026 Sonic Engineering · Volta was developed in collaboration with the Ghulam Ishaq
Khan Institute of Science and Technology (GIKI).
