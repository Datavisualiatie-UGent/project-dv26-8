import * as d3 from "d3";
import { readFile, writeFile } from "fs/promises";

const filePath = new URL("./data_fietspalen.csv", import.meta.url);

async function processData() {
  const text = await readFile(filePath, "utf-8");

  return d3
    .dsvFormat(";")
    .parse(text, d => ({
      locatie: d.locatie,
      date: new Date(d.datum),
      totaal: +d.totaal
    }))
    .filter(d =>
      d.locatie &&
      Number.isFinite(d.totaal) &&
      d.date instanceof Date &&
      !Number.isNaN(d.date.getTime())
    );
};

export async function monthlyPerLocation() {
  const data = await processData();

  const rollup = d3.rollup(
    data,
    v => d3.sum(v, d => d.totaal),
    d => d.locatie,
    d => d3.timeMonth(d.date)
  );

  return Array.from(rollup, ([locatie, months]) => ({
    locatie,
    months: Array.from(months, ([month, value]) => [month, value])
  }));
}

export async function monthlyAvg() {
  const data = await monthlyPerLocation();

  return Array.from(
    d3.rollup(
      data.flatMap(d =>
        d.months.map(([month, value]) => ({ month, value }))
      ),
      v => d3.mean(v, d => d.value),
      d => d.month
    ),
    ([month, avg]) => ({ month, avg })
  );
}