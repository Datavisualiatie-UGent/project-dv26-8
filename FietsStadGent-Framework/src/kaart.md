---
toc: false
theme: dashboard
---

# Kaart van fietstelpalen in Gent

```js
import L from "npm:leaflet";
```

```js
const locaties = await FileAttachment("data/locaties.json").json();
const bikeSummary = await FileAttachment("data/fietspalen.json").json();

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
```

```js
const kaart = resize((width) => {
  const shell = document.createElement("div");
  shell.className = "kaart-shell";
  shell.style.position = "relative";
  shell.style.width = "100%";
  shell.style.height = "42vh";
  shell.style.minHeight = "42vh";
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

  // After adding the tile layer, add a world mask with a Ghent hole
  const ghentBounds = [
    [51.15, 3.55],  // NW corner (lat, lon)
    [51.15, 3.85],  // NE
    [50.95, 3.85],  // SE  
    [50.95, 3.55],  // SW
  ];
  
  // World polygon with a hole cut out for Ghent
  const worldWithHole = {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [
        // Outer ring: whole world
        [[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]],
        // Inner ring: Ghent hole (counter-clockwise = hole)
        [...ghentBounds.map(([lat, lon]) => [lon, lat]).reverse(), [ghentBounds[0][1], ghentBounds[0][0]]]
      ]
    }
  };

  L.geoJSON(worldWithHole, {
    style: {
      fillColor: "#888",
      fillOpacity: 0.45,
      stroke: false
    }
  }).addTo(map);

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

  function renderPanel(point) {
    if (!point) {
      panel.replaceChildren();
      const introTitle = document.createElement("h3");
      introTitle.textContent = "Klik op een pin";
      const introText = document.createElement("p");
      introText.textContent = "Bekijk hier de gegevens van een telpaal.";
      panel.append(introTitle, introText);
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

  // Fit map to show all pins with some padding:
  if (bounds.isValid()) {
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13 });
  }

  if (points.length > 0) renderPanel(points[0]);
  else renderPanel(null);

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
  setTimeout(() => map.invalidateSize(), 0);
  return shell;
});
```

<div class="grid grid-cols-1">
  <div class="card" style="padding: 0; overflow: hidden; border-radius: 12px;">
    ${kaart}
  </div>
</div>

<div class="grid grid-cols-1" style="margin-top: 0.5rem;">
  Klik op een pin om de gegevens van die telpaal in het infopaneel te zien.
</div>