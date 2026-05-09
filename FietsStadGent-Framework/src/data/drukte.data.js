// src/data/drukte.data.js
import * as d3 from "d3";
import { readFile, writeFile } from "fs/promises";

// Use the cleaned CSV produced by the preprocessor.
const filePath = new URL("./agg_month.csv", import.meta.url);

const parseMonth = d3.timeParse("%Y-%m");

async function processData() {
  const text = await readFile(filePath, "utf-8");

  return d3
    .dsvFormat(";")
    .parse(text, d => ({
      location: d.locatie,
      date: parseMonth(d.month),
      total: +d.totaal
    }))
    .filter(d =>
      d.location &&
      Number.isFinite(d.total) &&
      d.date instanceof Date &&
      !Number.isNaN(d.date.getTime())
    );
};

export async function monthlyPerLocation() {
  const data = await processData();

  const rollup = d3.rollup(
    data,
    v => v[0].total,
    d => d.location,
    d => d3.timeMonth(d.date)
  );

  return Array.from(rollup, ([location, months]) => ({
    location,
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