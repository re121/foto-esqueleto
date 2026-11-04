# Tech

- Plain HTML, CSS and JavaScript. No framework, no npm dependencies, no CDN.
- Shared code lives in `skeleton/core.js` and `skeleton/core.css`.
- `node build.mjs` inlines the skeleton into every app → `dist/<app>.html`.
- Image work happens on `<canvas>` with `getImageData` / `putImageData`.
- Camera via `getUserMedia`; files via `<input type=file>` and drag & drop.
- Settings persist in `localStorage`, always wrapped in try/catch (private mode must not break the app).
- Target browsers: current Safari (macOS/iOS), Chrome, Firefox.
