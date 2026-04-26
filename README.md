# Datavisualisatie Project: Fietsstad Gent

## project assignment

- Selection of 3 datasets with ideas of what to do with it
- Visualisation as source code of HTML/CSS/JS using GitHub
  - Part A: tell a story
  - Part B: explorative
- Final presentation
- Project report
  - Not a formal document
  - Dataset source, key cleaning/transformation steps, design rationale
  - Document your progress, prototypes, ideas, ...
  - Don’t forget this!

## Tools we can use

- Low-level framework
  - **D3.js**
    - Low-level JavaScript framework
    - Bridges your data with the DOM
    - Great for custom and interactive visualizations
    - A lot of work for basic graphs
- High-level framework
  - **Vega Lite**
    - High-level descriptive framework
    - Follow grammar of graphics
    - Great for basic visualizations
    - A lot of work for complex graphs
  - **Observable Plot**
    - High-level descriptive framework
    - Follow grammar of graphics
    - Great for basic visualizations
    - A lot of work for complex graphs
- Dashboards
  - **Observable Framwork**
    - Static site generator
    - Server side code wrangling when building
    - Client side visualizations

## Chosen project proposal: Is Gent écht een fietshoofdstad?

We willen onderzoeken of Gent haar reputatie als fietsstad effectief weerspiegeld wordt in de beschikbare data van fietstelpalen. Aan de hand van open data van Stad Gent analyseren we hoe het fietsverkeer evolueert doorheen de jaren, hoe sterk seizoensinvloeden zijn en welke locaties structureel het drukst zijn.

We onderzoeken onder andere:

- Is er een stijgende trend in fietsgebruik?
- Welke telpalen registreren de meeste fietsers?
- Hoe verschillen weekdagen van weekends?
- Zijn er duidelijke piekmomenten tijdens ochtend- en avondspits?
- Inpak van covid

Het doelpubliek is zowel Gentse inwoners als studenten en beleidsmakers met interesse in mobiliteit. Hiermee tonen we aan in welke mate Gent haar imago als fietsstad waarmaakt. Indien tijd overblijft willen we onderzoeken of opvallende veranderingen samenhangen met externe factoren zoals COVID-maatregelen, het weer, ...

Fietstelpaal data in gent: <https://data.stad.gent/explore/?disjunctive.theme&sort=modified&refine.theme=Mobiliteit&refine.publisher=Mobiliteitsbedrijf+Gent&q=fietstelpaal>

## Proposals of what we can do with our data

### Map

Pinnen op de map brengen ons naar de page met alle data/grafieken voor die telpaal <span style="color:green">(Chosen)</span>

### Globaal

- Drukte lijn van oudste tot nieuwste datapunt (groei) <span style="color:green">(Chosen)</span>
  - Globale invloed van de seizoenen/schoolperiode/COVID tonen
  - Zet een verticale lijn om periodes aan te duiden
  - => zijn er sprongen in de data (covid, zomer, ...) <span style="color:red">(Not Chosen)</span>
- Trendlijn die de verschillende jaren vergelijkt <span style="color:green">(Chosen)</span>
- Heatmap doorheen het jaar (van het jaar (kies jaar))
- Map die de drukte van de telpalen toont doorheen de tijd (per maand) <span style="color:red">(Not Chosen)</span>

### Per telpaal

- Drukte lijn van oudste tot nieuwste datapunt <span style="color:green">(Chosen)</span>
- Trendlijn die de verschillende jaren vergelijkt <span style="color:green">(Chosen)</span>
- Heatmap drukte doorheen het jaar (kies jaar) => toon drukte van die dag per 15 min?
- Toon inkomen en uitkomende fietsers
  - => is het een fietsstad?
  - => veel pendel?
- Toon gemiddeld trend van de week, om aan te tonen dat er in de week meer gefietst wordt (functioneel vs recreatief) (all years avg, specific year avg) <span style="color:green">(Chosen)</span>
- Invloed weer (als we data ervoor vinden en tijd hebben) <span style="color:red">(Not Chosen)</span>

### Verschil tussen telpalen: (1-4 palen (aanraden))

- Verschil in drukte (dag/week/maand/jaar) (meest gebruikt)
- Verschil in de spitsen
- Specifiek de palen die binnen <-> buiten centrum gaan vergelijken
  - Is er een trend dat aantoont dat er smorgens meer naar centrum gaan en savonds uit centrum??
- Verschil tussen pendel weg en recreatieve weg
- De palen langs het water zijn populair vermelden
- Stabiele palen vs palen met alleen pieken (bv rond universiteit campus vs rand van stad)
