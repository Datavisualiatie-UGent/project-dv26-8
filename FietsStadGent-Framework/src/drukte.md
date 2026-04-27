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

<style>
  .drukte-page {
    display: grid;
    gap: 0.95rem;
    width: 100%;
    max-width: none;
    padding-top: 0.2rem;
  }

  .drukte-hero {
    border-radius: 14px;
    padding: 1rem 1.1rem;
    color: #ffffff;
    background: linear-gradient(135deg, #0f766e 0%, #0f172a 100%);
    box-shadow: 0 10px 26px rgba(15, 23, 42, 0.22);
  }

  .drukte-hero h2 {
    margin: 0;
    font-size: 1.35rem;
    line-height: 1.2;
  }

  .drukte-hero p {
    margin: 0.35rem 0 0;
    color: rgba(255, 255, 255, 0.9);
  }

  .drukte-card {
    border-radius: 12px;
    border: 1px solid #dbe7ef;
    background: #ffffff;
    padding: 0.82rem 0.9rem;
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
  }

  .drukte-card--with-controls {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }
</style>

```js
import * as Inputs from "@observablehq/inputs";
import { Generators } from "@observablehq/stdlib";

const data2 = await FileAttachment("data/monthlyPerLocation.json").json();

const locationInput = Inputs.select(
  data2.map(d => d.locatie),
  {
    label: "Locatie",
    value: data2[0].locatie
  }
);
const location = Generators.input(locationInput);

const selectedData = (location) => {
  return data2
    .find(d => d.locatie === location)?.months
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
    ${resize((width) => drukte(selectedData(location), "Aantal fietsers", {width, height: 400}))}
  </section>
</div>