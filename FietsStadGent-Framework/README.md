# FietsStadGent Framework

Observable Framework application for the UGent Datavisualisatie project:
Is Gent echt een fietsstad?

This app combines:

- A global map and ranking view of all bike counting poles in Gent
- A per-pole detail page with summary statistics
- Starter pages for D3, Observable Plot, and Vega-Lite visualizations

## Requirements

- Node.js 18 or newer
- npm

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Start local development server:

```bash
npm run dev
```

3. Open the local URL shown in the terminal (usually <http://localhost:3000>).

## Command reference

| Command | Description |
| --- | --- |
| `npm install` | Install or reinstall dependencies |
| `npm run dev` | Start local preview server |
| `npm run build` | Build the static site into `dist/` |
| `npm run deploy` | Deploy to Observable |
| `npm run clean` | Clear Observable data loader cache |
| `npm run observable` | Run Observable CLI commands |

## Implemented pages

- `/` Home page
- `/fietspalen` Global dashboard page:
  - General data analytics
  - ranking table with sorting
  - interactive Leaflet map
- `/paal?code=...` Detail page for one counting pole
- `/visualisaties-plot` Observable Plot starter page
- `/visualisaties-d3` D3 starter page
- `/visualisaties-vega-lite` Vega-Lite starter page

## Data pipeline

Source data is loaded from CSV and normalized via shared loader code.

- Shared transformation logic: `src/components/bike-data.js`
- Build-time JSON loaders:
  - `src/data/locaties.json.js`
  - `src/data/fietspalen.json.js`
- Map boundary file:
  - `src/data/OSMB-71785c830e71f3607aaeffc6b51538d7206c36a0.geojson`

When running `npm run dev` or `npm run build`, Observable executes the data loaders and serves generated JSON from `src/data`.

## Tech stack

- Observable Framework
- Leaflet
- D3
- Observable Plot
- Vega / Vega-Lite / Vega Embed

## Project structure

```text
.
├─ src/
│  ├─ components/
│  │  ├─ bike-data.js
│  │  └─ timeline.js
│  ├─ data/
│  │  ├─ data_fietspalen.csv
│  │  ├─ data_locaties.csv
│  │  ├─ fietspalen.json.js
│  │  ├─ locaties.json.js
│  │  ├─ OSMB-71785c830e71f3607aaeffc6b51538d7206c36a0.geojson
│  │  ├─ events.json
│  │  └─ launches.csv.js
│  ├─ index.md
│  ├─ fietspalen.md
│  ├─ paal.md
│  ├─ visualisaties-plot.md
│  ├─ visualisaties-d3.md
│  ├─ visualisaties-vega-lite.md
│  ├─ example-dashboard.md
│  └─ example-report.md
├─ observablehq.config.js
├─ package.json
└─ README.md
```

## Notes for contributors

- Keep shared data transformations in `src/components/bike-data.js`.
- Prefer updating build-time loaders (`*.json.js`) over duplicating parsing logic in pages.
- After changes to loaders or page logic, run:

```bash
npm run build
```

to validate the full site build.
