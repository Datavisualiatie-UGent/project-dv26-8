---
toc: false
theme: dashboard
---

<div class="hero">
  <h1>FietsStadGent</h1>
  <h2>Is Gent echt een fietshoofdstad? Start hier met jullie visualisatieproject.</h2>
</div>

<div class="grid grid-cols-3" style="grid-auto-rows: 1fr;">
  <a class="card nav-card" href="/visualisaties-plot">
    <h3>Observable Plot</h3>
    <p>Snel interactieve grafieken op basis van declaratieve syntax.</p>
  </a>
  <a class="card nav-card" href="/visualisaties-d3">
    <h3>D3.js</h3>
    <p>Laag-niveau controle voor maatwerk visualisaties en interactie.</p>
  </a>
  <a class="card nav-card" href="/visualisaties-vega-lite">
    <h3>Vega-Lite</h3>
    <p>Grammar of graphics met compacte specs en sterke defaults.</p>
  </a>
</div>

---

## Volgende stappen

- Plaats jullie eigen data loaders in `src/data`.
- Hergebruik functies in `src/components` wanneer meerdere pagina's dezelfde logica nodig hebben.
- Gebruik de drie starterpagina's om snel te beslissen welke framework het best past per visualisatie.

<style>

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--sans-serif);
  margin: 4rem 0 8rem;
  text-wrap: balance;
  text-align: center;
}

.hero h1 {
  margin: 1rem 0;
  padding: 1rem 0;
  max-width: none;
  font-size: 14vw;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(30deg, var(--theme-foreground-focus), currentColor);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero h2 {
  margin: 0;
  max-width: 34em;
  font-size: 20px;
  font-style: initial;
  font-weight: 500;
  line-height: 1.5;
  color: var(--theme-foreground-muted);
}

@media (min-width: 640px) {
  .hero h1 {
    font-size: 90px;
  }
}

.nav-card {
  color: inherit;
  text-decoration: none;
}

.nav-card h3 {
  margin-top: 0;
}

</style>
