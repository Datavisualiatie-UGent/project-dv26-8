---
toc: false
theme: dashboard
---

```js
import L from "npm:leaflet";
import {html} from "npm:htl";
```

```js
const locaties = await FileAttachment("data/locaties.json").json();
const bikeSummary = await FileAttachment("data/fietspalen.json").json();
const gentBoundaryGeo = await FileAttachment("data/OSMB-71785c830e71f3607aaeffc6b51538d7206c36a0.geojson").json();

const totalByCode = new Map((bikeSummary.codeTotals || []).map((d) => [d.code, d.total]));
const points = locaties
  .filter((d) => Number.isFinite(d.lat) && Number.isFinite(d.long) && d.code)
  .map((d) => ({
    code: d.code,
    name: d.naam || d.code,
    eigenaar: d.eigenaar || "Onbekend",
    bouwjaar: d.bouwjaar,
    point_x: d.point_x,
    point_y: d.point_y,
    begindatum: d.begindatum || d.begindatumIso || "Onbekend",
    lat: d.lat,
    lon: d.long,
    total: totalByCode.get(d.code) ?? 0
  }));

const sortedPoints = [...points].sort((a, b) => b.total - a.total);
const totalPoles = sortedPoints.length;
const totalCyclists = sortedPoints.reduce((sum, d) => sum + d.total, 0);
const avgCyclists = totalPoles > 0 ? totalCyclists / totalPoles : 0;

const withBuildYear = sortedPoints.filter((d) => Number.isFinite(d.bouwjaar));
const newestPole = withBuildYear.length > 0
  ? withBuildYear.reduce((best, d) => (d.bouwjaar > best.bouwjaar ? d : best))
  : null;
const oldestPole = withBuildYear.length > 0
  ? withBuildYear.reduce((best, d) => (d.bouwjaar < best.bouwjaar ? d : best))
  : null;

const nf = new Intl.NumberFormat("nl-BE");
```

