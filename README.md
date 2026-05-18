# Datavisualisatie Project: Fietsstad Gent

Projectsite: <https://datavisualiatie-ugent.github.io/project-dv26-8/>

Verslag: [DV verslag.pdf](DV%20verslag.pdf)

Data en verwerkingspipeline: [dataset.md](dataset.md)

## Korte omschrijving

Dit project onderzoekt of Gent haar reputatie als fietsstad ook zichtbaar maakt in de data van de fietstelpalen van Stad Gent. We analyseren evoluties doorheen de tijd, seizoensinvloeden, spitsmomenten en verschillen tussen locaties.

## Wat staat er in deze repository?

- `data/`: ruwe databestanden, preprocessing-scripts en prototype-assets
- `FietsStadGent-Framework/`: de Observable Framework-site met de uiteindelijke visualisaties

## De site lokaal draaien

1. Ga naar `FietsStadGent-Framework/`
2. Installeer dependencies met `npm install`
3. Start de lokale preview met `npm run dev`
4. Bouw de site voor validatie met `npm run build`

## Belangrijkste pagina's

- `/global`: detailpagina van alle telpalen samen
- `/countingPole?code=...`: detailpagina per telpaal
- `/comparison`: Hier kunnen verschillende telpalen vergelijkt wordne

## Onderzoeksfocus

De kern van het project is de vraag: is Gent echt een fietshoofdstad? We bekijken onder meer:

- de langetermijntrend in fietsgebruik
- de drukste telpalen
- verschillen tussen weekdagen en weekends
- ochtend- en avondspits
- mogelijke effecten van COVID en andere externe factoren

## Opbouw van het project

Het project combineert data cleaning, analyse en visuele storytelling. De rapportering in [DV verslag.pdf](DV%20verslag.pdf) beschrijft de brondata, de belangrijkste transformaties en de gemaakte ontwerpkeuzes.
