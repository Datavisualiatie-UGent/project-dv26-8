---
title: Vergelijking
toc: false
theme: dashboard
---

```js
import * as Inputs from "@observablehq/inputs";
import {Generators} from "@observablehq/stdlib";
import {drukte} from "./components/drukteCompare.js";
import * as d3 from "d3";
```

```js
const locations = await FileAttachment("data/locations.json").json();
const monthlyPerLocation = await FileAttachment("data/monthlyPerLocation.json").json();

const locationByCode = new Map(locations.map((d) => [d.code, d]));
const totals = [...locations].sort((a, b) => b.total - a.total);
const totalCyclistsAll = totals.reduce((sum, d) => sum + d.total, 0);

const normalizedMonthlyPerLocation = d3.merge(
  monthlyPerLocation.map(d =>
    d.months.map(([date, value]) => ({
      code: d.code,
      location: d.location,
      month: new Date(date),
      avg: value
    }))
  )
)
// .sort((a, b) => (b.avg - a.avg))
.sort((a, b) => a.month - b.month);

const selectLocations = Inputs.checkbox(
  locations.map((d) => d.code),
  {
    value: locations.slice(0, 2).map(d => d.code),
    format: (value) => {
      const item = locationByCode.get(value);
      return item ? `${item.name} (${item.code})` : value;
    },
  }
);
const selectedLocations = Generators.input(selectLocations);

const verkeersprofielPlot = (location) => {
  const data = locationByCode.get(location);
  const totalLabel = data.total.toLocaleString("nl-BE");
  const rank = totals.findIndex(d => d.code === location) + 1;
  const rankLabel = `${rank} / ${totals.length}`;
  const share = (data.total / totalCyclistsAll) * 100;
  const shareLabel = `${share.toFixed(2)}%`;
  return html`
    <div class="pole-verkeersprofiel">
      <h4>${data.name} (${data.code})</h4>
      <div class="pole-metrics-vergelijking">
        <div class="metric">
          <p class="metric-label">Bouwjaar</p>
          <p class="metric-value">${data.buildYear}</p>
        </div>
        <div class="metric">
          <p class="metric-label">Totaal fietsers</p>
          <p class="metric-value">${totalLabel}</p>
        </div>
        <div class="metric">
          <p class="metric-label">Rang in Gent</p>
          <p class="metric-value">${rankLabel}</p>
        </div>
        <div class="metric">
          <p class="metric-label">Aandeel</p>
          <p class="metric-value">${shareLabel}</p>
        </div>
      </div>
    </div>`;
}
```

<div class="page">
  <section class="page-hero">
    <h2>Vergelijking</h2>
    <div class="page-hero-subtitle">Ruimte om later meerdere fietstelpalen naast elkaar te vergelijken.</div>
  </section>

  <section class="card card--detail">
    <h3>Selectie van telpalen</h3>
    <div class="pole-options">
      ${selectLocations}
    </div>
  </section>

  <section class="card card--detail">
    <h3>Verkeersprofielen</h3>
    ${selectedLocations.map(location => verkeersprofielPlot(location))}
  </section>

  <section class="card card--detail">
    <h3>Vergelijkende grafieken</h3>
    ${resize((width) => drukte(normalizedMonthlyPerLocation.filter(d => selectedLocations.includes(d.code)), "Aantal fietsers", {width, height: 400}))}
  </section>
</div>
