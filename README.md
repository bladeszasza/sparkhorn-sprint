# Sparkhorn Sprint

**Play:** [https://bladeszasza.github.io/sparkhorn-sprint/](https://bladeszasza.github.io/sparkhorn-sprint/)

Gentle three-lane unicorn runner for young children (iPad, finger or Apple Pencil), Hungarian UI.
It also runs inside Csillagkert as a reward game.

- **No external requests:** three.js r128 is vendored in `vendor/three.min.js` (MIT, from cdnjs, SRI-checked).
- **Speech for non-readers:** short Hungarian sentences on the start screen, at the start and end of a round
  (star count spoken in words); the 🔊 button repeats the instructions. Without a Hungarian voice it stays silent.
  Voice choice and speech volume follow Csillagkert's device settings when present.
- **Sound:** one AudioContext with compressor + limiter, levels matched to Csillagkert's sounds; follows
  Csillagkert's 3-step volume (`csillagkert_volume`).
- **Memory:** obstacles, stars and track tiles are light clones of one template each (shared geometry and
  material); the unicorn model is disposed when another one is picked.
- `window.__sparkhorn.busy()` tells Csillagkert whether a round is running, so its reward time waits for it.

## Check

Serve the repo root locally (any static server, e.g. port 8125), then run in headless Chrome:

```bash
node tests/check.mjs http://localhost:8125/
```

It checks: no external requests, local three.js, spoken lines, sound levels (old formula vs. new chain, no
clipping, not louder than Csillagkert), stable geometry/texture counts over long rounds and unicorn swaps,
`busy()`, one AudioContext, no console exceptions.
