---
title: Vergelijking
toc: false
theme: dashboard
---

```js
import * as Inputs from "@observablehq/inputs";
import {Generators} from "@observablehq/stdlib";
import {drukteCompare as drukte} from "./components/drukteCompare.js";
import * as d3 from "d3";
import {getTrendDataForStation} from "./components/station_data.js";
import {getModeView, getYearColor, getYearsView} from "./components/trendlijn_helper.js";
import {trendLijnVergelijking} from "./components/trendlijn.js";
```

```js
const locations = await FileAttachment("data/locations.json").json();
const monthlyPerLocation = await FileAttachment("data/monthlyPerLocation.json").json();

const trendDict = {
  month: await FileAttachment("data/monthly.json").json(),
  day: await FileAttachment("data/weekly.json").json(),
  hour: await FileAttachment("data/hourly.json").json()
};

const locationByCode = new Map(locations.map((d) => [d.code, d]));
const totals = [...locations].sort((a, b) => b.total - a.total);
const totalCyclistsAll = totals.reduce((sum, d) => sum + d.total, 0);

const normalizedMonthlyPerLocation = d3.merge(
  monthlyPerLocation.map(d =>
    d.months.map(([date, value]) => ({
      code: d.code,
      location: d.location,
      month: new Date(date),
      avg: value
    }))
  )
)
.sort((a, b) => (b.avg - a.avg))
.sort((a, b) => a.month - b.month);

const selectLocations = Inputs.checkbox(
  locations
  .sort((a, b) => b.total - a.total)
  .map((d) => d.code),
  {
    value: ["GRO", "COU"],
    format: (value) => {
      const item = locationByCode.get(value);
      return item ? `${item.name} (${item.code})` : value;
    },
  }
);
const selectedLocations = Generators.input(selectLocations);

const verkeersprofielPlot = (location) => {
  const data = locationByCode.get(location);
  const totalLabel = data.total.toLocaleString("nl-BE");
  const rank = totals.findIndex(d => d.code === location) + 1;
  const rankLabel = `${rank} / ${totals.length}`;
  const share = (data.total / totalCyclistsAll) * 100;
  const shareLabel = `${share.toFixed(2)}%`;
  return html`
    <div class="pole-verkeersprofiel">
      <h4>${data.name} (${data.code})</h4>
      <div class="pole-metrics-vergelijking">
        <div class="metric">
          <p class="metric-label">Bouwjaar</p>
          <p class="metric-value">${data.buildYear}</p>
        </div>
        <div class="metric">
          <p class="metric-label">Totaal fietsers</p>
          <p class="metric-value">${totalLabel}</p>
        </div>
        <div class="metric">
          <p class="metric-label">Rang in Gent</p>
          <p class="metric-value">${rankLabel}</p>
        </div>
        <div class="metric">
          <p class="metric-label">Aandeel</p>
          <p class="metric-value">${shareLabel}</p>
        </div>
      </div>
    </div>`;
}


// Trend

const allAvailableYears = Array.from(
  new Set(trendDict.month.absoluut.global.data.map(d => Number(d.jaar)))
).sort((a, b) => b - a);

const selectLocationsTrend = Inputs.checkbox(
  locations.map((d) => d.code),
  {
    value: locations.slice(0, 2).map(d => d.code),
    format: (value) => {
      const item = locationByCode.get(value);
      return item ? `${item.name} (${item.code})` : value;
    },
  }
);

let prevValueTrend = selectLocationsTrend.value.slice();

selectLocationsTrend.addEventListener("input", () => {
  if (selectLocationsTrend.value.length > 5) {
    // Find which item was just added and remove it
    const added = selectLocationsTrend.value.find(item => !prevValueTrend.includes(item));
    if (added) {
      selectLocationsTrend.value = selectLocationsTrend.value.filter(item => item !== added);
    }
  }
  prevValueTrend = selectLocationsTrend.value.slice();
  selectLocationsTrend.dispatchEvent(new Event("input"));
});


const selectedCodesTrend = Generators.input(selectLocationsTrend);

const selectYearTrend = Inputs.select(allAvailableYears, {format: d => String(d), value: allAvailableYears[0]});
const selectedYearTrend = Generators.input(selectYearTrend);

const selectModeTrend = getModeView();
const selectedModeTrend = Generators.input(selectModeTrend);

```

```js
const combinedTrendData = selectedCodesTrend.flatMap(code => {
    const station = locationByCode.get(code);
    if (!station) return [];

    const stationData = getTrendDataForStation(trendDict, selectedModeTrend, "absoluut", station);
    
    return stationData
      .filter(d => Number(d.jaar) === Number(selectedYearTrend))
      .map(d => ({
        ...d,
        location: station.name 
      }));
});

const trendLocationOrder = selectedCodesTrend;

```

