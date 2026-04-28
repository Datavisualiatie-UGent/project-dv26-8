import * as d3 from "d3";
import { readFile } from "fs/promises";

const filePath = new URL("./data_fietspalen.csv", import.meta.url);

async function processData() {
  const text = await readFile(filePath, "utf-8");

  return d3
    .dsvFormat(";")
    .parse(text, d => ({
      locatie: d.locatie,
      date: new Date(d.datum),
      totaal: Number(String(d.totaal).replace(",", "."))
    }))
    .filter(
      d =>
        d.locatie &&
        d.date instanceof Date &&
        !Number.isNaN(d.date.getTime()) &&
        Number.isFinite(d.totaal)
    );
}

export async function dailyPerLocation() {
  const data = await processData();

  const rollup = d3.rollup(
    data,
    values => d3.sum(values, d => d.totaal),
    d => d.locatie,
    d => d3.timeDay(d.date)
  );

  return Array.from(rollup, ([locatie, days]) => ({
    locatie,
    days: Array.from(days, ([day, total]) => [day, total])
  }));
}

export async function dailyAvg() {
  const perLocation = await dailyPerLocation();

  const rollup = d3.rollup(
    perLocation.flatMap(d => d.days.map(([day, total]) => ({ day, total }))),
    values => d3.mean(values, d => d.total),
    d => d.day
  );

  return Array.from(rollup, ([day, avg]) => ({ day, avg }));
}
