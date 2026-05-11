---
title: Vergelijking
toc: false
theme: dashboard
---

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