---
toc: false
theme: dashboard
---

```js
import { heatmap } from "./components/heatmap.js";
import * as d3 from "npm:d3";
import * as Inputs from "@observablehq/inputs";
import { Generators } from "@observablehq/stdlib";

const data = await FileAttachment("data/dailyAvg.json").json();

const years = [...new Set(data.map(d => new Date(d.day).getFullYear()))].sort();
const yearInput = Inputs.checkbox(years, {label: "Selecteer jaren", value: [2025], format: x => x.toString()});
const selectedYears = Generators.input(yearInput);

const parsed = data
.map(d => {
    const date = new Date(d.day);

    // start of year
    const start = d3.timeYear(date);

    // Monday-based week count
    let week = d3.timeWeek.count(start, date);

    const weekday = date.toLocaleString("nl-BE", { weekday: "short" });
    const month = date.toLocaleString("nl-BE", { month: "short" });

    // Shift Sundays to the previous week
    if (weekday === "zo") week -= 1;

    return {
      day: date,
      value: d.avg,
      weekday: weekday,
      month: month,
      week: week,
    };
});

const valueDomain = d3.extent(parsed, d => d.value);
```

<div class="page">
  <section class="page-hero">
    <h2>Heatmap fietsdrukte</h2>
    <div class="page-hero-subtitle">
      <p>Fietsdrukte per weekdag en maand voor één jaar.</p>
    </div>
  </section>

  <section class="card">
    ${yearInput}
    ${selectedYears.map(year => heatmap(parsed.filter(d => d.day.getFullYear() === year), year, {width, height: 200, colorDomain: valueDomain}))}
  </section>
</div>
