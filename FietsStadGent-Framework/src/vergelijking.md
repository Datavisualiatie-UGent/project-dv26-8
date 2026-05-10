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
    }
  }
);
const selectedLocations = Generators.input(selectLocations);
```

<div class="page">
  <section class="page-hero">
    <h2>Vergelijking</h2>
    <div class="page-hero-subtitle">Ruimte om later meerdere fietstelpalen naast elkaar te vergelijken.</div>
  </section>

  <section class="card card--detail">
    <article class="card card--detail">
      <h3>Selectie van telpalen</h3>
      ${selectLocations}
    </article>
    <article class="card card--detail">
      <h3>Vergelijkende grafieken</h3>
      ${resize((width) => drukte(normalizedMonthlyPerLocation.filter(d => selectedLocations.includes(d.code)), "Aantal fietsers", {width, height: 400}))}
    </article>
  </section>

  <section class="card card--detail">
    <h3>Voorbereiding</h3>
    <p class="section-copy">De pagina gebruikt dezelfde basisstijl als de andere onderdelen, zodat nieuwe visualisaties hier later meteen in passen.</p>
  </section>
</div>
