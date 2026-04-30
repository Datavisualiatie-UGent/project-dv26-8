# 📦 Using the Data in Observable Framework

Import the loader:

```js
import { loadForChart, loadDataset } from "../lib/dataLoader.js";
```

Auto‑select based on chart type

```js
const data = await loadForChart("timeseries");
```

Load a specific dataset

```js
const data = await loadDataset("month");
```

## Example chart

```js
import { loadForChart } from "../lib/dataLoader.js";

const data = await loadForChart("timeseries");

Plot.plot({
  marks: [
    Plot.line(data, { x: "DatumISO", y: "Totaal", stroke: "Code" })
  ]
})
```