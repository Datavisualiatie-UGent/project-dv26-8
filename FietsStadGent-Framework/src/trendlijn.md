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
    d.normal.global.data.map(v => v.jaar)
  )
));

// TODO: add a clear checkbox button, add year label to line color + remove duplicates

// Global data
function selectData(mode, type, loc = "", variant = "normal") {
  const dataset = dict[mode][variant];

  let data;

  if (type === "globaal") {
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

// Global trend components
const modeView = getModeView();
const mode = Generators.input(modeView);

const yearCheckBox = getYearsView(allYears);
const years = Generators.input(yearCheckBox);

const typeView = Inputs.radio(["globaal", "telpaal"], {value: "globaal"})
const type = Generators.input(typeView);

// Individual trend components
const locationView = Inputs.select(
  dict["month"].normal.perLocation.map(d => d.locatie),
  {
    value: dict["month"].normal.perLocation[0].locatie,
  }
);

locationView.querySelector("select").disabled =
  typeView.value === "globaal";

typeView.addEventListener("input", () => {
  locationView.querySelector("select").disabled =
    typeView.value === "globaal";
});

const location = Generators.input(locationView);

const modeViewIndividual = getModeView();
const modeIndividual = Generators.input(modeViewIndividual);

const yearCheckBoxIndividual = getYearsView(allYears);
const yearsIndividual = Generators.input(yearCheckBoxIndividual);

// Idem maar voor pct

const modeViewPct = getModeView();
const modePct = Generators.input(modeView);

const yearCheckBoxPct = getYearsView(allYears);
const yearsPct = Generators.input(yearCheckBoxPct);

const typeViewPct = Inputs.radio(["globaal", "telpaal"], {value: "globaal"})
const typePct = Generators.input(typeViewPct);

// Individual trend components
const locationViewPct = Inputs.select(
  dict["month"].normal.perLocation.map(d => d.locatie),
  {
    value: dict["month"].normal.perLocation[0].locatie,
  }
);

locationViewPct.querySelector("select").disabled =
  typeViewPct.value === "globaal";

typeViewPct.addEventListener("input", () => {
  locationViewPct.querySelector("select").disabled =
    typeViewPct.value === "globaal";
});

const locationPct = Generators.input(locationViewPct);

const modeViewIndividualPct = getModeView();
const modeIndividualPct = Generators.input(modeViewIndividualPct);

const yearCheckBoxIndividualPct = getYearsView(allYears);
const yearsIndividualPct = Generators.input(yearCheckBoxIndividualPct);

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
        <div class="control-label">Locatie</div>
        ${locationView}
      </div>
      <div class="control-block">
        <div class="control-label">Trend</div>
        ${modeView}
      </div>
      <div class="control-block">
        <div class="control-label">Jaar</div>
        ${yearCheckBox}
      </div>
      <div class="control-block">
        <div class="control-label">type</div>
        ${typeView}
      </div>
    </div>
  </section>
  <section class="trendlijn-card">
    ${resize((width) =>
      trendLijn(
        selectData(mode, type, location, "normal")
          .filter(d => years.includes(d.jaar)),
        mode,
        "Aantal fietsers",
        { width, height: 400 }
      )
    )}
  </section>
  
  <section class="trendlijn-card">
    <div class="controls-vertical">
      <div class="control-block">
        <div class="control-label">Locatie</div>
        ${locationViewPct}
      </div>
      <div class="control-block">
        <div class="control-label">Trend</div>
        ${modeView}
      </div>
      <div class="control-block">
        <div class="control-label">Jaar</div>
        ${yearCheckBoxPct}
      </div>
      <div class="control-block">
        <div class="control-label">type</div>
        ${typeViewPct}
      </div>
    </div>
  </section>
  <section class="trendlijn-card">
    ${resize((width) =>
      trendLijn(
        selectData(modePct, typePct, locationPct, "pct")
          .filter(d => yearsPct.includes(d.jaar)),
        modePct,
        "Procentuele verandering t.o.v. 2020",
        { width, height: 400, isPct: true }
      )
    )}
  </section>
</div>