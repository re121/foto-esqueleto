# foto-esqueleto 💀📷

**One skeleton, many photo tools.** A tiny template for building single-file photo apps
that run offline in the browser and never upload your pictures.

Built for **Kiroween 2026 — Skeleton Crew**.

## The two apps

| App | What it does | Inputs |
|---|---|---|
| **Enfoque** (`dist/enfoque.html`) | Focus peaking for macro photography: the sharpest edges light up in colour. | Camera or photo |
| **Kontaktbogen** (`dist/hoja-de-contactos.html`) | Many photos → one printable contact sheet or postcard (A6, A4, square). | Many photos |

Both are built from the same `skeleton/` — an app is just a config and a `render()` function.

## Make your own app

1. Copy `apps/_vorlage` to `apps/my-app`.
2. Change `id`, `title`, `controls` and `render()`.
3. Run `node build.mjs` → `dist/my-app.html`.

## Why

I photograph tropical orchids in the greenhouses of the Botanical Garden Basel (project
*ORCHIDACEAE*). I kept writing small single-purpose tools — focus checking, background removal,
contact sheets — and each time rewrote the same file handling, sliders and export.
This skeleton is that common part, extracted.

## How Kiro was used

See `.kiro/` — steering (product, tech, structure), the spec (requirements, design, tasks) and hooks.

## License

MIT