<div class="page">
  <section class="page-hero">
    <h2>Vergelijking van telpalen</h2>
    <div class="page-hero-subtitle">Leg meerdere fietstelpalen naast elkaar en ontdek verschillen in volume, spitspatronen, seizoensinvloed en routefunctie.</div>
  </section>

  <section class="card card--detail">
    <p class="section-copy">
      Op deze pagina kan je <strong>twee of meer fietstelpalen vergelijken</strong>. Dat is nuttig omdat een hoog totaalvolume niet alles zegt: sommige locaties zijn vooral druk tijdens de spits, andere volgen sterker het seizoen of liggen op een recreatieve verbinding. Door fietstelpalen naast elkaar te leggen zie je welke routes hetzelfde stedelijke ritme volgen en welke locaties een eigen profiel hebben.
    </p>
  </section>

  <section class="card card--detail">
      <h3>Interessante combinaties</h3>
      <ul class="chart-interpretation">
        <li><strong>Groendreef vs. Coupure Links</strong> - twee drukke kanaalroutes met hoge volumes</li>
        <li><strong>Louisa d'Havébrug vs. Marie Sassepad</strong> - twee fietstelpalen op de F400-fietssnelweg</li>
        <li><strong>Spoorwegbrug Drongen vs. Dampoort-Noord</strong> - buitenste ring vs. binnenste ring</li>
      </ul>
  </section>

  <section class="card card--detail">
    <h3>Selectie van telpalen</h3>
    <p class="section-copy">Selecteer hier de fietstelpalen die je wil vergelijken. De grafieken worden automatisch bijgewerkt op basis van je selectie.</p>
    <div class="pole-options">
      ${selectLocations}
    </div>
  </section>

  <details class="card card--collapsible" open>
    <summary class="ranking-header">
      <h3>Verkeersprofielen</h3>
      <span class="ranking-toggle">Open / sluit</span>
    </summary>
    <div class="collapsible-body">
      ${selectedLocations.map(location => verkeersprofielPlot(location))}
    </div>
  </details>

  <section class="card card--detail">
    <h3>Maandelijkse vergelijking</h3>
    <div class="chart-layout">
      <div class="chart-main">
    ${resize((width) => {
      if (selectedLocations.length === 0) {
        return html`<div class="empty-note">Selecteer minstens één fietstelpaal om de maandelijkse vergelijking te zien.</div>`;
      }
      const filteredData = normalizedMonthlyPerLocation.filter(d => selectedLocations.includes(d.code));
      return filteredData.length > 0
        ? drukte(filteredData, "Aantal fietsers", {width, height: 400})
        : html`<div class="empty-note">Geen data gevonden voor deze selectie.</div>`
    })}
      </div>
      <aside class="chart-insight">
        <p class="chart-insight-title">Interpretatie</p>
        <p class="chart-interpretation">De maandelijkse vergelijking toont of geselecteerde fietstelpalen hetzelfde seizoenspatroon volgen. Als alle balben samen stijgen en dalen, wijst dat op een gedeeld stadsbreed ritme. Als een locatie op andere momenten piekt, kan dat wijzen op een andere functie: pendelverkeer, schoolroutes, recreatief fietsverkeer of een specifieke verbinding.</p>
        <p class="chart-interpretation">Let ook op het schaalverschil. Een centrale route kan veel hogere aantallen halen, terwijl een kleinere fietstelpaal toch een duidelijk en stabiel patroon heeft. De vergelijking helpt dus om volume en gedrag apart te lezen.</p>
      </aside>
    </div>
  </section>

  <section class="card card--detail">
    <h3>Trendvergelijking</h3>
    <p class="text-muted">Vergelijk de tijdslijnen van verschillende fietstelpalen binnen één jaar.</p>
    <div class="controls-layout">
    <!-- LINKS -->
    <div class="control-block">
      <h3>Selectie van fietstelpalen</h3>
      <div class="pole-options">
        <div class="control-note">
          <strong>${selectedCodesTrend.length} / 5</strong> fietstelpalen geselecteerd
        </div>
        ${selectLocationsTrend}
      </div>
    </div>
    <!-- RECHTS -->
    <div 
      style="
        display: flex;
        gap: 1rem;
        align-items: flex-start;
        flex-wrap: wrap;
      ">
      <div class="control-block">
        <div class="control-label"><b>Jaar</b></div>
        ${selectYearTrend}
      </div>
      <div class="control-block">
        <div class="control-label"><b>Trend</b></div>
        ${selectModeTrend}
      </div>
    </div>
  </div>
    <div class="chart-layout">
      <div class="chart-main">
    ${resize((width) => {
      if (selectedCodesTrend.length === 0) {
        return html`<div class="empty-note">Selecteer minstens één fietstelpaal om de trendvergelijking te zien.</div>`;
      }
      return combinedTrendData.length > 0
        ? trendLijnVergelijking(
            combinedTrendData,
            selectedModeTrend,
            "Gemiddeld aantal fietsers",
            { width, height: 450 }
          )
        : html`<div class="empty-note">Geen data gevonden voor deze selectie.</div>`
    })}
      </div>
      <aside class="chart-insight">
        <p class="chart-insight-title">Interpretatie</p>
        <p class="chart-interpretation">De trendvergelijking laat zien welke fietstelpalen binnen hetzelfde jaar hetzelfde ritme volgen. In de maandweergave zie je seizoensinvloed, in de weekdagweergave het verschil tussen werkdagen en weekend, en in de uurweergave de ochtend- en avondspits.</p>
        <p class="chart-interpretation">Wanneer twee locaties parallel bewegen, hebben ze waarschijnlijk een gelijkaardige functie in het fietsnetwerk. Wanneer een lijn duidelijk afwijkt, is dat net interessant: zo ontdek je routes die sterker pendelgericht, recreatief of locatiegebonden zijn.</p>
      </aside>
    </div>
  </section>
</div>
