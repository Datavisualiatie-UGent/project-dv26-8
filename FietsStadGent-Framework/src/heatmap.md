---
toc: false
theme: dashboard
---

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

```js
import { heatmap } from "./components/heatmap.js";

const data = await FileAttachment("data/dailyAvg.json").json();

const parsed = data
.map(d => {
    const date = new Date(d.day);

    // start of year
    const start = new Date(date.getFullYear(), 0, 1);

    // Monday-based weekday (Mon=0, Sun=6)
    const weekdayIndex = (date.getDay() + 6) % 7;
    const startWeekday = (start.getDay() + 6) % 7;

    const dayOfYear = Math.floor((date - start) / (1000 * 60 * 60 * 24));

    // 🔑 key fix: include offset of first week
    const week = Math.floor((dayOfYear + startWeekday) / 7);

    return {
      day: date,
      value: d.avg,
      weekday: date.toLocaleString("nl-BE", { weekday: "short" }),
      month: date.toLocaleString("nl-BE", { month: "short" }),
      week: week,
    };
}).filter(d => d.day.getFullYear() === 2025);
console.log(parsed);
```

<div class="heatmap-page">
  <section class="heatmap-hero">
    <h2>Heatmap fietsdrukte</h2>
    <p>Fietsdrukte per weekdag en maand voor één jaar.</p>
  </section>

  <section class="heatmap-card heatmap-card--with-controls">
    ${resize((width) => heatmap(parsed, {width, height: 200}))}
  </section>
</div>
