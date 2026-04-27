# Drukte 


```js
import { drukte } from "./components/drukte.js";

// Load precomputed monthly averages
const data = await FileAttachment("data/monthlyAvg.json").json();

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
import * as Inputs from "@observablehq/inputs";
import { Generators } from "@observablehq/stdlib";

const data2 = await FileAttachment("data/monthlyPerLocation.json").json();
console.log(data2);

const locationInput = Inputs.select(
  data2.map(d => d.locatie),
  {
    label: "Locatie",
    value: data2[0].locatie
  }
);
const location = Generators.input(locationInput);

const selectedData = (location) => {
    return data2
  .find(d => d.locatie === location)?.months
  .map(([month, value]) => ({
    month: new Date(month),
    avg: value
  }))
  .sort((a, b) => a.month - b.month) ?? [];
}
```

<div class="grid grid-cols-1">
    <div class="card" style="display: flex; flex-direction: column; gap: 1rem;"> 
        ${locationInput}
        ${resize((width) => drukte(selectedData(location), "Drukte", {width, height: 400}))} 
    </div> 
</div>