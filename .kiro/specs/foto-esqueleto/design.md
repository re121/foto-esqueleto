# Design

`FotoEsqueleto.create(config)` builds the whole UI and returns `{draw, params, state, util}`.

config:
- `id`, `title`, `subtitle`, `icon`
- `inputs: { files, multiple, camera }`
- `controls: [{ key, type, label, min, max, step, value, options, format }]`
- `size(api)` optional → `{w, h}`; default: first source scaled to `maxSize`
- `render(api)` required; `api = { canvas, ctx, sources, video, params, util, setStatus }`
- `exportName`, `exportType`

Render flow: input/control change → `draw()` → size canvas → `render(api)`.
Camera: `requestAnimationFrame` loop calls `draw()` until stopped.

Shared utils: `fit`, `gray`, `sobel`, `hexToRgb`.

## Valores

**Valores — Licht für Maler / Light for painters** (`apps/valores/app.html`)

Purpose: help a painter analyse the tonal and colour-temperature structure of a reference photo or their own painting. All processing happens on a single `<canvas>` inside `render()`.

### Mode selector

A `select` control (`mode`) switches between six display modes. All modes start by drawing the source image scaled to the canvas, reading the pixel data with `getImageData`, and writing back a modified copy with `putImageData`.

| key | German label | English |
|---|---|---|
| `original` | Original | Original |
| `values` | Tonwerte | Value scale |
| `notan` | Notan | Notan |
| `squint` | Kneifen | Squint |
| `zones` | Zonenkarte | Zone map |
| `temperature` | Farbtemperatur | Temperature |

### Per-mode processing (pixel loop)

**Value scale (`values`):** compute luminance `L = 0.299R + 0.587G + 0.114B`; quantise into `steps` buckets (3, 5, or 9 — from a `steps` select); output a mid-grey for each bucket.

**Notan (`notan`):** L > `threshold` (0–255 range slider) → white, else → black.

**Squint (`squint`):** box-blur the canvas pixel data using a radius driven by a `blur` range slider (0–40 px). Two-pass horizontal + vertical box blur for efficiency.

**Zone map (`zones`):** map L to Adams zones 0–10 (each zone spans 255/11 ≈ 23.2 lum units); paint the pixel with a zone colour (a warm grey ramp from black to white, 11 steps). Draw a legend strip at the bottom of the canvas with zone number, German name, and English name.

Zone names:

| Zone | Lum range | German | English |
|---|---|---|---|
| 0 | 0–22 | Tiefschwarz | Pure black |
| I | 23–45 | Fast schwarz | Near black |
| II | 46–68 | Tiefer Schatten | Deep shadow |
| III | 69–91 | Kernschatten | Core shadow |
| IV | 92–114 | Schlagschatten | Cast shadow |
| V | 115–137 | Mittleres Grau | Middle grey |
| VI | 138–160 | Halbton | Half-light |
| VII | 161–183 | Reflexlicht | Reflected light |
| VIII | 184–206 | Helles Licht | Bright light |
| IX | 207–229 | Fast Weiß | Near white |
| X | 230–255 | Reines Weiß | Pure white |

**Temperature (`temperature`):** compute L; warm pixels (low-lum reds and mids — hue near red/orange) get an orange overlay, cool pixels (blue/cyan) get a blue overlay. Implementation: convert each pixel to HSL; if hue in [340–360 or 0–45] tint toward `rgb(255,140,0)`; if hue in [180–270] tint toward `rgb(30,100,255)`; blend at `strength` (0–100 %).

### Grid overlay

Independent of mode: a `grid` checkbox and a `gridDiv` select (3×3, 4×4, custom). When active, draw translucent white lines over the canvas after `putImageData`.

### Eyedropper

`canvas.addEventListener('click', …)` in a one-time setup block (stored in a flag on the app's returned object so it is registered only once). On click: read the pixel at the event's offset coordinates, compute L, map to Adams zone 1–9 (clamped; zone 0 and X map to 1 and 9), format as `Zone V — #a0a0a0` and call `setStatus`.

Because `setStatus` is only available inside `render()`, store a reference via a closure captured the first time `render()` is called.

### Controls layout (in order)

1. `mode` — select (6 options)
2. `steps` — select: 3, 5, 9 (visible when mode = values)
3. `threshold` — range 0–255, default 128 (visible when mode = notan)
4. `blur` — range 0–40, default 8 (visible when mode = squint)
5. `grid` — checkbox, default false
6. `gridDiv` — select: 3×3, 4×4, custom (visible when grid = true)
7. `gridCustom` — range 2–20, default 6 (visible when gridDiv = custom)

Note: the skeleton does not support conditional control visibility natively. Implement by reading `params` inside `render()` and ignoring irrelevant controls; the controls are always rendered in the sidebar but have no visual effect when not applicable. (Or use a minimal post-render DOM tweak via `document.querySelector` if desired — but only from within the `render()` closure, never touching the DOM directly from outside `create`.)
