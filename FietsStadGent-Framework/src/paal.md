---
title: Telpaal Detail
toc: false
theme: dashboard
---

```js
import {html} from "npm:htl";
import * as Inputs from "@observablehq/inputs";
import {Generators} from "@observablehq/stdlib";
import {drukte} from "./components/drukte.js";
import {heatmap} from "./components/heatmap.js";
import {trendLijn} from "./components/trendlijn.js";
import {getModeView, getYearsView} from "./components/trendlijn_helper.js";
import {collectTrendYearsForStation, getDailyDataForStation, getMonthlyDataForStation, getTrendDataForStation, parseMonth, processBikeData} from "./components/station_data.js";
import * as d3 from "npm:d3";

const locations = await FileAttachment("data/locations.json").json();
const monthlyPerLocation = await FileAttachment("data/monthlyPerLocation.json").json();
const dailyPerLocation = await FileAttachment("data/dailyPerLocation.json").json();

// Trendline data
const trendDict = {
  month: await FileAttachment("data/monthly.json").json(),
  day: await FileAttachment("data/weekly.json").json(),
  hour: await FileAttachment("data/hourly.json").json()
};

const params = new URLSearchParams(location.search);
const requestedCode = params.get("code");

const locationByCode = new Map(locations.map((d) => [d.code, d]));
const fallbackCode = locations[0]?.code ?? null;
const code = requestedCode && locationByCode.has(requestedCode) ? requestedCode : fallbackCode;

const totals = [...locations].sort((a, b) => b.total - a.total);
const totalCyclistsAll = totals.reduce((sum, d) => sum + d.total, 0);

const station = code ? locationByCode.get(code) : null;
const rank = code ? totals.findIndex((d) => d.code === code) + 1 : 0;
const stationCount = totals.length;
const share = station && totalCyclistsAll > 0 ? (station.total / totalCyclistsAll) * 100 : null;

const hasCoordinates = station && Number.isFinite(station.lat) && Number.isFinite(station.long);
const buildYear = Number.isFinite(station?.buildYear) ? String(Math.trunc(station.buildYear)) : "Onbekend";
const startDate = station?.startDate || "Onbekend";
const owner = station?.owner || "Onbekend";
const totalLabel = station ? station.total.toLocaleString("nl-BE") : "-";
const rankLabel = station && rank > 0 ? `${rank} / ${stationCount}` : "-";
const shareLabel = share != null ? `${share.toFixed(2)}%` : "-";
const osmHref = hasCoordinates
  ? `https://www.openstreetmap.org/?mlat=${station.lat}&mlon=${station.long}#map=17/${station.lat}/${station.long}`
  : null;

function monthlyDataForStation(station) {
  if (!station) return [];
  return getMonthlyDataForStation(monthlyPerLocation, station)
    .map((d) => ({
      month: parseMonth(d.month),
      avg: d.avg
    }))
    .filter((d) => d.month !== null && Number.isFinite(d.avg));
}

const stationMonthlyData = monthlyDataForStation(station);

function dailyDataForStation(station) {
  if (!station) return [];
  return getDailyDataForStation(dailyPerLocation, station)
    .filter((d) => !Number.isNaN(d.day.getTime()) && Number.isFinite(d.value));
}

function dailyAllYearsData(data) {
  const rolled = d3.rollup(
    data,
    (values) => d3.mean(values, (d) => d.value),
    (d) => `${d.day.getMonth()}-${d.day.getDate()}`
  );

  return Array.from(rolled, ([day, value]) => {
    const [month, date] = day.split("-").map(Number);
    return processBikeData(new Date(2024, month, date), value);
  });
}

