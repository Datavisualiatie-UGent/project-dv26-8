---
title: Vergelijking
toc: false
theme: dashboard
---

```js
import * as Inputs from "@observablehq/inputs";
import {Generators} from "@observablehq/stdlib";
import {drukte} from "./components/drukteCompare.js";
import * as d3 from "d3";
```

```js
const locations = await FileAttachment("data/locations.json").json();
const monthlyPerLocation = await FileAttachment("data/monthlyPerLocation.json").json();

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
// .sort((a, b) => (b.avg - a.avg))
.sort((a, b) => a.month - b.month);

const selectLocations = Inputs.checkbox(
  locations.map((d) => d.code),
  {
    value: locations.slice(0, 2).map(d => d.code),
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
```

<div class="page">
  <section class="page-hero">
    <h2>Vergelijking van telpalen</h2>
    <div class="page-hero-subtitle">Leg meerdere fietstelpalen naast elkaar en ontdek verschillen in volume, spitspatronen en seizoensinvloed.</div>
  </section>

  <section class="card card--detail">
    <p style="margin:0; font-size:0.9rem; color:var(--text-muted); line-height:1.6;">
      Op deze pagina kan je <strong>twee of meer telpalen vergelijken</strong>. Dat is nuttig om te zien of bepaalde locaties structureel drukker zijn, of om te achterhalen welke palen een sterk pendelpatroon vertonen versus een meer recreatief profiel. Zo kan je bijvoorbeeld de Coupure Links — een drukke invalsweg — vergelijken met de Spoorwegbrug Drongen, een fietssnelweg verder van het centrum.
    </p>
  </section>

  <section class="comparison-grid">
    <article class="card card--detail">
      <h3>Selectie van telpalen</h3>
      <p class="section-copy">Selecteer hier de telpalen die je wil vergelijken. Je kan kiezen op naam of code. De grafieken rechts en hieronder worden automatisch bijgewerkt op basis van je selectie.</p>
      <p class="section-copy" style="margin-top:0.6rem; font-style:italic; opacity:0.7;">— Keuzeveld komt hier —</p>
    </article>
    <article class="card card--detail">
      <h3>Snel vergelijken</h3>
      <p class="section-copy">Interessante combinaties om te verkennen:</p>
      <ul style="font-size:0.88rem; color:var(--text-muted); line-height:2; margin:0.4rem 0 0; padding-left:1.2rem;">
        <li><strong>Groendreef vs. Coupure Links</strong> — twee drukke kanaalroutes</li>
        <li><strong>Visserij vs. Dampoort-Zuid</strong> — centrum vs. stadsrand</li>
        <li><strong>HAV vs. SAS</strong> — twee palen op de F400 fietssnelweg</li>
        <li><strong>DRO vs. BIK</strong> — buitenste ring vs. binnenstad</li>
      </ul>
    </article>
  </section>

  <section class="card card--detail">
    <h3>Totaalvolume per telpaal</h3>
    <p class="section-copy">De staafgrafiek hieronder toont het cumulatief totaal voor elke geselecteerde telpaal, zodat je in één oogopslag ziet welke locatie het meest bezocht wordt over de volledige meetperiode.</p>
    <p class="section-copy" style="font-style:italic; opacity:0.7;">— Grafiek wordt hier toegevoegd —</p>
    <h2>Vergelijking</h2>
    <div class="page-hero-subtitle">Vergelijk meerdere fietstelpalen met elkaar.</div>
  </section>

  <section class="card card--detail">
    <h3>Selectie van telpalen</h3>
    <div class="pole-options">
      ${selectLocations}
    </div>
  </section>

  <section class="card card--detail">
    <h3>Verkeersprofielen</h3>
    ${selectedLocations.map(location => verkeersprofielPlot(location))}
  </section>

  <section class="card card--detail">
    <h3>Maandelijkse drukte</h3>
    ${resize((width) => drukte(normalizedMonthlyPerLocation.filter(d => selectedLocations.includes(d.code)), "Aantal fietsers", {width, height: 400}))}
  </section>

  <section class="comparison-grid">
    <article class="card card--detail">
      <h3>Maandelijkse vergelijking</h3>
      <p class="section-copy">Overlappende lijnen tonen de maandelijkse drukte voor elke geselecteerde telpaal. Zo zie je of het seizoenspatroon voor alle locaties gelijk loopt, of dat sommige palen pieken op andere momenten — wat kan wijzen op een ander gebruik (pendel, school, recreatie).</p>
      <p class="section-copy" style="font-style:italic; opacity:0.7;">— Grafiek wordt hier toegevoegd —</p>
    </article>
    <article class="card card--detail">
      <h3>Weekdagprofiel</h3>
      <p class="section-copy">Het gemiddeld aantal fietsers per weekdag onthult of een telpaal voornamelijk pendel- of recreatief gebruik kent. Werkdagpieken (ma–vr) wijzen op pendelroutes; weekendpieken suggereren recreatieve trajecten.</p>
      <p class="section-copy" style="font-style:italic; opacity:0.7;">— Grafiek wordt hier toegevoegd —</p>
    </article>
  </section>

  <section class="card card--detail">
    <h3>Uurlijks patroon</h3>
    <p class="section-copy">De uurlijkse grafiek toont het gemiddeld aantal fietsers per uur van de dag. Op pendelroutes verwacht je twee duidelijke pieken: een ochtendspits (7–9u) en een avondspits (16–18u). Op recreatieve routes is de spreiding gelijkmatiger, met een piek in de late ochtend of middag.</p>
    <p class="section-copy" style="font-style:italic; opacity:0.7;">— Grafiek wordt hier toegevoegd —</p>
  </section>

  <section class="card card--detail">
    <h3>Voorbereiding</h3>
    <p class="section-copy">De pagina maakt gebruik van dezelfde datastroom als de globale en detailpagina's. De vergelijkingslogica leest <code>monthlyPerLocation.json</code>, <code>dailyPerLocation.json</code> en de trendbestanden op, en filtert deze op de geselecteerde telpaalcodes. Nieuwe grafieken kunnen hier naadloos worden ingevoegd.</p>
  </section>
</div>