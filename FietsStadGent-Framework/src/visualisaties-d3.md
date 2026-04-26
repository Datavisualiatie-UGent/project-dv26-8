---
title: D3 Starter
theme: dashboard
---

# D3.js starter

```js
import * as d3 from "npm:d3";
```

```js
const bikeSummary = await FileAttachment("data/fietspalen.json").json();
const locaties = await FileAttachment("data/locaties.json").json();
const yearly = bikeSummary.yearlyTotals;
const topLocations = bikeSummary.topLocations;
```

```js
resize((width) => {
  const height = 360;
  const margin = {top: 20, right: 20, bottom: 40, left: 50};

  const x = d3
    .scaleLinear()
    .domain(d3.extent(yearly, (d) => d.year))
    .range([margin.left, width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(yearly, (d) => d.total)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const line = d3
    .line()
    .x((d) => x(d.year))
    .y((d) => y(d.total));

  const svg = d3
    .create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .attr("style", "max-width: 100%; height: auto; background: white;");

  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  svg
    .append("path")
    .datum(yearly)
    .attr("fill", "none")
    .attr("stroke", "#1d4ed8")
    .attr("stroke-width", 2)
    .attr("d", line);

  return svg.node();
})
```

```js
resize((width) => {
  const height = 360;
  const margin = {top: 20, right: 20, bottom: 60, left: 180};

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(topLocations, (d) => d.total)])
    .nice()
    .range([margin.left, width - margin.right]);

  const y = d3
    .scaleBand()
    .domain(topLocations.map((d) => d.location).reverse())
    .range([height - margin.bottom, margin.top])
    .padding(0.2);

  const svg = d3
    .create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .attr("style", "max-width: 100%; height: auto;");

  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(width / 100));

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  svg
    .append("g")
    .attr("fill", "#0f766e")
    .selectAll("rect")
    .data(topLocations)
    .join("rect")
    .attr("x", margin.left)
    .attr("y", (d) => y(d.location))
    .attr("width", (d) => x(d.total) - margin.left)
    .attr("height", y.bandwidth());

  return svg.node();
})
```

Dit is een basis D3-lijnchart plus top-locaties overzicht met de echte fietsteldata.
