# Void 634 — Cache Lookup

Open source RuneScape revision 634 cache browser.

## Setup

```bash
npm install
npm run dev
```

## Build & Deploy to Vercel

```bash
npm run build
```

Or connect the repo to Vercel — it auto-detects Vite.

## Data

All JSON files live in `src/data/`. They are imported directly via Vite's dynamic import so each tab's data loads on first click (lazy).

| File | Tab |
|------|-----|
| item_definitions.json | Items |
| npc_definitions.json | NPCs |
| object_definitions.json | Objects |
| client_scripts.json | Client Scripts |
| graphic_definitions.json | Graphics |
| varbit_definitions.json | Varbits |
| varp_definitions.json | Varps |
| struct_definitions.json | Structs |
| render_animation_definitions.json | Render Anims |
| animation_skeletons.json | Skeletons |

## Search

- Type a **name** to filter by substring match
- Type a **number** to find by exact ID
- Results capped at 500 per search
