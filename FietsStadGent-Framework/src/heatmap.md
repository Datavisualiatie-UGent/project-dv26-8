---
toc: false
theme: dashboard
---

```js
import { heatmap } from "./components/heatmap.js";
import * as d3 from "npm:d3";

const data = await FileAttachment("data/dailyAvg.json").json();

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
}).filter(d => d.day.getFullYear() === 2021).sort((a, b) => a.day - b.day);
```

<div class="page">
  <section class="page-hero">
    <h2>Heatmap fietsdrukte</h2>
    <div class="page-hero-subtitle">
      <p>Fietsdrukte per weekdag en maand voor één jaar.</p>
    </div>
  </section>

  <section class="card card--chart card--with-controls">
    ${resize((width) => heatmap(parsed, 2025, {width, height: 200}))}
  </section>
</div>
