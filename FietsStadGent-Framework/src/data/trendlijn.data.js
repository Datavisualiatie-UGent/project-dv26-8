import * as d3 from "d3";
import { readFile, writeFile } from "fs/promises";

const filePath = new URL("./data_fietspalen.csv", import.meta.url);

async function processTrendData() {
  const text = await readFile(filePath, "utf-8");

  return d3
    .dsvFormat(";")
    .parse(text, d => ({
      locatie: d.locatie,
      ordening: new Date(d.ordening), //datum + tijd
      totaal: +d.totaal
    }))
    .filter(d =>
      d.locatie &&
      Number.isFinite(d.totaal) &&
      d.date instanceof Date &&
      !Number.isNaN(d.date.getTime())
    );
};

export async function filteredTrendData() {
    // years is an array with more then one year
    // period = day, week, month
    // if pole is None then global
    const data = await processTrendData();

    const rollup = d3.rollup(
        data,
        v => d3.sum(v, d => d.totaal),
        d => d.locatie,
        d => d3.timeDay(d.ordening) // keep as it is??
      );
    
      return Array.from(rollup, ([locatie, periods]) => ({
        locatie,
        months: Array.from(months, ([period, value]) => [period, value])
      }));
}
