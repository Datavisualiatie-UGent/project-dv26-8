---
toc: false
theme: dashboard
---

```js
import { heatmap } from "./components/heatmap.js";
import * as d3 from "npm:d3";
import * as Inputs from "@observablehq/inputs";
import { Generators } from "@observablehq/stdlib";

function processBikeData(day, value) {
      const date = new Date(day);

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
        value: value,
        weekday: weekday,
        month: month,
        week: week,
      };
}

const rawData = await FileAttachment("data/dailyAvg.json").json();
const rawDataAllYears = d3.rollup(
  rawData,
  v => d3.mean(v, d => d.avg),
  d => {
    const date = new Date(d.day);
    return `${date.getMonth()}-${date.getDate()}`;
  }
);
const data = rawData.map(d => processBikeData(d.day, d.avg));
const dataAllYears = Array.from(rawDataAllYears, ([day, value]) => {
  const [month, date] = day.split("-").map(Number);
  return processBikeData(new Date(2024, month, date), value);
});

const years = [...new Set(data.map(d => d.day.getFullYear()))].sort().concat("Alle jaren");
const yearInput = Inputs.checkbox(years, {label: "Selecteer jaren", value: [2025], format: x => x.toString()});
const selectedYears = Generators.input(yearInput);

const valueDomain = d3.extent(data, d => d.value);


const selectedData = (year) => {
  if (year === "Alle jaren") {
    return dataAllYears;
  }
  return data.filter(d => d.day.getFullYear() === year);
};
```

```js
const rawData2 = await FileAttachment("data/dailyPerLocation.json").json();
const rawDataAllYears2 = d3.rollup(
  rawData2.flatMap(d => d.days.map(day => ({location: d.location, day: day[0], value: day[1]}))),
  v => d3.mean(v, d => d.value),
  d => `${d.location}/${new Date(d.day).getMonth()}/${new Date(d.day).getDate()}`
);
const data2 = rawData2.map(d => ({location: d.location, data: d.days.map(day => processBikeData(day[0], day[1]))}));
const dataAllYears2 = Array.from(rawDataAllYears2, ([key, value]) => {
  const [location, month, date] = key.split("/").map((x, i) => i === 0 ? x : Number(x));
  return {location, data: processBikeData(new Date(2024, month, date), value)};
});

const locationInput = Inputs.select(
  data2.map(d => d.location),
  {
    label: "Locatie",
    value: data2[0].location
  }
);
const selectedLocation = Generators.input(locationInput);

const yearInput2 = Inputs.checkbox(years, {
  label: "Selecteer jaren",
  format: x => x.toString()
});
const selectedYears2 = Generators.input(yearInput2);
const valueDomain2 = d3.extent(data2.flatMap(d => d.data), d => d.value);

const selectedData2 = (location, year) => {
  if (year === "Alle jaren") return dataAllYears2.filter(d => d.location === location).map(d => d.data);
  return data2.find(d => d.location === location).data.filter(d => d.day.getFullYear() === year);
};
```

<div class="page">
  <section class="page-hero">
    <h2>Heatmap fietsdrukte</h2>
    <div class="page-hero-subtitle">
      <p>Fietsdrukte per dag voor de geselecteerde jaren.</p>
    </div>
  </section>

  <section class="card">
    ${yearInput}
    ${selectedYears.map(year => heatmap(selectedData(year), year !== "Alle jaren" ? year : undefined, "gemiddeld aantal fietsers", {width, height: 200, colorDomain: valueDomain}))}
  </section>
  
  <section class="card">
    ${locationInput}
    ${yearInput2}
    ${selectedYears2.map(year => heatmap(selectedData2(selectedLocation, year), year !== "Alle jaren" ? year : undefined, "aantal fietsers", {width, height: 200, colorDomain: valueDomain2}))}
  </section>
</div>
