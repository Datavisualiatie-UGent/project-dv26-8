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

const locations = await FileAttachment("data/locations.json").json();
const monthlyPerLocation = await FileAttachment("data/monthlyPerLocation.json").json();

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
    .replace(/[^a-z0-9]/g, "");

const monthlyByNormalizedLocation = new Map(
  monthlyPerLocation.map((d) => [normalizeLocation(d.location), d])
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

const selectedPoleCode = Generators.input(poleInput);

const useSeasonInput = Inputs.toggle({
  label: "Seizoenen tonen",
  value: false
});
const showSeason = Generators.input(useSeasonInput);

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

      <section class="card card--chart card--with-controls">
        <div class="chart-header">
          <div>
            <h3>Maandelijkse drukte</h3>
            <p>Gemeten fietsers per maand voor deze telpaal.</p>
          </div>
        </div>
        ${useSeasonInput}
        ${stationMonthlyData.length
          ? resize((width) => drukte(stationMonthlyData, "Aantal fietsers", showSeason, {width, height: 400}))
          : html`<p class="empty-note">Voor deze telpaal is geen maanddata gevonden.</p>`}
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

<div class="page-shell">
  <div class="page">
    ${stationContent}
  </div>
</div>
