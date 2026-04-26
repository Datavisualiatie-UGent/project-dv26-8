---
title: Observable Plot Starter
theme: dashboard
---

# Observable Plot starter

```js
const bikeSummary = await FileAttachment("data/fietspalen.json").json();
```

```js
const yearlyTotals = bikeSummary.yearlyTotals;
```

```js
resize((width) => Plot.plot({
  title: "Totaal fietsverkeer per jaar",
  width,
  height: 360,
  y: {grid: true, label: "Totaal"},
  marks: [
    Plot.ruleY([0]),
    Plot.lineY(yearlyTotals, {x: "year", y: "total", stroke: "#0f766e", tip: true}),
    Plot.dot(yearlyTotals, {x: "year", y: "total", fill: "#0f766e", tip: true})
  ]
}))
```

Dit is een minimale, responsieve Plot-grafiek met de echte fietsteldata.