const stationDailyData = dailyDataForStation(station);
const stationDailyAllYearsData = dailyAllYearsData(stationDailyData);
const stationHeatmapYears = [...new Set(stationDailyData.map((d) => d.day.getFullYear()))].sort().concat("Alle jaren");
const stationHeatmapYearInput = Inputs.checkbox(stationHeatmapYears, {
  label: "Selecteer jaren",
  value: stationHeatmapYears.includes(2025) ? [2025] : stationHeatmapYears.slice(0, 1),
  format: (value) => value.toString()
});
const selectedStationHeatmapYears = Generators.input(stationHeatmapYearInput);
const stationHeatmapValueDomain = d3.extent(stationDailyData, (d) => d.value);

const selectedStationHeatmapData = (year) => {
  if (year === "Alle jaren") return stationDailyAllYearsData;
  return stationDailyData.filter((d) => d.day.getFullYear() === year);
};

const stationTrendYears = collectTrendYearsForStation(trendDict, station);

// Fall back to global years if none found for this station
const trendAllYears = stationTrendYears.length > 0
  ? stationTrendYears
  : Array.from(new Set(
      Object.values(trendDict).flatMap(d =>
        d.absoluut.global.data.map(v => v.jaar)
      )
    ));

const poleInput = Inputs.select(
  totals.map((d) => d.code),
  {
    label: html`<span class="pole-input-label">Verander van telpaal</span>`,
    value: code,
    format: (value) => {
      const item = locationByCode.get(value);
      return item ? `${item.name} (${item.code})` : value;
    }
  }
);

poleInput.addEventListener("input", () => {
  const nextCode = poleInput.value;
  if (nextCode && nextCode !== code) {
    location.href = `./paal?code=${encodeURIComponent(nextCode)}`;
  }
});

function stationMonthlyChart(data, {width, height = 400} = {}) {
  const card = document.createElement("div");
  card.className = "card card--chart card--with-controls";

  const header = html`<div class="chart-header">
    <div>
      <h3>Maandelijkse drukte</h3>
      <p>Fietsers per maand voor deze telpaal. Seizoenspatroon en groeitrend zichtbaar.</p>
    </div>
  </div>`;

  const seasonInput = Inputs.toggle({
    label: "Seizoenen tonen",
    value: false
  });

  const plotContainer = document.createElement("div");
  plotContainer.className = "chart-main";

  function renderChart() {
    plotContainer.replaceChildren(
      data.length
        ? drukte(data, "Aantal fietsers", seasonInput.value, {width, height})
        : html`<p class="empty-note">Voor deze telpaal is geen maanddata gevonden.</p>`
    );
  }

  seasonInput.addEventListener("input", renderChart);
  renderChart();

  const interpretation = html`<aside class="chart-insight">
    <p class="chart-insight-title">Interpretatie</p>
    <p class="chart-interpretation">
    Dit maandoverzicht laat zien hoe het verbruik op deze specifieke paal verloopt doorheen de maanden en jaren. Je kunt direct zien of deze telpaal vooral seizoensgebonden is (sterk verschil zomer–winter = recreatief gebruik) of stabiel blijft (gelijkmatig pendelverkeer). Een hoge winter/zomer-verhouding suggereert structureel fietsverkeer naar werk of school. Controleer ook of groei jaar na jaar zichtbaar is — dit duidt erop dat deze route populairder wordt. Door "Seizoenen tonen" in te schakelen markeer je lente, zomer, herfst en winter visueel.
    </p>
  </aside>`;

  card.append(header, seasonInput, html`<div class="chart-layout">${plotContainer}${interpretation}</div>`);
  return card;
}

