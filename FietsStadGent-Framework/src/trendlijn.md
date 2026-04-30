---
toc: false
theme: dashboard
---


```js

import * as Inputs from "@observablehq/inputs";
import { Generators } from "@observablehq/stdlib";

import { getModeView, getYearsView, trendLijn } from "./components/trendlijn.js";

const data = await FileAttachment("data/hourlyPerLocation.json").json();


// TODO: add a clear checkbox button, add year label to line color

// Global trend data
const allData = data.flatMap(d =>
  d.months.map(([month, hour, value]) => ({
    month: new Date(month).getMonth(),
    year: new Date(month).getFullYear(),
    hour: new Date(hour),
    value
  }))
);

const averaged = Array.from(
  d3.rollup(
    allData,
    v => d3.mean(v, d => d.value),
    d => d.year,
    d => d.month,
    d => d.hour
  ),
  ([year, months]) =>
    Array.from(months, ([month, hour, value]) => ({
      year,
      month,
      hour,
      value
    }))
).flat();


// Individual trend data

const locationView = Inputs.select(
  data.map(d => d.locatie),
  {
    label: "Locatie",
    value: data[0].locatie
  }
);

const selectedData = (loc) => {
  const found = data.find(d => d.locatie === loc);
  if (!found) return [];

  const filtered = found.months.map(([month, hour, value]) => ({
    month: new Date(month).getMonth(),
    value,
    year: new Date(month).getFullYear()
  }));

  return filtered;
}

// Extra

// Global trend components
const yearCheckBox = getYearsView(allData);
const years = Generators.input(yearCheckBox);

const modeView = getModeView();
const mode = Generators.input(modeView);

// Individual trend components
const location = Generators.input(locationView);

const yearCheckBox2 = getYearsView(allData);
const years2 = Generators.input(yearCheckBox2);

const modeView2 = getModeView();
const mode2 = Generators.input(modeView2);
```

<style>
  .trendlijn-page {
    display: grid;
    gap: 0.95rem;
    width: 100%;
    max-width: none;
    padding-top: 0.2rem;
  }

  .trendlijn-hero {
    border-radius: 14px;
    padding: 1rem 1.1rem;
    color: #ffffff;
    background: linear-gradient(135deg, #0f766e 0%, #0f172a 100%);
    box-shadow: 0 10px 26px rgba(15, 23, 42, 0.22);
  }

  .trendlijn-hero h2 {
    margin: 0;
    font-size: 1.35rem;
    line-height: 1.2;
  }

  .trendlijn-hero p {
    margin: 0.35rem 0 0;
    color: rgba(255, 255, 255, 0.9);
  }

  .trendlijn-controls {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .trendlijn-controls > div {
    flex: 1;
    min-width: 220px;
  }

  .trendlijn-card {
    width: 100%;
    border-radius: 12px;
    border: 1px solid #dbe7ef;
    background: #ffffff;
    padding: 0.82rem 0.9rem;
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
  }

  .trendlijn-card--individual {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  label {
    color: grey;
  }

  .plot-tip {
    background: white;
    color: #111827;
    border: 1px solid #e5e7eb;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
    font-size: 12px;
  }

  .plot-tip text {
    fill: #111827;
  }

</style>

<div class="trendlijn-page">
  <section class="trendlijn-hero">
    <h2>Trend</h2>
    <p>Fietsers aan fietspalen doorheen de tijd.</p>
  </section>

  <section class="trendlijn-card">
    <div class="trendlijn-controls">
      <div>${yearCheckBox}</div>
      <div>${modeView}</div>
    </div>
    ${resize((width) =>
      trendLijn(
        averaged.filter(d => years.includes(d.year)),
        "Maand",
        "Gemiddelde fietsers",
        { width, height: 400 }
      )
    )}
  </section>

  <section class="trendlijn-card trendlijn-card--individual">
    <div class="trendlijn-controls">
      <div>${yearCheckBox2}</div>
      <div>${locationView}</div>
      <div>${modeView2}</div>
    </div>
    ${resize((width) =>
      trendLijn(
        selectedData(location).filter(d => years2.includes(d.year)).sort((a, b) => a.month - b.month),
        "Maand",
        "Aantal fietsers",
        { width, height: 400 }
      )
  )}
  </section>

</div>