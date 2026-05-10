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

const parseMonth = (value) => {
  if (value == null) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const month = new Date(raw);
  return Number.isNaN(month.getTime()) ? null : month;
};

const normalizeLocation = (value) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/[^a-z0-9]/g, "");

const monthlyByNormalizedLocation = new Map(
  monthlyPerLocation.map((d) => [normalizeLocation(d.location), d])
);

const dailyByNormalizedLocation = new Map(
  dailyPerLocation.map((d) => [normalizeLocation(d.location), d])
);
const dailyByCode = new Map(
  dailyPerLocation.map((d) => [d.code, d])
);

function monthlyDataForStation(station) {
  if (!station) return [];
  const match = monthlyByNormalizedLocation.get(normalizeLocation(station.name));
  return match?.months
    .map(([month, value]) => ({
      month: parseMonth(month),
      avg: value
    }))
    .filter((d) => d.month !== null && Number.isFinite(d.avg))
    .sort((a, b) => a.month - b.month) ?? [];
}

const stationMonthlyData = monthlyDataForStation(station);

function processBikeData(day, value) {
  const date = new Date(day);
  const start = d3.timeYear(date);
  let week = d3.timeWeek.count(start, date);
  const weekday = date.toLocaleString("nl-BE", {weekday: "short"});
  const month = date.toLocaleString("nl-BE", {month: "short"});

  if (weekday === "zo") week -= 1;

  return {
    day: date,
    value,
    weekday,
    month,
    week
  };
}

function dailyDataForStation(station) {
  if (!station) return [];
  const match = dailyByCode.get(station.code) ?? dailyByNormalizedLocation.get(normalizeLocation(station.name));
  return match?.days
    .map(([day, value]) => processBikeData(day, value))
    .filter((d) => !Number.isNaN(d.day.getTime()) && Number.isFinite(d.value))
    .sort((a, b) => a.day - b.day) ?? [];
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

// ── Trendline: build per-location data for the current station ───────────────
// Look up the station's locatie name as stored in the trend data, then filter.
function selectLocationTrendData(mode, type, stationCode) {
  const dataset = trendDict[mode][type];
  const found = dataset.perLocation.find(d => d.code === stationCode);
  if (!found) return [];
  return found.data.sort((a, b) => a.jaar - b.jaar || a[mode] - b[mode]);
}

const stationCode = station?.code ?? null;

// Derive available years for this station from all trend datasets
const stationTrendYears = station
  ? Array.from(new Set(
      Object.values(trendDict).flatMap(d =>
        d.absoluut.perLocation
          .filter(p => p.code === stationCode)
          .flatMap(p => p.data.map(v => v.jaar))
      )
    )).sort()
  : [];

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
    location.href = `/paal?code=${encodeURIComponent(nextCode)}`;
  }
});

function stationMonthlyChart(data, {width, height = 400} = {}) {
  const card = document.createElement("div");
  card.className = "card card--chart card--with-controls";

  const header = html`<div class="chart-header">
    <div>
      <h3>Maandelijkse drukte</h3>
      <p>Gemeten fietsers per maand voor deze telpaal.</p>
    </div>
  </div>`;

  const seasonInput = Inputs.toggle({
    label: "Seizoenen tonen",
    value: false
  });

  const plotContainer = document.createElement("div");

  function renderChart() {
    plotContainer.replaceChildren(
      data.length
        ? drukte(data, "Aantal fietsers", seasonInput.value, {width, height})
        : html`<p class="empty-note">Voor deze telpaal is geen maanddata gevonden.</p>`
    );
  }

  seasonInput.addEventListener("input", renderChart);
  renderChart();

  card.append(header, seasonInput, plotContainer);
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
        <div class="pole-toolbar">
          <div class="pole-toolbar-input">
            ${poleInput}
          </div>
          <div class="pole-actions pole-actions--toolbar">
            <a class="button primary" href="/fietspalen">Terug naar kaart</a>
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

poleTrendTypeView.addEventListener("input", () => {
  if (poleTrendTypeView.value === "relatief") {
    const years = poleTrendYearCheckBox.value.map(Number);

    if (!years.includes(2025)) {
      poleTrendYearCheckBox.value = [...years, 2025];
      poleTrendYearCheckBox.dispatchEvent(new Event("input"));
    }
  }
});

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
            <p>Gemeten fietsers per dag voor deze telpaal.</p>
          </div>
        </div>
        ${stationDailyData.length ? stationHeatmapYearInput : null}
        ${stationDailyData.length
          ? selectedStationHeatmapYears.map((year) => heatmap(selectedStationHeatmapData(year), year !== "Alle jaren" ? year : undefined, "aantal fietsers", {width, height: 200, colorDomain: stationHeatmapValueDomain}))
          : html`<p class="empty-note">Voor deze telpaal is geen dagdata gevonden.</p>`}
      </section>
    ` : null}
    ${station ? html`
      <section class="card card--chart card--with-controls">
        <div class="chart-header">
          <div>
            <h3>Trend — ${station.name}</h3>
            <p>Fietsers aan deze telpaal doorheen de tijd.</p>
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
        </div>
        ${resize((width) => {
          const data = selectLocationTrendData(poleTrendMode, poleTrendType, stationCode)
            .filter(d => poleTrendYears.map(Number).includes(Number(d.jaar)));
          return data.length
            ? trendLijn(
                data,
                poleTrendMode,
                poleTrendType === "absoluut" ? "Aantal fietsers" : "Procentuele verandering t.o.v. 2025",
                { width, height: 400, isPct: poleTrendType === "relatief" }
              )
            : html`<p class="empty-note">Geen trenddata gevonden voor deze telpaal.</p>`;
        })}
      </section>
    ` : null}
  </div>
</div>