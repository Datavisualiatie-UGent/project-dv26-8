import * as d3 from "d3";
import { readFile, writeFile } from "fs/promises";

const filePath = new URL("./data_fietspalen.csv", import.meta.url);

const text = await readFile(filePath, "utf-8");

const data = d3.dsvFormat(";").parse(text, d => ({
  locatie: d.locatie,
  date: new Date(d.datum),
  totaal: +d.totaal
}));

const monthlyPerLocation = d3.rollup(
  data,
  v => d3.sum(v, d => d.totaal),
  d => d.locatie,
  d => d3.timeMonth(d.date)
)

await writeFile(
    new URL("./monthlyPerLocation.json", import.meta.url),
    JSON.stringify(Array.from(monthlyPerLocation, ([locatie, months]) => ({ locatie, months: Array.from(months) })), null, 2)
);

const monthlyAvg = Array.from(
  d3.rollup(
    Array.from(monthlyPerLocation, ([locatie, months]) =>
      Array.from(months, ([month, totaal]) => ({ locatie, month, totaal }))
    ).flat(),
    v => d3.mean(v, d => d.totaal),
    d => d.month
  ),
  ([month, avg]) => ({ month, avg })
)

await writeFile(
  new URL("./monthlyAvg.json", import.meta.url),
  JSON.stringify(monthlyAvg, null, 2)
);