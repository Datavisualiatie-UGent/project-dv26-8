---
toc: false
theme: dashboard
---

```js
import {html} from "npm:htl";
```

<div class="home-hero">
  <p class="home-hero-eyebrow">Datavisualisatie · UGent 2025–2026</p>
  <h1 class="home-hero-title">Is Gent écht een <em>fietsstad</em>?</h1>
  <p class="home-hero-subtitle">Een interactief dashboard op basis van fietstelpaaldata van Stad Gent — inzicht in fietsstromen, trends en druktepatronen in de Gentse straten.</p>
  <div class="home-cta-group">
    <a class="home-cta-primary" href="./global">Bekijk alle telpalen →</a>
    <a class="home-cta-secondary" href="./countingPole">Detailpagina per paal</a>
  </div>
</div>

<div class="stat-strip">
  <div class="stat-item">
    <p class="stat-number">14</p>
    <p class="stat-desc">Fietstelpalen</p>
  </div>
  <div class="stat-item">
    <p class="stat-number">67M+</p>
    <p class="stat-desc">Geregistreerde fietsers</p>
  </div>
  <div class="stat-item">
    <p class="stat-number">2018–2026</p>
    <p class="stat-desc">Meetperiode</p>
  </div>
</div>

<div class="home-about-block">
  <p class="home-section-label">Over de data</p>
  <h2 class="home-section-heading">Stad Gent Open Data</h2>
  <p>
    Gent heeft automatische fietstelpalen die elke 5 minuten het aantal passerende fietsers registreren — in beide richtingen. Deze open data is beschikbaar via het open dataplatform van Stad Gent en vormt de basis van alle visualisaties op deze site.
  </p>
  <a class="home-data-source-link" href="https://data.stad.gent/explore/?disjunctive.theme&sort=modified&q=fietstelpalen" target="_blank" rel="noopener noreferrer">
    🔗 Open data Stad Gent
  </a>
</div>

<p class="home-section-label">Onderzoeksvragen</p>
<h2 class="home-section-heading">Wat willen we weten?</h2>
<p class="home-section-body">We analyseren de fietsteldata vanuit verschillende invalshoeken om een compleet beeld te vormen van het fietsgedrag in Gent.</p>

<div class="home-questions-grid">
  <div class="home-question-card"><p><span>📈</span>Is er een stijgende langetermijntrend in fietsgebruik?</p></div>
  <div class="home-question-card"><p><span>📍</span>Welke locaties trekken de meeste fietsers aan?</p></div>
  <div class="home-question-card"><p><span>🗓️</span>Hoe varieert het gebruik doorheen de seizoenen en de week?</p></div>
  <div class="home-question-card"><p><span>⏱️</span>Zijn er duidelijke spitsuren zichtbaar in de uurdata?</p></div>
  <!-- <div class="home-question-card"><p><span>🔁</span>Wat vertelt het verschil in rijrichting over pendel vs. recreatie?</p></div> -->
  <div class="home-question-card"><p><span>🆚</span>Hoe verschillen telpalen onderling van profiel en volume?</p></div>
</div>

<p class="home-section-label">Pagina's</p>
<h2 class="home-section-heading">Verken de data</h2>
<p class="home-section-body">De site is opgebouwd uit drie hoofdpagina's, elk met een eigen focus en visualisatieset.</p>

<div class="home-nav-cards">
  <a class="home-nav-card" href="./global">
    <span class="home-nav-card-icon">🗺️</span>
    <p class="home-nav-card-title">Globaal overzicht</p>
    <p class="home-nav-card-desc">Interactieve kaart van alle telpalen, ranking van de telpalen, maandelijkse drukte doorheen de jaren, dagelijkse heatmap en trendlijnen over alle jaren.</p>
    <span class="home-nav-card-arrow">Bekijk pagina →</span>
  </a>
  <a class="home-nav-card" href="./countingPole">
    <span class="home-nav-card-icon">📊</span>
    <p class="home-nav-card-title">Telpaal detail</p>
    <p class="home-nav-card-desc">Zoom in op één specifieke telpaal: locatieinfo, verkeersprofiel, maandgrafiek, dagelijkse heatmap en vergelijking tussen jaren.</p>
    <span class="home-nav-card-arrow">Bekijk pagina →</span>
  </a>
  <a class="home-nav-card" href="./comparison">
    <span class="home-nav-card-icon">⚖️</span>
    <p class="home-nav-card-title">Vergelijking</p>
    <p class="home-nav-card-desc">Leg meerdere telpalen naast elkaar om verschillen in volume, spitspatronen en seizoensinvloed te ontdekken.</p>
    <span class="home-nav-card-arrow">Bekijk pagina →</span>
  </a>
</div>

<div class="home-footer-note">
  Data afkomstig van <a href="https://data.stad.gent" target="_blank" rel="noopener">data.stad.gent</a> · Datavisualisatie UGent 2025–2026 · FietsStadGent
</div>
