---
title: Globaal
toc: false
theme: dashboard
---

```js
import L from "npm:leaflet";
import {html} from "npm:htl";
import * as Inputs from "@observablehq/inputs";
import {Generators} from "@observablehq/stdlib";
import {drukte} from "./components/drukte.js";
import {heatmap} from "./components/heatmap.js";
import {trendLijn} from "./components/trendlijn.js";
import {getModeView, getYearsView} from "./components/trendlijn_helper.js";
import {parseMonth, processBikeData} from "./components/station_data.js";
import * as d3 from "npm:d3";
```

```js
const gentBoundaryGeo = await FileAttachment("data/OSMB-71785c830e71f3607aaeffc6b51538d7206c36a0.geojson").json();

const locations = await FileAttachment("data/locations.json").json();
const monthlyAverage = await FileAttachment("data/monthlyAvg.json").json();
const dailyAverage = await FileAttachment("data/dailyAvg.json").json();

// Trendline data
const trendDict = {
  month: await FileAttachment("data/monthly.json").json(),
  day: await FileAttachment("data/weekly.json").json(),
  hour: await FileAttachment("data/hourly.json").json()
};


const allYears = Array.from(new Set(
  Object.values(trendDict).flatMap(d =>
    d.absoluut.global.data.map(v => v.jaar)
  )
));

function selectGlobalData(mode, type, baseYear) {

  let selected = trendDict[mode][type].global;

  if(type === "relatief") {
    selected = selected[baseYear];
    
  }

  return selected.data.sort((a, b) =>
    a.jaar - b.jaar || a[mode] - b[mode]
  );
}
```

```js
const parsedMonthlyAverage = monthlyAverage
  .map((d) => ({
    ...d,
    month: parseMonth(d.month)
  }))
  .filter((d) => d.month !== null && Number.isFinite(d.avg))
  .sort((a, b) => a.month - b.month);

const dailyAverageAllYears = d3.rollup(
  dailyAverage,
  (values) => d3.mean(values, (d) => d.avg),
  (d) => {
    const date = new Date(d.day);
    return `${date.getMonth()}-${date.getDate()}`;
  }
);

const heatmapData = dailyAverage.map((d) => processBikeData(d.day, d.avg)).sort((a, b) => a.day - b.day);
const heatmapDataAllYears = Array.from(dailyAverageAllYears, ([day, value]) => {
  const [month, date] = day.split("-").map(Number);
  return processBikeData(new Date(2024, month, date), value);
}).sort((a, b) => a.day - b.day);

const heatmapYears = [...new Set(heatmapData.map((d) => d.day.getFullYear()))].sort().concat("Alle jaren");
const heatmapYearInput = Inputs.checkbox(heatmapYears, {
  label: "Selecteer jaren",
  value: heatmapYears.includes(2025) ? [2025] : heatmapYears.slice(0, 1),
  format: (value) => value.toString()
});
const selectedHeatmapYears = Generators.input(heatmapYearInput);
const heatmapValueDomain = d3.extent(heatmapData, (d) => d.value);

const selectedHeatmapData = (year) => {
  if (year === "Alle jaren") return heatmapDataAllYears;
  return heatmapData.filter((d) => d.day.getFullYear() === year);
};

const useSeasonInput = Inputs.toggle({
  label: "Seizoenen tonen",
  value: false
});
const showSeason = Generators.input(useSeasonInput);

if (!globalThis.__fietsMapBridge) {
  globalThis.__fietsMapBridge = {focusPole: null, resetView: null, selectedCode: null};
}
const mapBridge = globalThis.__fietsMapBridge;

const rankingSortInput = Inputs.radio(["total", "name", "buildYear"], {
  value: "total",
  format: (value) => ({
    total: "Fietsers",
    name: "Naam",
    buildYear: "Bouwjaar"
  })[value]
});

const rankingDirInput = Inputs.radio(["desc", "asc"], {
  value: "desc",
  format: (value) => value === "asc" ? "Oplopend" : "Aflopend"
});

const sortControls = html`<div class="ranking-controls">
  <div class="sort-control">${rankingSortInput}</div>
  <div class="sort-control">${rankingDirInput}</div>
</div>`;
```

```js
const rankingSort = Generators.input(rankingSortInput);
const rankingDir = Generators.input(rankingDirInput);
```

