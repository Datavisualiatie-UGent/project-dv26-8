---
toc: false
theme: dashboard
---

```js
import { drukte } from "./components/drukte.js";

// Load precomputed monthly averages
const data = await FileAttachment("data/monthlyAvg.json").json();

// Parse month strings back into Date objects
const parseMonth = (value) => {
  if (value == null) return null;
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw) return null;
  const month = new Date(value);
  return Number.isNaN(month.getTime()) ? null : month;
};

const parsed = data
  .map(d => ({
    ...d,
    month: parseMonth(d.month)
  }))
  .filter(d => d.month !== null && Number.isFinite(d.avg))
  .sort((a, b) => a.month - b.month);

```

```js
import * as Inputs from "@observablehq/inputs";
import { Generators } from "@observablehq/stdlib";

const data2 = await FileAttachment("data/monthlyPerLocation.json").json();

const locationInput = Inputs.select(
  data2.map(d => d.location),
  {
    label: "Locatie",
    value: data2[0].location
  }
);
const selectedLocation = Generators.input(locationInput);

const selectedData = (location) => {
  return data2
    .find(d => d.location === location)?.months
    .map(([month, value]) => ({
      month: parseMonth(month),
      avg: value
    }))
    .filter(d => d.month !== null && Number.isFinite(d.avg))
    .sort((a, b) => a.month - b.month) ?? [];
}
```

<div class="drukte-page">
  <section class="drukte-hero">
    <h2>Drukte</h2>
    <p>Maandelijkse trends van fietsers, globaal en per telpaal.</p>
  </section>

  <section class="drukte-card">
    ${resize((width) => drukte(parsed, "Gemiddelde fietsers", {width, height: 400}))}
  </section>

  <section class="drukte-card drukte-card--with-controls">
    ${locationInput}
    ${resize((width) => drukte(selectedData(selectedLocation), "Aantal fietsers", {width, height: 400}))}
  </section>
</div>