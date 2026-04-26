---
title: Vega-Lite Starter
---

# Vega-Lite starter

```js
import embed from "npm:vega-embed";
```

```js
const bikeSummary = await FileAttachment("data/fietspalen.json").json();

const yearly = bikeSummary.yearlyTotals;
```

```js
const spec = {
  $schema: "https://vega.github.io/schema/vega-lite/v6.json",
  description: "Jaarlijkse totaaldrukte als Vega-Lite starter",
  height: 360,
  data: {values: yearly},
  mark: {type: "line", point: true, color: "#be123c"},
  encoding: {
    x: {field: "year", type: "ordinal", title: "Jaar"},
    y: {field: "total", type: "quantitative", title: "Totaal"},
    tooltip: [
      {field: "year", type: "ordinal", title: "Jaar"},
      {field: "total", type: "quantitative", title: "Totaal"}
    ]
  }
};
```

${resize(async (width) => {
  const container = document.createElement("div");
  const responsiveSpec = {...spec, width: Math.max(320, Math.floor(width))};
  await embed(container, responsiveSpec, {actions: false, renderer: "svg"});
  return container;
})}

Dit is een compacte declaratieve spec voor snel itereren met Vega-Lite en de echte fietsteldata.