```js

function sortValue(location, key) {
  if (key === "name") return (location.name || "").toLowerCase();
  if (key === "code") return (location.code || "").toLowerCase();
  if (key === "buildYear") return Number.isFinite(location.buildYear) ? location.buildYear : -Infinity;
  return location.total;
}

function compareLocations(a, b) {
  const av = sortValue(a, rankingSort);
  const bv = sortValue(b, rankingSort);
  if (typeof av === "string" && typeof bv === "string") {
    return rankingDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  }
  return rankingDir === "asc" ? av - bv : bv - av;
}

const sortedLocations = [...locations].sort(compareLocations);
const locationsByCyclists = [...locations].sort((a, b) => b.total - a.total);
const totalStations = locations.length;
const totalCyclists = locations.reduce((sum, d) => sum + d.total, 0);
const avgCyclists = totalStations > 0 ? totalCyclists / totalStations : 0;

const withBuildYear = locations.filter((d) => Number.isFinite(d.buildYear));
const newestStation = withBuildYear.length > 0
  ? withBuildYear.reduce((best, d) => (d.buildYear > best.buildYear ? d : best))
  : null;
const oldestStation = withBuildYear.length > 0
  ? withBuildYear.reduce((best, d) => (d.buildYear < best.buildYear ? d : best))
  : null;

const nf = new Intl.NumberFormat("nl-BE");
```

```js
const mapCard = resize((width) => {
  const shell = document.createElement("div");
  shell.className = "map-shell";

  const container = document.createElement("div");
  container.className = "map-shell-inner";

  const map = L.map(container, {
    zoomControl: true,
    scrollWheelZoom: true
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  const boundaryFeature = gentBoundaryGeo?.features?.[0];
  const ghentRing = boundaryFeature?.geometry?.type === "Polygon"
    ? boundaryFeature.geometry.coordinates?.[0]
    : null;

  // World polygon with a Ghent hole derived from the real OSM boundary.
  const worldWithHole = ghentRing && ghentRing.length > 3
    ? {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]],
            ghentRing
          ]
        }
      }
    : null;

  if (worldWithHole) {
    L.geoJSON(worldWithHole, {
      style: {
        fillColor: "#888",
        fillOpacity: 0.45,
        stroke: false,
        fillRule: "evenodd"
      }
    }).addTo(map);
  }

  const bikeIcon = L.divIcon({
    className: "bike-pin",
    html: `<div class="bike-pin-inner">
             <div class="bike-pin-circle">🚲</div>
             <div class="bike-pin-tail"></div>
           </div>`,
    iconSize: [34, 46],
    iconAnchor: [17, 46]
  });

  const infoPanel = document.createElement("aside");
  infoPanel.className = "pole-info-panel";
  infoPanel.hidden = true;

  const locationByCode = new Map(locations.map((item) => [item.code, item]));
  const markerByCode = new Map();
  let selectedMarkerCode = null;

  function updateSelectedMarker(code) {
    if (selectedMarkerCode && markerByCode.has(selectedMarkerCode)) {
      markerByCode.get(selectedMarkerCode)?.getElement?.()?.classList.remove("is-selected");
      markerByCode.get(selectedMarkerCode)?.setZIndexOffset?.(0);
    }
    selectedMarkerCode = code || null;
    if (selectedMarkerCode && markerByCode.has(selectedMarkerCode)) {
      markerByCode.get(selectedMarkerCode)?.getElement?.()?.classList.add("is-selected");
      markerByCode.get(selectedMarkerCode)?.setZIndexOffset?.(1000);
    }
  }

  function closePanel() {
    infoPanel.replaceChildren();
    infoPanel.hidden = true;
    mapBridge.selectedCode = null;
    updateSelectedMarker(null);
  }

  function renderPanel(location) {
    if (!location) {
      closePanel();
      return;
    }

    mapBridge.selectedCode = location.code;
    updateSelectedMarker(location.code);

    const header = document.createElement("div");
    header.className = "pole-info-header";

    const title = document.createElement("h3");
    title.textContent = location.name;

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "pole-info-close";
    closeBtn.title = "Sluit paneel";
    closeBtn.setAttribute("aria-label", "Sluit paneel");
    closeBtn.textContent = "x";
    closeBtn.addEventListener("click", closePanel);

    header.append(title, closeBtn);

    const list = document.createElement("dl");
    list.className = "pole-info-list";
    for (const [label, value] of [
      ["naam", location.name],
      ["code", location.code],
      ["eigenaar", location.owner],
      ["bouwjaar", Number.isFinite(location.buildYear) ? String(Math.trunc(location.buildYear)) : "Onbekend"],
      ["begindatum", location.startDate],
      ["fietsers", nf.format(location.total)],
      ["lat", Number.isFinite(location.lat) ? location.lat.toFixed(10) : "Onbekend"],
      ["long", Number.isFinite(location.long) ? location.long.toFixed(10) : "Onbekend"],
    ]) {
      const dt = document.createElement("dt"); dt.textContent = label;
      const dd = document.createElement("dd"); dd.textContent = value;
      list.append(dt, dd);
    }

    const link = document.createElement("a");
    link.className = "pole-info-link";
    link.href = `./paal?code=${encodeURIComponent(location.code)}`;
    link.textContent = "Open infopagina";

    infoPanel.replaceChildren(header, list, link);
    infoPanel.hidden = false;
  }

  function focusLocation(code, {zoom = 15} = {}) {
    const location = locationByCode.get(code);
    if (!location) return;
    renderPanel(location);
    mapBridge.scrollToMap?.();
    map.flyTo([location.lat, location.long], Math.max(map.getZoom(), zoom), { animate: true, duration: 0.4 });
  }

  // Add all markers first, collecting them:
  const bounds = L.latLngBounds();

  for (const location of locations) {
    const marker = L.marker([location.lat, location.long], { icon: bikeIcon }).addTo(map);
    markerByCode.set(location.code, marker);
    bounds.extend([location.lat, location.long]);
    marker.on("click", () => {
      focusLocation(location.code);
    });
  }

  mapBridge.focusPole = (code) => {
     if (markerByCode.has(code)) focusLocation(code);
  };

  mapBridge.resetView = () => {
    fitAllPins();
  };

  map.on("click", () => closePanel());

  const recenterControl = L.control({ position: "topleft" });
  recenterControl.onAdd = () => {
    const wrap = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-recenter-wrap");
    const btn = L.DomUtil.create("a", "leaflet-control-recenter", wrap);
    btn.href = "#";
    btn.title = "Centreer kaart";
    btn.textContent = "⊙";
    L.DomEvent.disableClickPropagation(btn);
    L.DomEvent.on(btn, "click", (e) => {
       L.DomEvent.stop(e);
        fitAllPins();
    });
    return wrap;
  };
  recenterControl.addTo(map);

  function fitAllPins() {
    if (!bounds.isValid()) return;

    // Keep top/bottom spacing visually balanced while accounting for pin height.
    const horizontalPadding = 10;
    const verticalPadding = 20;
    const topPadding = 30;
    const bottomPadding = -20;
    map.fitBounds(bounds, {
      paddingTopLeft: [horizontalPadding, topPadding],
      paddingBottomRight: [horizontalPadding, bottomPadding],
      maxZoom: 15
    });
  }

  mapBridge.scrollToMap = () => {
    shell.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (mapBridge.selectedCode && locationByCode.has(mapBridge.selectedCode)) {
    renderPanel(locationByCode.get(mapBridge.selectedCode));
  } else {
    renderPanel(null);
  }

  shell.append(container, infoPanel);
  setTimeout(() => {
    map.invalidateSize();
    fitAllPins();
  }, 0);
  return shell;
});
```

