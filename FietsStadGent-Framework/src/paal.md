---
title: Telpaal Detail
theme: dashboard
---

# Telpaal detail

```js
const locaties = await FileAttachment("data/locaties.json").json();
const bikeSummary = await FileAttachment("data/fietspalen.json").json();

const params = new URLSearchParams(location.search);
const code = params.get("code") || (bikeSummary.codeTotals?.[0]?.code ?? null);

const locationByCode = new Map(locaties.map((d) => [d.code, d]));
const totalByCode = new Map((bikeSummary.codeTotals || []).map((d) => [d.code, d]));

const pole = code ? locationByCode.get(code) : null;
const stats = code ? totalByCode.get(code) : null;
```

${pole ? `## ${pole.naam || pole.code}` : "## Telpaal niet gevonden"}

${pole ? `Code: ${pole.code}` : "Kies een code via de kaartpagina."}

${stats ? `Totaal geregistreerde fietsers: ${stats.total.toLocaleString("nl-BE")}` : "Geen tellerdata gevonden voor deze code."}

${pole && Number.isFinite(pole.lat) && Number.isFinite(pole.long)
  ? `Locatie: ${pole.lat.toFixed(6)}, ${pole.long.toFixed(6)}`
  : "Locatiecoordinaten niet beschikbaar."}

[Terug naar kaart](/kaart)