const stationContent = station
  ? html`
    <div class="page">
      <section class="page-hero page-hero--compact">
        <h2>${station.name || station.code}</h2>
        <div class="page-hero-subtitle">Code ${station.code} - Fietstelpaal in Gent</div>
      </section>

      <section class="card card--detail">
        <p style="margin:0 0 0.9rem; font-size:0.9rem; color:var(--text-muted); line-height:1.6;">
          Deze pagina toont alle beschikbare data voor de telpaal <strong>${station.name}</strong>. Gebruik het dropdown-menu hieronder om naar een andere telpaal te navigeren. Via de knop "Terug naar kaart" ga je terug naar het globale overzicht met alle locaties.
        </p>
        <div class="pole-toolbar">
          <div class="pole-toolbar-input">
            ${poleInput}
          </div>
          <div class="pole-actions pole-actions--toolbar">
            <a class="button primary" href="./fietspalen">Terug naar kaart</a>
            ${osmHref
              ? html`<a class="button secondary" target="_blank" rel="noopener noreferrer" href="${osmHref}">Bekijk op OSM</a>`
              : null}
          </div>
        </div>
      </section>

      <section class="pole-grid">
        <article class="card card--detail">
          <h3>Algemene info</h3>
          <dl class="pole-list">
            <dt>Code</dt><dd>${station.code}</dd>
            <dt>Eigenaar</dt><dd>${owner}</dd>
            <dt>Bouwjaar</dt><dd>${buildYear}</dd>
            <dt>Begindatum</dt><dd>${startDate}</dd>
          </dl>
        </article>

        <article class="card card--detail">
          <h3>Locatie</h3>
          <dl class="pole-list">
            <dt>Lat</dt><dd>${hasCoordinates ? station.lat.toFixed(6) : "Onbekend"}</dd>
            <dt>Long</dt><dd>${hasCoordinates ? station.long.toFixed(6) : "Onbekend"}</dd>
          </dl>
        </article>
      </section>

      <section class="card card--detail">
        <h3>Verkeersprofiel</h3>
        <p style="margin:0 0 0.8rem; font-size:0.88rem; color:var(--text-muted); line-height:1.55;">
          Het totaal aantal fietsers is de som van alle geregistreerde passages sinds de ingebruikname van de telpaal. De rang vergelijkt deze paal met alle andere Gentse telpalen. Het aandeel geeft aan welk percentage van het totale Gentse fietsverkeer langs deze locatie passeert.
        </p>
        <div class="pole-metrics">
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
      </section>

    </div>
    `
  : html`
    <div class="page">
      <section class="page-hero page-hero--compact">
        <h2>Telpaal niet gevonden</h2>
        <div class="page-hero-subtitle">Kies een telpaal via de kaart om detailinformatie te bekijken.</div>
      </section>
      <section class="pole-actions">
        <a class="button primary" href="/fietspalen">Ga naar de kaart</a>
      </section>
    </div>
    `;
```

```js
// Reactive trendline controls for the station detail page
const poleTrendModeView = getModeView();
const poleTrendMode = Generators.input(poleTrendModeView);

const poleTrendTypeView = Inputs.radio(["absoluut", "relatief"], { value: "absoluut" });
const poleTrendType = Generators.input(poleTrendTypeView);

const poleTrendYearCheckBox = getYearsView(trendAllYears);
const poleTrendYears = Generators.input(poleTrendYearCheckBox);

console.log(trendAllYears);

const poleBaseYearTrendSelect = Inputs.select(trendAllYears, {
  format: d => String(d), 
  value: trendAllYears.at(-1)
});
const poleTrendBaseYear = Generators.input(poleBaseYearTrendSelect);

