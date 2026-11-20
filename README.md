# Leonida Ledger — GTA VI Trophy Guide & Tracker (v3)

An offline guide and progress tracker for all 55 Grand Theft Auto VI
PlayStation 5 trophies: 1 platinum, 2 gold, 6 silver, 46 bronze.

Every trophy carries its official name, description and grade, a guide in our
own words with numbered steps and cited sources, a difficulty rating, and its
place in the platinum roadmap. The tracker saves progress in the browser,
exports and imports it as JSON, filters by kind and grade, sorts by roadmap
order, and hides story spoilers until a trophy is earned. The roadmap view
lays out six stages to the platinum — about 200 hours at difficulty 4/10 per
PowerPyx — with the one potentially missable trophy flagged and its Chapter 1
cut-off explained.

## Run locally

Requires Node.js 22 or later. From the repository root:

```sh
node serve.ts
```

Then open <http://localhost:8080> in a desktop browser. The app is static
files under `app/` and works with the network off; it fetches nothing at run
time. Source links open only when the reader follows them.

## Layout

- `app/index.html` — the guide's single page (tracker + roadmap views).
- `app/style.css` — the whole look, one stylesheet.
- `app/app.js` — boot, saved progress, search, filters, sort, export/import.
- `app/render.js` — the checklist, the trophy detail panel, the dashboard.
- `app/roadmap.js` — the six roadmap stages and the missable watchlist.
- `app/data/trophies.json` — the 55 trophies: official text, guides, steps,
  sources, counts, difficulty and roadmap stage.
- `main.ts` — hands the entry in: copies `app/` and `screenshots/` to
  `/output` and writes `dossier.json` with the kit's library.
- `screenshots/` — four real renders of the app (the first by name is the
  cover); `shots.json` says which view each shows.

## Sources

Trophy names, descriptions and grades follow the official list as Exophase
and PSNProfiles publish it. Guide facts are drawn from PowerPyx's GTA 6
Trophy Guide & Roadmap, GTABase's GTA 6 trophy list and the GTA Zone trophy
list, each cited beside the trophy it supports. All guide text is written for
this entry; no guide text is copied from any source.

Competition: [make.fun GTA 6 Trophy Guide bounty](https://make.fun/bounty/gta6-trophy-guide-01)
