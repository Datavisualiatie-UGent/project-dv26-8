# FietsStadGent Framework

Observable Framework app for the Datavisualisatie project.

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Start local development server:

```bash
npm run dev
```

3. Open <http://localhost:3000>.

## Installed visualisation libraries

- Observable Framework
- D3.js
- Observable Plot
- Vega
- Vega-Lite
- Vega Embed

## Command reference

| Command              | Description                                              |
| -------------------- | -------------------------------------------------------- |
| `npm install`        | Install or reinstall dependencies                        |
| `npm run dev`        | Start local preview server                               |
| `npm run build`      | Build your static site, generating `./dist`              |
| `npm run deploy`     | Deploy your app to Observable                            |
| `npm run clean`      | Clear the local data loader cache                        |
| `npm run observable` | Run commands like `observable help`                      |

## Project structure

```ini
.
├─ src
│  ├─ components
│  │  └─ timeline.js           # an importable module
│  ├─ data
│  │  ├─ launches.csv.js       # a data loader
│  │  └─ events.json           # a static data file
│  ├─ example-dashboard.md     # a page
│  ├─ example-report.md        # another page
│  ├─ visualisaties-plot.md    # Observable Plot starter
│  ├─ src/visualisaties-d3.md  # D3.js starter
│  ├─ visualisaties-vega-lite.md # Vega-Lite starter
│  └─ index.md                 # the home page
├─ .gitignore
├─ observablehq.config.js      # the app config file
├─ package.json
└─ README.md
```
