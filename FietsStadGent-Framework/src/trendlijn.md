---
toc: false
theme: dashboard
---


```js

import * as d3 from "d3";
import * as Inputs from "@observablehq/inputs";
import { Generators } from "@observablehq/stdlib";
import { getModeView, getYearsView, trendLijn } from "./components/trendlijn.js";

// Data
const dict = {
  month: await FileAttachment("data/monthlyWithYear.json").json(),
  weekday: await FileAttachment("data/weekdayPerLocation.json").json(),
  hourly: await FileAttachment("data/hourlyPerLocation.json").json()
};

const allYears = Array.from(new Set(
  Object.values(dict).flatMap(arr =>
    arr.flatMap(d =>
      (d.months ?? d.days ?? d.hours ?? []).map(v => v.jaar)
    )
    .filter(d => d !== undefined)
  )
));


// TODO: add a clear checkbox button, add year label to line color

// Global data
function selectedData(mode) {
  return dict[mode].flatMap(d => {
    if (mode === "weekday") return d.days;
    if (mode === "hourly") return d.hours;
    return d.months;
  });
}

const aggregateData = (mode, type = "mean") => {
  const data = selectedData(mode);

  const key =
    mode === "month" ? "month" :
    mode === "weekday" ? "day" :
    "hour";

  const reducer =
    type === "mean"
      ? v => d3.mean(v, d => d.value)
      : v => d3.sum(v, d => d.value);

  const grouped = d3.rollup(
    data,
    reducer,
    d => d.jaar,
    d => d[key]
  );

  return Array.from(grouped, ([jaar, level1]) =>
    Array.from(level1, ([x, value]) => ({
      jaar,
      [key]: x,
      value
    }))
  ).flat().sort((a, b) => a.jaar - b.jaar || a[key] - b[key]);
};


// Individual trend data

const locationView = Inputs.select(
  dict["month"].map(d => d.locatie),
  {
    value: dict["month"][0].locatie
  }
);

const selectedDataPerLocation = (loc, mode) => {
  const key =
    mode === "month" ? "month" :
    mode === "weekday" ? "day" :
    "hour";

  const data = dict[mode];
  const found = data.find(d => d.locatie === loc);
  if (!found) return [];

  let filtered = found.months;

  if (mode === "weekday") filtered = found.days;
  if (mode === "hourly") filtered = found.hours;

  return filtered.sort((a, b) => a.jaar - b.jaar || a[key] - b[key])
};

// Extra

// Global trend components
const modeView = getModeView();
const mode = Generators.input(modeView);

const yearCheckBox = getYearsView(allYears);
const years = Generators.input(yearCheckBox);


// Individual trend components
const location = Generators.input(locationView);

const modeViewIndividual = getModeView();
const modeIndividual = Generators.input(modeViewIndividual);

const yearCheckBoxIndividual = getYearsView(allYears);
const yearsIndividual = Generators.input(yearCheckBoxIndividual);

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

  .trendlijn-card {
    border-radius: 12px;
    border: 1px solid #dbe7ef;
    background: #ffffff;
    padding: 0.82rem 0.9rem;
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
  }

  .controls-vertical {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .control-block {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .control-label {
    font-size: 0.85rem;
    color: #374151; /* zacht grijs */
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
    <div class="controls-vertical">
      <div class="control-block">
        <div class="control-block">
          <div class="control-label">Trend</div>
          ${modeView}
        </div>
        <div class="control-block">
          <div class="control-label">Jaar</div>
          ${yearCheckBox}
        </div>
    </div>
  </section>
  <section class="trendlijn-card">
    ${resize((width) =>
      trendLijn(
        aggregateData(mode, "mean")
          .filter(d => years.includes(d.jaar)),
        mode,
        "Gemiddelde fietsers",
        { width, height: 400 }
      )
    )}
  </section>

  <section class="trendlijn-card">
    <div class="controls-vertical">
      <div class="control-block">
        <div class="control-label">Locatie</div>
          ${locationView}
        </div>
        <div class="control-block">
          <div class="control-label">Trend</div>
          ${modeViewIndividual}
        </div>
        <div class="control-block">
          <div class="control-label">Jaar</div>
          ${yearCheckBoxIndividual}
        </div>
    </div>
  </section>
  <section class="trendlijn-card">
    ${resize((width) =>
      trendLijn(
        selectedDataPerLocation(location, modeIndividual)
          .filter(d => yearsIndividual.includes(d.jaar)),
        modeIndividual,
        "Aantal fietsers",
        { width, height: 400 }
      )
  )}
  </section>

</div>