```js

const allAvailableYears = Array.from(
  new Set(trendDict.month.absoluut.global.data.map(d => Number(d.jaar)))
).sort((a, b) => a - b);

// Trendline controls for the global chart
const trendModeView = getModeView();
const trendMode = Generators.input(trendModeView);

const trendYearCheckBox = getYearsView(allYears);
const trendYears = Generators.input(trendYearCheckBox);

const trendTypeView = Inputs.radio(["absoluut", "relatief"], { value: "absoluut" });
const trendType = Generators.input(trendTypeView);

const baseYearTrendSelect = Inputs.select(allAvailableYears, {
  format: d => String(d), 
  value: allAvailableYears.at(-1)
  });
const trendBaseYear = Generators.input(baseYearTrendSelect);

```

<div class="page">
  <section class="page-hero">
    <h2>Fietstelpalen in Gent</h2>
    <div class="page-hero-subtitle">Kerncijfers, interactieve kaart en globale patronen over de periode 2018–2026.</div>
  </section>
  <section class="overview-grid">
    <article class="card card--overview">
      <p class="metric-label">Aantal telpalen</p>
      <p class="metric-value">${nf.format(totalStations)}</p>
    </article>
    <article class="card card--overview">
      <p class="metric-label">Totaal fietsers</p>
      <p class="metric-value">${nf.format(totalCyclists)}</p>
    </article>
    <article class="card card--overview">
      <p class="metric-label">Gemiddeld per paal</p>
      <p class="metric-value">${nf.format(Math.round(avgCyclists))}</p>
    </article>
    <article class="card card--overview">
      <p class="metric-label">Top telpaal</p>
      <p class="metric-value">${locationsByCyclists[0] ? locationsByCyclists[0].name : "Onbekend"}</p>
    </article>
  </section>

  <details class="card card--collapsible" open>
    <summary class="ranking-header">
      <h3>Ranking van telpalen</h3>
      <span class="ranking-toggle">Open / sluit</span>
    </summary>
    <div class="ranking-header">
      ${sortControls}
    </div>
    <div class="ranking-table-wrap">
      <table class="ranking-table">
        <thead>
          <tr>
            <th>Rang</th>
            <th>Naam</th>
            <th>Code</th>
            <th>Fietsers</th>
            <th>Aandeel</th>
            <th>Bouwjaar</th>
            <th>Kaart</th>
          </tr>
        </thead>
        <tbody>
          ${sortedLocations.map((p, i) => {
            const share = totalCyclists > 0 ? (p.total / totalCyclists) * 100 : 0;
            const year = Number.isFinite(p.buildYear) ? String(Math.trunc(p.buildYear)) : "Onbekend";
            return html`<tr>
              <td class="rank-cell">${i + 1}</td>
              <td>${p.name}</td>
              <td>${p.code}</td>
              <td>${nf.format(p.total)}</td>
              <td>${share.toFixed(2)}%</td>
              <td>${year}</td>
              <td><button class="show-map-button" type="button" title="Toon op kaart" aria-label="Toon op kaart" onclick=${() => { mapBridge.focusPole?.(p.code); mapBridge.scrollToMap?.(); }}>📍</button></td>
            </tr>`;
          })}
        </tbody>
      </table>
    </div>
  </details>

  <section class="overview-grid">
    <article class="card card--overview">
      <p class="metric-label">Oudste telpaal</p>
      <p class="metric-value">${oldestStation ? `${oldestStation.name} (${Math.trunc(oldestStation.buildYear)})` : "Onbekend"}</p>
    </article>
    <article class="card card--overview">
      <p class="metric-label">Nieuwste telpaal</p>
      <p class="metric-value">${newestStation ? `${newestStation.name} (${Math.trunc(newestStation.buildYear)})` : "Onbekend"}</p>
    </article>
    <article class="card card--overview">
      <p class="metric-label">Top 3 samen</p>
      <p class="metric-value">${nf.format(locationsByCyclists.slice(0, 3).reduce((sum, d) => sum + d.total, 0))}</p>
    </article>
    <article class="card card--overview">
      <p class="metric-label">Mediaan (ruw)</p>
      <p class="metric-value">${(() => {
        if (sortedLocations.length === 0) return "0";
        const asc = [...sortedLocations].map((d) => d.total).sort((a, b) => a - b);
        const mid = Math.floor(asc.length / 2);
        const med = asc.length % 2 ? asc[mid] : (asc[mid - 1] + asc[mid]) / 2;
        return nf.format(Math.round(med));
      })()}</p>
    </article>
  </section>

  <div>
    <div class="card card--map">
      ${mapCard}
    </div>
    <p class="map-caption map-note">Klik op een pin om de gegevens van die telpaal in het infopaneel te zien. Gebruik de ⊙-knop om de kaart te hercentreren.</p>
    <aside class="chart-insight">
      <p class="chart-insight-title">Interpretatie</p>
      <p class="chart-interpretation">
      De kaart geeft een direct beeld van hoe de telpalen verspreid liggen over Gent. Je ziet dat detelpalen verspreid liggen in het centrum van gent en de binnenring ongeveer volgen in vorm. Deze kaart maakt duidelijk waarom Spoorwegbrug Drongen onderaan in de rang staat. Deze paal staat namelijk heel uitgezonderd en buiten het satd-centrum. Door op pinnen te klikken kun je per locatie dieper inzoomen.
      </p>
    </aside>
  </div>

  <section class="card card--chart card--with-controls">
    <div class="chart-header">
      <div>
        <h3>Maandelijkse drukte</h3>
        <p>Gemiddelde fietsers per maand (2018–2026). Seizoenen en jaarlijkse verschuivingen zichtbaar.</p>
      </div>
    </div>
    ${useSeasonInput}
    <div class="chart-layout">
      <div class="chart-main">
        ${resize((width) => drukte(parsedMonthlyAverage, "Gemiddelde fietsers", showSeason, {width, height: 400}))}
      </div>
      <aside class="chart-insight">
        <p class="chart-insight-title">Interpretatie</p>
        <p class="chart-interpretation">
          Je kan duidelijk zien dat doorheen de jaren het aantal fietser stijgt. Dit kan je deels verwijten aan het feit dat er meer telpalen zijn bijgekomen. Maar zelfs dan kan je een stijgende trend zien doorheen de jaren. Je kan een duidelijke daling in het aantal fietsers zien in het jaar 2020 wat je kan linken aan de CORONA periode.
        </p>
        <p class="chart-interpretation">
          Als je de Seizoen kleuren aanzet kan de een duidelijk seizoenspatroon zien. De wintermaanden zijn het rustigst met een duidelijk lagere tellingen. Na de winter zie je een stijging in het aantal fietsers tot het piekt in de eerste helft van de herfst.
        </p>
      </aside>
    </div>
  </section>

  <section class="card card--chart card--with-controls">
    <div class="chart-header">
      <div>
        <h3>Dagelijkse fietsdrukte</h3>
        <p>Heatmap van gemiddelde dagelijkse tellers.</p>
      </div>
    </div>
    ${heatmapYearInput}
    <div class="chart-layout">
      <div class="chart-main">
        ${selectedHeatmapYears.map((year) => heatmap(selectedHeatmapData(year), year !== "Alle jaren" ? year : undefined, "gemiddeld aantal fietsers", {width, height: 200, colorDomain: heatmapValueDomain}))}
      </div>
      <aside class="chart-insight">
        <p class="chart-insight-title">Interpretatie</p>
        <p class="chart-interpretation">
          Deze heatmap toont op een oogopslag waar in het jaar het drukker of rustiger is. De lichtere vlakken in de winterperiode geven lager fietsverkeer aan, terwijl groenere vlakken (herfstmaanden) meer fietsverkeer aangeven. Je kan duidelijk zien dat er op de weekendagen veel minder pendelverkeer is. Dit kan je linken aan de werk en schooldagen. Ook kan je duidelijk de schoolvakanties zoals de paas- (apr), zomer- (jul-aug) en kerst-vakanties (dec-jan) zien.
          Je ziet hier ook duidelijk dat de wintermaanden het minst populair zijn.
          Door meerdere jaren te selecteren kun je patronen vergelijken in verschillende jaren.
        </p>
      </aside>
    </div>
  </section>

  <section class="card card--chart card--with-controls">
    <div class="chart-header">
      <div>
        <h3>Trend — alle telpalen</h3>
        <p>Trendlijnen per jaar: kies <em>absoluut</em> voor ruwe aantallen of <em>relatief</em> om jaren te vergelijken ten opzichte van 2025.</p>
      </div>
    </div>
    <div class="controls-vertical">
      <div class="control-block">
        <div class="control-label">Trend</div>
        ${trendModeView}
      </div>
      <div class="control-block">
        <div class="control-label">Jaar</div>
        ${trendYearCheckBox}
      </div>
      <div class="control-block">
        <div class="control-label">Type</div>
        ${trendTypeView}
      </div>
      ${trendType === "relatief"
        ? html`
          <div class="control-block">
            <div class="control-label">Basis jaar</div>
            ${baseYearTrendSelect}
          </div>
        `
        : ""
      }
    </div>
    <div class="chart-layout">
      <div class="chart-main">
        ${resize((width) =>
          trendLijn(
            selectGlobalData(trendMode, trendType, trendBaseYear)
              .filter(d => trendYears.map(Number).includes(Number(d.jaar))),
            trendMode,
            trendType === "absoluut" ? "Gemiddelde aantal fietsers" : `Procentuele verandering t.o.v. ${trendBaseYear}`,
            { width, height: 400, isPct: trendType === "relatief" }
          )
        )}
      </div>
      <aside class="chart-insight">
        <p class="chart-insight-title">Interpretatie</p>
        <p class="chart-interpretation">
          Deze grafiek laat zien hoe het fietsgebruik over jaren heen evolueert. In de <em>absoluut</em>-modus zie je werkelijke telcijfers per periode, wat direct aangeeft welk jaar het drukst of rustigst was. In de <em>relatief</em>-modus wordt elk jaar vergeleken met 2025, wat duidelijk maakt of eerdere jaren sterker of zwakker waren — hierdoor kan je duidelijk de trend zien. Door tussen maandelijks, weekdags en uurlijks aggregatie te schakelen, ontdek je fijner gestuurde patronen: bijvoorbeeld dat de ochtend- en avondspits steeds groter is geworden en ze omgedraaid zijn in drukte in 2022, het weekpatroon en de maandpatronen van verschillende jaren.
        </p>
      </aside>
    </div>
  </section>
</div>
