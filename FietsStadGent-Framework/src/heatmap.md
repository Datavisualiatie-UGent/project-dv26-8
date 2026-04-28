---
toc: false
theme: dashboard
---

```js
import { heatmap } from "./components/heatmap.js";
import * as Inputs from "@observablehq/inputs";
import { Generators } from "@observablehq/stdlib";

const rows = await FileAttachment("data/data_fietspalen.csv").csv();

const years = Array.from(
  new Set(
    rows
      .map(d => {
        const date = new Date(d.datum);
        return Number.isFinite(date.getTime()) ? date.getUTCFullYear() : null;
      })
      .filter(Number.isFinite)
  )
).sort((a, b) => a - b);

const yearInput = Inputs.select(years.map(String), {
  label: "Jaar",
  value: years.length ? String(years[0]) : ""
});

const year = Generators.input(yearInput);
```

<style>
  .heatmap-page {
    display: grid;
    gap: 0.95rem;
    width: 100%;
    max-width: none;
    padding-top: 0.2rem;
  }

  .heatmap-hero {
    border-radius: 14px;
    padding: 1rem 1.1rem;
    color: #ffffff;
    background: linear-gradient(135deg, #0f766e 0%, #0f172a 100%);
    box-shadow: 0 10px 26px rgba(15, 23, 42, 0.22);
  }

  .heatmap-hero h2 {
    margin: 0;
    font-size: 1.35rem;
    line-height: 1.2;
  }

  .heatmap-hero p {
    margin: 0.35rem 0 0;
    color: rgba(255, 255, 255, 0.9);
  }

  .heatmap-card {
    border-radius: 12px;
    border: 1px solid #dbe7ef;
    background: #ffffff;
    padding: 0.82rem 0.9rem;
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
  }

  .heatmap-card--with-controls {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }
</style>

<div class="heatmap-page">
  <section class="heatmap-hero">
    <h2>Heatmap fietsdrukte</h2>
    <p>Fietsdrukte per weekdag en maand voor één jaar.</p>
  </section>

  <section class="heatmap-card heatmap-card--with-controls">
    ${yearInput}
    ${resize((width) => heatmap(rows, Number(year), {width, height: 520}))}
  </section>
</div>
