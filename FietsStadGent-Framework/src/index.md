---
toc: false
theme: dashboard
---

```js
import {html} from "npm:htl";
```

<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  .hero-section {
    padding: 0rem 0 1.5rem;
    text-align: center;
    position: relative;
  }

  .hero-eyebrow {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--accent, #0f766e);
    margin: 1rem auto 1rem;
    max-width: 560px;
  }

  .hero-title {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: clamp(2.8rem, 8vw, 5.5rem);
    font-weight: 400;
    line-height: 1.05;
    color: var(--text-main, #0f172a);
    margin: 1.2rem auto 1.5rem;
    letter-spacing: -0.02em;
  }

  .hero-title em {
    font-style: italic;
    color: var(--accent, #0f766e);
  }

  .hero-subtitle {
    font-family: 'DM Sans', sans-serif;
    font-size: 1.15rem;
    font-weight: 300;
    color: var(--text-muted, #475569);
    max-width: 560px;
    margin: 1.2rem auto 2.5rem;
    line-height: 1.65;
  }

  .hero-cta-group {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 0.5rem;
  }

  .cta-primary {
    display: inline-block;
    background: var(--accent, #0f766e);
    color: #fff !important;
    -webkit-text-fill-color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem;
    font-weight: 600;
    padding: 0.72rem 1.4rem;
    border-radius: 999px;
    text-decoration: none;
    letter-spacing: 0.02em;
    transition: background 0.15s, transform 0.15s;
  }

  .cta-primary:hover {
    background: #115e59;
    transform: translateY(-1px);
  }

  .cta-secondary {
    display: inline-block;
    background: transparent;
    color: var(--text-main, #0f172a) !important;
    -webkit-text-fill-color: var(--text-main, #0f172a);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem;
    font-weight: 500;
    padding: 0.72rem 1.4rem;
    border-radius: 999px;
    border: 1.5px solid #cbd5e1;
    text-decoration: none;
    transition: border-color 0.15s, transform 0.15s;
  }

  .cta-secondary:hover {
    border-color: var(--accent, #0f766e);
    transform: translateY(-1px);
  }

  .stat-strip {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: var(--border-subtle, #dbe7ef);
    border: 1px solid var(--border-subtle, #dbe7ef);
    border-radius: 14px;
    overflow: hidden;
    margin-bottom: 3rem;
  }

  .stat-item {
    background: var(--surface, #fff);
    padding: 1.4rem 1.2rem;
    text-align: center;
  }

  .stat-number {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: 2.2rem;
    color: var(--accent, #0f766e);
    line-height: 1;
    margin: 0 0 0.3rem;
  }

  .stat-desc {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    color: var(--text-muted, #475569);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin: 0;
  }

  .section-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-label, #64748b);
    margin: 0 0 1.2rem;
  }

  .section-heading {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: 1.8rem;
    font-weight: 400;
    color: var(--text-main, #0f172a);
    margin: 0 0 0.6rem;
    line-height: 1.2;
  }

  .section-body {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.95rem;
    color: var(--text-muted, #475569);
    line-height: 1.65;
    max-width: 640px;
    margin: 0 0 2rem;
  }

  .nav-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 3rem;
  }

  .nav-card-link {
    text-decoration: none;
    display: block;
    border-radius: 14px;
    border: 1px solid var(--border-subtle, #dbe7ef);
    background: var(--surface, #fff);
    padding: 1.4rem 1.3rem;
    transition: box-shadow 0.18s, transform 0.18s, border-color 0.18s;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
    position: relative;
    overflow: hidden;
  }

  .nav-card-link::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: var(--accent, #0f766e);
    opacity: 0;
    transition: opacity 0.18s;
  }

  .nav-card-link:hover {
    box-shadow: 0 8px 24px rgba(15, 118, 110, 0.12);
    transform: translateY(-2px);
    border-color: rgba(15, 118, 110, 0.3);
  }

  .nav-card-link:hover::before {
    opacity: 1;
  }

  .nav-card-icon {
    font-size: 1.8rem;
    margin-bottom: 0.8rem;
    display: block;
  }

  .nav-card-title {
    font-family: 'DM Sans', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-main, #0f172a);
    margin: 0 0 0.4rem;
  }

  .nav-card-desc {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.84rem;
    color: var(--text-muted, #475569);
    line-height: 1.5;
    margin: 0;
  }

  .nav-card-arrow {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    margin-top: 0.9rem;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--accent, #0f766e);
    letter-spacing: 0.03em;
  }

  .about-block {
    background: linear-gradient(135deg, #0f766e 0%, #0f172a 100%);
    border-radius: 14px;
    padding: 2.2rem 2rem;
    color: #fff;
    margin-bottom: 3rem;
    position: relative;
    overflow: hidden;
  }

  .about-block::after {
    content: '🚲';
    position: absolute;
    right: 2rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 5rem;
    opacity: 0.12;
  }

  .about-block .section-label {
    color: rgba(255,255,255,0.6);
    margin-bottom: 0.8rem;
  }

  .about-block .section-heading {
    color: #fff;
    font-size: 1.5rem;
    margin-bottom: 0.7rem;
  }

  .about-block p {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.93rem;
    color: rgba(255,255,255,0.85);
    line-height: 1.65;
    max-width: 600px;
    margin: 0 0 1.1rem;
  }

  .data-source-link {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background: rgba(255,255,255,0.12);
    color: #fff !important;
    -webkit-text-fill-color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.82rem;
    font-weight: 600;
    padding: 0.5rem 1rem;
    border-radius: 999px;
    text-decoration: none;
    border: 1px solid rgba(255,255,255,0.25);
    transition: background 0.15s;
  }

  .data-source-link:hover {
    background: rgba(255,255,255,0.2);
  }

  .questions-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
    margin-bottom: 3rem;
  }

  .question-card {
    border: 1px solid var(--border-subtle, #dbe7ef);
    border-radius: 12px;
    padding: 1.1rem 1.2rem;
    background: var(--surface-muted, #f8fafc);
  }

  .question-card p {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem;
    color: var(--text-main, #0f172a);
    margin: 0;
    line-height: 1.5;
    font-weight: 500;
  }

  .question-card span {
    font-size: 1.1rem;
    margin-right: 0.5rem;
  }

  .footer-note {
    text-align: center;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.8rem;
    color: var(--text-label, #64748b);
    padding: 2rem 0;
    border-top: 1px solid var(--border-soft, #e2e8f0);
  }

  @media (max-width: 760px) {
    .nav-cards { grid-template-columns: 1fr; }
    .stat-strip { grid-template-columns: 1fr; }
    .questions-grid { grid-template-columns: 1fr; }
    .about-block::after { display: none; }
  }

  @media (max-width: 640px) {
    .hero-title { font-size: 2.4rem; }
  }
</style>

<div class="hero-section">
  <p class="hero-eyebrow">Datavisualisatie · UGent 2025–2026</p>
  <h1 class="hero-title">Is Gent écht een <em>fietsstad</em>?</h1>
  <p class="hero-subtitle">Een interactief dashboard op basis van fietstelpaaldata van Stad Gent — inzicht in fietsstromen, trends en druktepatronen in de Gentse straten.</p>
  <div class="hero-cta-group">
    <a class="cta-primary" href="/fietspalen">Bekijk alle telpalen →</a>
    <a class="cta-secondary" href="/paal">Detailpagina per paal</a>
  </div>
</div>

<div class="stat-strip">
  <div class="stat-item">
    <p class="stat-number">14</p>
    <p class="stat-desc">Fietstelpalen</p>
  </div>
  <div class="stat-item">
    <p class="stat-number">70M+</p>
    <p class="stat-desc">Geregistreerde fietsers</p>
  </div>
  <div class="stat-item">
    <p class="stat-number">2018–2026</p>
    <p class="stat-desc">Meetperiode</p>
  </div>
</div>

<div class="about-block">
  <p class="section-label">Over de data</p>
  <h2 class="section-heading">Stad Gent Open Data</h2>
  <p>
    Gent heeft automatische fietstelpalen die elke 5 minuten het aantal passerende fietsers registreren — in beide richtingen. Deze open data is beschikbaar via het open dataplatform van Stad Gent en vormt de basis van alle visualisaties op deze site.
  </p>
  <a class="data-source-link" href="https://data.stad.gent/explore/?disjunctive.theme&sort=modified&q=fietstelpalen" target="_blank" rel="noopener noreferrer">
    🔗 Open data Stad Gent
  </a>
</div>

<p class="section-label">Onderzoeksvragen</p>
<h2 class="section-heading">Wat willen we weten?</h2>
<p class="section-body">We analyseren de fietsteldata vanuit verschillende invalshoeken om een compleet beeld te vormen van het fietsgedrag in Gent.</p>

<div class="questions-grid">
  <div class="question-card"><p><span>📈</span>Is er een stijgende langetermijntrend in fietsgebruik?</p></div>
  <div class="question-card"><p><span>📍</span>Welke locaties trekken de meeste fietsers aan?</p></div>
  <div class="question-card"><p><span>🗓️</span>Hoe varieert het gebruik doorheen de seizoenen en de week?</p></div>
  <div class="question-card"><p><span>⏱️</span>Zijn er duidelijke spitsuren zichtbaar in de uurdata?</p></div>
  <!-- <div class="question-card"><p><span>🔁</span>Wat vertelt het verschil in rijrichting over pendel vs. recreatie?</p></div> -->
  <div class="question-card"><p><span>🆚</span>Hoe verschillen telpalen onderling van profiel en volume?</p></div>
</div>

<p class="section-label">Pagina's</p>
<h2 class="section-heading">Verken de data</h2>
<p class="section-body">De site is opgebouwd uit drie hoofdpagina's, elk met een eigen focus en visualisatieset.</p>

<div class="nav-cards">
  <a class="nav-card-link" href="/fietspalen">
    <span class="nav-card-icon">🗺️</span>
    <p class="nav-card-title">Globaal overzicht</p>
    <p class="nav-card-desc">Interactieve kaart van alle telpalen, ranking van de telpalen, maandelijkse drukte doorheen de jaren, dagelijkse heatmap en trendlijnen over alle jaren.</p>
    <span class="nav-card-arrow">Bekijk pagina →</span>
  </a>
  <a class="nav-card-link" href="/paal">
    <span class="nav-card-icon">📊</span>
    <p class="nav-card-title">Telpaal detail</p>
    <p class="nav-card-desc">Zoom in op één specifieke telpaal: locatieinfo, verkeersprofiel, maandgrafiek, dagelijkse heatmap en vergelijking tussen jaren.</p>
    <span class="nav-card-arrow">Bekijk pagina →</span>
  </a>
  <a class="nav-card-link" href="/vergelijking">
    <span class="nav-card-icon">⚖️</span>
    <p class="nav-card-title">Vergelijking</p>
    <p class="nav-card-desc">Leg meerdere telpalen naast elkaar om verschillen in volume, spitspatronen en seizoensinvloed te ontdekken.</p>
    <span class="nav-card-arrow">Bekijk pagina →</span>
  </a>
</div>

<div class="footer-note">
  Data afkomstig van <a href="https://data.stad.gent" target="_blank" rel="noopener">data.stad.gent</a> · Datavisualisatie UGent 2025–2026 · FietsStadGent
</div>