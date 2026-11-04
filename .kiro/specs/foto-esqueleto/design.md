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
