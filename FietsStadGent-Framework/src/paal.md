---
title: Telpaal Detail
toc: false
theme: dashboard
---

```js
import {html} from "npm:htl";

const locaties = await FileAttachment("data/locaties.json").json();
const bikeSummary = await FileAttachment("data/fietspalen.json").json();

const params = new URLSearchParams(location.search);
const code = params.get("code") || (bikeSummary.codeTotals?.[0]?.code ?? null);

const locationByCode = new Map(locaties.map((d) => [d.code, d]));
const totalByCode = new Map((bikeSummary.codeTotals || []).map((d) => [d.code, d]));

const pole = code ? locationByCode.get(code) : null;
const stats = code ? totalByCode.get(code) : null;

const totals = [...(bikeSummary.codeTotals || [])].sort((a, b) => b.total - a.total);
const totalCyclistsAll = totals.reduce((sum, d) => sum + (Number.isFinite(d.total) ? d.total : 0), 0);
const rank = code ? totals.findIndex((d) => d.code === code) + 1 : 0;
const poleCount = totals.length;
const share = stats && totalCyclistsAll > 0 ? (stats.total / totalCyclistsAll) * 100 : null;

const hasCoords = pole && Number.isFinite(pole.lat) && Number.isFinite(pole.long);
const buildYear = Number.isFinite(pole?.bouwjaar) ? String(Math.trunc(pole.bouwjaar)) : "Onbekend";
const startDate = pole?.begindatum || pole?.begindatumIso || "Onbekend";
const owner = pole?.eigenaar || "Onbekend";
const totalLabel = stats ? stats.total.toLocaleString("nl-BE") : "-";
const rankLabel = stats && rank > 0 ? `${rank} / ${poleCount}` : "-";
const shareLabel = share != null ? `${share.toFixed(2)}%` : "-";
const osmHref = hasCoords
  ? `https://www.openstreetmap.org/?mlat=${pole.lat}&mlon=${pole.long}#map=17/${pole.lat}/${pole.long}`
  : null;

const poleContent = pole
  ? html`<section class="pole-hero">
        <h2>${pole.naam || pole.code}</h2>
        <div class="pole-subtitle">Code ${pole.code} · Fietstelpaal in Gent</div>
      </section>

      <section class="pole-grid">
        <article class="pole-card">
          <h3>Algemene info</h3>
          <dl class="pole-list">
            <dt>Code</dt><dd>${pole.code}</dd>
            <dt>Eigenaar</dt><dd>${owner}</dd>
            <dt>Bouwjaar</dt><dd>${buildYear}</dd>
            <dt>Begindatum</dt><dd>${startDate}</dd>
          </dl>
        </article>

        <article class="pole-card">
          <h3>Locatie</h3>
          <dl class="pole-list">
            <dt>Lat</dt><dd>${hasCoords ? pole.lat.toFixed(6) : "Onbekend"}</dd>
            <dt>Long</dt><dd>${hasCoords ? pole.long.toFixed(6) : "Onbekend"}</dd>
            <dt>Point X</dt><dd>${Number.isFinite(pole.point_x) ? pole.point_x.toFixed(4) : "Onbekend"}</dd>
            <dt>Point Y</dt><dd>${Number.isFinite(pole.point_y) ? pole.point_y.toFixed(4) : "Onbekend"}</dd>
          </dl>
        </article>
      </section>

      <section class="pole-card">
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

      <section class="pole-actions">
        <a class="pole-button primary" href="/fietspalen">Terug naar kaart</a>
        ${osmHref
          ? html`<a class="pole-button secondary" target="_blank" rel="noopener noreferrer" href="${osmHref}">Bekijk op OSM</a>`
          : null}
      </section>
    `
  : html`<section class="pole-hero">
        <h2>Telpaal niet gevonden</h2>
        <div class="pole-subtitle">Kies een telpaal via de kaart om detailinformatie te bekijken.</div>
      </section>
      <section class="pole-actions">
        <a class="pole-button primary" href="/fietspalen">Ga naar de kaart</a>
      </section>
    `;
```

<style>
  .pole-page-shell {
    box-sizing: border-box;
    width: 100%;
    margin: 0;
    max-width: none;
    padding-top: 0.2rem;
  }

  .pole-page {
    display: grid;
    gap: 0.95rem;
    width: 100%;
    max-width: none;
  }

  .pole-hero {
    background: linear-gradient(135deg, #0f766e 0%, #0f172a 100%);
    color: #fff;
    border-radius: 14px;
    padding: 1rem 1.1rem;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.22);
  }

  .pole-hero h2 {
    margin: 0;
    font-size: 1.3rem;
    line-height: 1.25;
  }

  .pole-subtitle {
    margin-top: 0.35rem;
    color: rgba(255, 255, 255, 0.88);
    font-size: 0.9rem;
  }

  .pole-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.8rem;
  }

  .pole-card {
    border-radius: 12px;
    padding: 0.85rem;
    background: #ffffff;
    border: 1px solid rgba(15, 118, 110, 0.18);
    box-shadow: 0 6px 20px rgba(15, 23, 42, 0.08);
  }

  .pole-card h3 {
    margin: 0 0 0.55rem;
    font-size: 0.95rem;
    color: #0f172a;
  }

  .pole-list {
    display: grid;
    grid-template-columns: 6.2rem 1fr;
    gap: 0.25rem 0.55rem;
    margin: 0;
  }

  .pole-list dt {
    margin: 0;
    font-size: 0.72rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    font-weight: 700;
  }

  .pole-list dd {
    margin: 0;
    color: #0f172a;
    font-size: 0.86rem;
    overflow-wrap: anywhere;
  }

  .pole-metrics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.6rem;
  }

  .metric {
    border-radius: 10px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 0.55rem 0.6rem;
  }

  .metric-label {
    margin: 0;
    color: #64748b;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-weight: 700;
  }

  .metric-value {
    margin: 0.15rem 0 0;
    color: #0f172a;
    font-size: 1rem;
    font-weight: 700;
  }

  .pole-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
  }

  .pole-button {
    display: inline-block;
    text-decoration: none;
    font-weight: 700;
    font-size: 0.82rem;
    border-radius: 999px;
    padding: 0.52rem 0.9rem;
    transition: transform 120ms ease;
  }

  .pole-button.primary {
    color: #fff !important;
    -webkit-text-fill-color: #fff;
    background: #0f766e;
  }

  .pole-button.secondary {
    color: #0f172a !important;
    -webkit-text-fill-color: #0f172a;
    background: #e2e8f0;
  }

  .pole-button:hover {
    transform: translateY(-1px);
  }

  @media (max-width: 760px) {
    .pole-page-shell {
      width: 100%;
      margin-left: 0;
      margin-right: 0;
    }

    .pole-grid {
      grid-template-columns: 1fr;
    }

    .pole-metrics {
      grid-template-columns: 1fr;
    }
  }
</style>

<div class="pole-page-shell">
  <div class="pole-page">
    ${poleContent}
  </div>
</div>
