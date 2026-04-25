# Drukte 


```js
import * as d3 from "d3";
import { drukte } from "./components/drukte.js";

// Load precomputed monthly averages
const data = await FileAttachment("./data/monthlyAvg.json").json();

// Parse month strings back into Date objects
const parsed = data.map(d => ({
  ...d,
  month: new Date(d.month)
})).sort((a, b) => a.month - b.month);

```

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => drukte(parsed, "Gemiddelde fietsers", {width, height: 400}))}
  </div>
</div>

```js
import { Inputs } from "@observablehq/inputs";

const data2 = await FileAttachment("./data/monthlyPerLocation.json").json();

viewof selectedLocation = Inputs.select(
  data2.map(d => d.locatie),
  {
    label: "Locatie",
    value: data2[0].locatie
  }
);

const selectedData = (() => {
  const loc = data2.find(d => d.locatie === selectedLocation);
  return loc ? loc.months
    .map(([month, value]) => ({
      month: new Date(month),
      avg: value
    }))
    .sort((a, b) => a.month - b.month) : [];
})();
```

<div class="grid grid-cols-1">
    <div class="card"> 
        ${resize((width) => drukte(selectedData, "Drukte", {width, height: 400}))} 
    </div> 
</div>