```js
const kaart = resize((width) => {
  const shell = document.createElement("div");
  shell.className = "kaart-shell";
  shell.style.position = "relative";
  shell.style.width = "100%";
  shell.style.height = "40vh";
  shell.style.minHeight = "35vh";
  shell.style.overflow = "hidden";

  const container = document.createElement("div");
  container.style.width = "100%";
  container.style.height = "100%";

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

  const panel = document.createElement("aside");
  panel.className = "pole-info-panel";
  panel.hidden = true;

  function renderPanel(point) {
    if (!point) {
      panel.replaceChildren();
      panel.hidden = true;
      return;
    }

    const title = document.createElement("h3");
    title.textContent = point.name;

    const list = document.createElement("dl");
    list.className = "pole-info-list";

    const rows = [
      ["naam", point.name],
      ["code", point.code],
      ["eigenaar", point.eigenaar],
      ["bouwjaar", Number.isFinite(point.bouwjaar) ? String(Math.trunc(point.bouwjaar)) : "Onbekend"],
      ["begindatum", point.begindatum],
      ["fietsers", new Intl.NumberFormat("nl-BE").format(point.total)],
      ["point_x", Number.isFinite(point.point_x) ? point.point_x.toFixed(8) : "Onbekend"],
      ["point_y", Number.isFinite(point.point_y) ? point.point_y.toFixed(8) : "Onbekend"],
      ["lat", Number.isFinite(point.lat) ? point.lat.toFixed(10) : "Onbekend"],
      ["long", Number.isFinite(point.lon) ? point.lon.toFixed(10) : "Onbekend"],
    ];

    for (const [label, value] of rows) {
      const dt = document.createElement("dt");
      dt.textContent = label;
      const dd = document.createElement("dd");
      dd.textContent = value;
      list.append(dt, dd);
    }

    const link = document.createElement("a");
    link.className = "pole-info-link";
    link.href = `/paal?code=${encodeURIComponent(point.code)}`;
    link.textContent = "Open infopagina van deze telpaal";

    panel.replaceChildren(title, list, link);
    panel.hidden = false;
  }

  // Add all markers first, collecting them:
  const bounds = L.latLngBounds();

  for (const point of points) {
    const marker = L.marker([point.lat, point.lon], { icon: bikeIcon }).addTo(map);
    bounds.extend([point.lat, point.lon]);
    marker.on("click", () => {
      renderPanel(point);
      map.flyTo([point.lat, point.lon], Math.max(map.getZoom(), 15), { animate: true, duration: 0.4 });
    });
  }

  map.on("click", () => {
    renderPanel(null);
  });

  function fitAllPins() {
    if (!bounds.isValid()) return;

    // Keep top/bottom spacing visually balanced while accounting for pin height.
    const horizontalPadding = 20;
    const verticalPadding = 20;
    const pinHeight = 60;

    map.fitBounds(bounds, {
      paddingTopLeft: [horizontalPadding, verticalPadding],
      paddingBottomRight: [horizontalPadding, verticalPadding - pinHeight],
      maxZoom: 15
    });
  }

  renderPanel(null);

  const style = document.createElement("style");
  style.textContent = `
    /* ── Pin ── */
    .bike-pin-inner {
      position: relative;
      width: 34px;
      height: 46px;
      user-select: none;
      pointer-events: none;
      filter: drop-shadow(0 2px 6px rgba(0,0,0,0.35));
    }

    .bike-pin-circle {
      position: absolute;
      top: 0;
      left: 0;
      width: 34px;
      height: 34px;
      display: grid;
      place-items: center;
      background: #0f766e;
      border-radius: 50%;
      color: white;
      font-size: 13px;
      line-height: 1;
      box-sizing: border-box;
    }

    .bike-pin-tail {
      position: absolute;
      bottom: 9px;
      left: 50%;
      transform: translateX(-50%) rotate(45deg);
      width: 14px;
      height: 14px;
      background: #0f766e;
      box-sizing: border-box;
    }

    /* ── Info panel ── */
    .pole-info-panel {
      position: absolute;
      top: 1rem;
      right: 1rem;
      z-index: 500;
      width: min(280px, calc(100% - 2rem));
      max-height: calc(100% - 2rem);
      overflow: auto;
      border-radius: 12px;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.96);
      color: #0f172a;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.18);
      backdrop-filter: blur(8px);
      font-family: var(--sans-serif);
      font-size: 0.82rem;
      box-sizing: border-box;
    }

    .pole-info-panel h3 {
      margin: 0 0 0.5rem;
      font-size: 1rem;
      line-height: 1.2;
    }

    .pole-info-panel p {
      margin: 0;
      color: #475569;
      line-height: 1.4;
    }

    .pole-info-list {
      display: grid;
      grid-template-columns: 5.5rem 1fr;
      gap: 0.2rem 0.5rem;
      margin: 0;
      width: 100%;
    }

    .pole-info-list dt {
      margin: 0;
      font-weight: 600;
      color: #64748b;
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      align-self: center;
      white-space: nowrap;
    }

    .pole-info-list dd {
      margin: 0;
      color: #0f172a;
      font-size: 0.82rem;
      overflow-wrap: anywhere;
      align-self: center;
      min-width: 0;
    }

    .pole-info-link {
      display: block;
      width: 100%;
      box-sizing: border-box;
      margin-top: 0.65rem;
      padding: 0.55rem 0.5rem;
      border-radius: 999px;
      background: #0f766e;
      color: #ffffff !important;
      -webkit-text-fill-color: #ffffff;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.78rem;
      text-align: center;
      box-shadow: 0 4px 12px rgba(15, 118, 110, 0.25);
    }

    .pole-info-link:hover { background: #115e59; }

    @media (max-width: 640px) {
      .pole-info-panel {
        left: 0.5rem;
        right: 0.5rem;
        width: auto;
      }
    }
  `;

  shell.append(container, panel, style);
  setTimeout(() => {
    map.invalidateSize();
    fitAllPins();
  }, 0);
  return shell;
});
```

<style>
  .fietspalen-page {
    display: grid;
    gap: 0.95rem;
  }

  .fietspalen-hero {
    border-radius: 14px;
    padding: 1rem 1.1rem;
    color: #ffffff;
    background: linear-gradient(135deg, #0f766e 0%, #0f172a 100%);
    box-shadow: 0 10px 26px rgba(15, 23, 42, 0.22);
  }

  .fietspalen-hero h2 {
    margin: 0;
    font-size: 1.35rem;
    line-height: 1.2;
  }

  .fietspalen-hero p {
    margin: 0.35rem 0 0;
    color: rgba(255, 255, 255, 0.9);
  }

  .overview-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.7rem;
  }

  .overview-card {
    border-radius: 12px;
    border: 1px solid #dbe7ef;
    background: #ffffff;
    padding: 0.72rem 0.78rem;
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
  }

  .overview-label {
    margin: 0;
    color: #64748b;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-weight: 700;
  }

  .overview-value {
    margin: 0.2rem 0 0;
    color: #0f172a;
    font-size: 1.05rem;
    font-weight: 700;
  }

  .ranking-card {
    border-radius: 12px;
    border: 1px solid #dbe7ef;
    background: #ffffff;
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
    overflow: hidden;
  }

  .ranking-header {
    padding: 0.82rem 0.9rem;
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;
  }

  .ranking-header h3 {
    margin: 0;
    font-size: 1rem;
    color: #0f172a;
  }

  .ranking-table-wrap {
    overflow-x: auto;
  }

  .ranking-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.86rem;
  }

  .ranking-table th,
  .ranking-table td {
    padding: 0.52rem 0.7rem;
    border-bottom: 1px solid #edf2f7;
    text-align: left;
    white-space: nowrap;
  }

  .ranking-table th {
    color: #64748b;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-weight: 700;
    background: #ffffff;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .ranking-table tr:nth-child(even) {
    background: #fcfdff;
  }

  .ranking-table .rank-cell {
    font-weight: 700;
    color: #0f766e;
  }

  .map-card {
    padding: 0;
    overflow: hidden;
    border-radius: 12px;
    border: 1px solid #dbe7ef;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.1);
  }

  .map-caption {
    color: #475569;
    margin: 0;
    font-size: 0.9rem;
  }

  @media (max-width: 1024px) {
    .overview-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .overview-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

<div class="fietspalen-page">
  <section class="fietspalen-hero">
    <h2>Fietstelpalen in Gent</h2>
    <p>Interactieve kaart en ranking op basis van totaal getelde fietsers per telpaal.</p>
  </section>

  <section class="overview-grid">
    <article class="overview-card">
      <p class="overview-label">Aantal telpalen</p>
      <p class="overview-value">${nf.format(totalPoles)}</p>
    </article>
    <article class="overview-card">
      <p class="overview-label">Totaal fietsers</p>
      <p class="overview-value">${nf.format(totalCyclists)}</p>
    </article>
    <article class="overview-card">
      <p class="overview-label">Gemiddeld per paal</p>
      <p class="overview-value">${nf.format(Math.round(avgCyclists))}</p>
    </article>
    <article class="overview-card">
      <p class="overview-label">Top telpaal</p>
      <p class="overview-value">${sortedPoints[0] ? sortedPoints[0].name : "Onbekend"}</p>
    </article>
  </section>

  <section class="ranking-card">
    <div class="ranking-header">
      <h3>Ranking van telpalen</h3>
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
          </tr>
        </thead>
        <tbody>
          ${sortedPoints.map((p, i) => {
            const share = totalCyclists > 0 ? (p.total / totalCyclists) * 100 : 0;
            const year = Number.isFinite(p.bouwjaar) ? String(Math.trunc(p.bouwjaar)) : "Onbekend";
            return html`<tr>
              <td class="rank-cell">${i + 1}</td>
              <td>${p.name}</td>
              <td>${p.code}</td>
              <td>${nf.format(p.total)}</td>
              <td>${share.toFixed(2)}%</td>
              <td>${year}</td>
            </tr>`;
          })}
        </tbody>
      </table>
    </div>
  </section>

  <section class="overview-grid">
    <article class="overview-card">
      <p class="overview-label">Oudste telpaal</p>
      <p class="overview-value">${oldestPole ? `${oldestPole.name} (${Math.trunc(oldestPole.bouwjaar)})` : "Onbekend"}</p>
    </article>
    <article class="overview-card">
      <p class="overview-label">Nieuwste telpaal</p>
      <p class="overview-value">${newestPole ? `${newestPole.name} (${Math.trunc(newestPole.bouwjaar)})` : "Onbekend"}</p>
    </article>
    <article class="overview-card">
      <p class="overview-label">Top 3 samen</p>
      <p class="overview-value">${nf.format(sortedPoints.slice(0, 3).reduce((sum, d) => sum + d.total, 0))}</p>
    </article>
    <article class="overview-card">
      <p class="overview-label">Mediaan (ruw)</p>
      <p class="overview-value">${(() => {
        if (sortedPoints.length === 0) return "0";
        const asc = [...sortedPoints].map((d) => d.total).sort((a, b) => a - b);
        const mid = Math.floor(asc.length / 2);
        const med = asc.length % 2 ? asc[mid] : (asc[mid - 1] + asc[mid]) / 2;
        return nf.format(Math.round(med));
      })()}</p>
    </article>
  </section>
</div>

<div class="grid grid-cols-1">
  <div class="card map-card">
    ${kaart}
  </div>
</div>

<div class="grid grid-cols-1" style="margin-top: 0.5rem;">
  <p class="map-caption">Klik op een pin om de gegevens van die telpaal in het infopaneel te zien.</p>
</div>