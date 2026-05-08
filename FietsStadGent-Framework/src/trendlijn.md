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
  month: await FileAttachment("data/monthly.json").json(),
  weekday: await FileAttachment("data/weekly.json").json(),
  hourly: await FileAttachment("data/hourly.json").json()
};


console.log(dict["hourly"]);

const allYears = Array.from(new Set(
  Object.values(dict).flatMap(d =>
    d.absoluut.global.data.map(v => v.jaar)
  )
));

// TODO: add a clear checkbox button, add year label to line color + remove duplicates

// Global data
function selectData(mode, variant, loc = null, type = "global") {
  const dataset = dict[mode][variant];

  let data;

  if (type === "global") {
    data = dataset.global.data;
  } else {
    const found = dataset.perLocation.find(d => d.locatie === loc);
    data = found ? found.data : [];
  }

  const key =
    mode === "month" ? "month" :
    mode === "weekday" ? "day" :
    "hour";

  return data.sort((a, b) =>
    a.jaar - b.jaar || a[key] - b[key]
  );
}

const modeView = getModeView();
const mode = Generators.input(modeView);

const yearCheckBox = getYearsView(allYears);
const years = Generators.input(yearCheckBox);

const typeView = Inputs.radio(["absoluut", "relatief"], { value: "absoluut" });
const type = Generators.input(typeView);

const locationView = Inputs.select(
  dict["month"].absoluut.perLocation.map(d => d.locatie),
  {
    value: dict["month"].absoluut.perLocation[0].locatie,
  }
);
const location = Generators.input(locationView);

const modeViewLocation = getModeView();
const modeLocation = Generators.input(modeViewLocation);

const yearCheckBoxLocation = getYearsView(allYears);
const yearsLocation = Generators.input(yearCheckBoxLocation);

const typeViewLocation = Inputs.radio(["absoluut", "relatief"], { value: "absoluut" });
const typeLocation = Generators.input(typeViewLocation);

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
    color: #374151;
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
        <div class="control-label">Trend</div>
        ${modeView}
      </div>
      <div class="control-block">
        <div class="control-label">Jaar</div>
        ${yearCheckBox}
      </div>
      <div class="control-block">
        <div class="control-label">Type</div>
        ${typeView}
      </div>
    </div>
  </section>
  <section class="trendlijn-card">
    ${resize((width) =>
      trendLijn(
        selectData(mode, type, null, "global")
          .filter(d => years.includes(d.jaar)),
        mode,
        type === "absoluut" ? "Aantal fietsers" : "Procentuele verandering t.o.v. 2020",
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
        ${modeViewLocation}
      </div>
      <div class="control-block">
        <div class="control-label">Jaar</div>
        ${yearCheckBoxLocation}
      </div>
      <div class="control-block">
        <div class="control-label">Type</div>
        ${typeViewLocation}
      </div>
    </div>
  </section>
  <section class="trendlijn-card">
    ${resize((width) =>
      trendLijn(
        selectData(modeLocation, typeLocation, location, "perLocation")
          .filter(d => yearsLocation.includes(d.jaar)),
        modeLocation,
        type === "absoluut" ? "Aantal fietsers" : "Procentuele verandering t.o.v. 2020",
        { width, height: 400, isPerLocation: true }
      )
    )}
  </section>
</div>