```

<div class="page-shell">
  <div class="page">
    ${stationContent}
    ${station ? resize((width) => stationMonthlyChart(stationMonthlyData, {width, height: 400})) : null}
    ${station ? html`
      <section class="card card--chart card--with-controls">
        <div class="chart-header">
          <div>
            <h3>Dagelijkse fietsdrukte</h3>
            <p>Heatmap per dag: weeknummer × weekdag. Vergelijk jaren voor stabiliteit en trends.</p>
          </div>
        </div>
        ${stationDailyData.length ? stationHeatmapYearInput : null}
        <div class="chart-layout">
          <div class="chart-main">
            ${stationDailyData.length
              ? selectedStationHeatmapYears.map((year) => heatmap(selectedStationHeatmapData(year), year !== "Alle jaren" ? year : undefined, year !== "Alle jaren" ? "aantal fietsers" : "gemiddeld aantal fietsers", {width, height: 200, colorDomain: stationHeatmapValueDomain}))
              : html`<p class="empty-note">Voor deze telpaal is geen dagdata gevonden.</p>`}
          </div>
          ${stationDailyData.length ? html`<aside class="chart-insight">
            <p class="chart-insight-title">Interpretatie</p>
            <p class="chart-interpretation">
          Deze heatmap toont op een oogopslag waar in het jaar deze telpaal druk is en wanneer rustig. Donkere vlakken in de wintermaanden geven lagere tellingen aan, terwijl groenere tinten (vooral herfst) meer fietsverkeer aangeven. Je herkent meteen structurele patronen: weekendagen zijn doorgaans lichter (minder pendelverkeer), schoolvakanties (pasen, zomer, kerst) zijn duidelijk zichtbaar als lichtere vlakken, en feestdagen kunnen dalingen veroorzaken. Door meerdere jaren naast elkaar te vergelijken zie je of deze paal jaar na jaar dezelfde patronen volgt of groeit/daalt. Extreme uitschieters kunnen wijzen op paalfouten, stroomuitval, of bijzondere evenementen.
            </p>
          </aside>` : null}
        </div>
      </section>
    ` : null}
    ${station ? html`
      <section class="card card--chart card--with-controls">
        <div class="chart-header">
          <div>
            <h3>Trend — ${station.name}</h3>
            <p>Trendlijnen per jaar: <em>absoluut</em> voor ruwe aantallen, <em>relatief</em> voor vergelijking met 2025.</p>
          </div>
        </div>
        <div class="controls-vertical">
          <div class="control-block">
            <div class="control-label">Trend</div>
            ${poleTrendModeView}
          </div>
          <div class="control-block">
            <div class="control-label">Jaar</div>
            ${poleTrendYearCheckBox}
          </div>
          <div class="control-block">
            <div class="control-label">Type</div>
            ${poleTrendTypeView}
          </div>
          ${poleTrendType === "relatief"
            ? html`
              <div class="control-block">
                <div class="control-label">Basis jaar</div>
                ${poleBaseYearTrendSelect}
              </div>
            `
            : ""
          }
        </div>
        <div class="chart-layout">
          <div class="chart-main">
        ${resize((width) => {
          const data = getTrendDataForStation(trendDict, poleTrendMode, poleTrendType, station, poleTrendBaseYear)
            .filter(d => poleTrendYears.map(Number).includes(Number(d.jaar)));
          return data.length
            ? trendLijn(
                data,
                poleTrendMode,
                poleTrendType === "absoluut" ? 
                  "Gemiddelde aantal fietsers" : 
                  `Procentuele verandering t.o.v. ${poleTrendBaseYear}`,
                { width, height: 400, isPct: poleTrendType === "relatief" }
              )
            : html`<p class="empty-note">Geen trenddata gevonden voor deze telpaal.</p>`;
        })}  
          </div>
          <aside class="chart-insight">
            <p class="chart-insight-title">Interpretatie</p>
            <p class="chart-interpretation">
          Deze trendgrafiek laat zien hoe het fietsgebruik op deze specifieke paal evolueert. In <em>absoluut</em>-modus zie je de werkelijke telcijfers per periode — dit toont seizoensschommelingen en langetermijngroei of teruggang. Controleer vooral of er duidelijke groei is (dat duidt op toenemend fietsgebruik op deze route). In <em>relatief</em>-modus worden alle jaren als percentage van 2025 weergegeven, wat het makkelijk maakt om jaar-op-jaar-variatie te zien. Door te schakelen tussen maandelijks, weekdags en uurlijks inzicht krijg je een veel scherper beeld van verkeertype: een duidelijke piek op werkdagen (ma–vr) suggereert sterk pendelverkeer, terwijl weekendtoppen op recreatie duiden. Grote dalingen in bepaalde jaren kunnen wijzen op externe factoren zoals lockdowns of weersextremen.
            </p>
          </aside>
        </div>
      </section>
    ` : null}
  </div>
</div>
