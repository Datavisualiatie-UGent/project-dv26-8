// src/data/bike.data.js
import { readFile } from "node:fs/promises";
import { dsvFormat } from "d3-dsv";

const dataRoot = new URL("../data/", import.meta.url);
const sc = dsvFormat(";");

async function readCsv(name) {
  const text = await readFile(new URL(name, dataRoot), "utf8");
  return sc.parse(text.trim());
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function loadBikeSummary() {
  // Load all datasets in parallel, but only extract the fields we actually need for the charts
  const [year, month, hour, weekday, locs] = await Promise.all([
    readCsv("agg_year.csv"),
    readCsv("agg_month.csv"),
    readCsv("agg_hour.csv"),
    readCsv("fietspalen_clean.csv"),   // still needed for weekday breakdown
    readCsv("locations_with_totals.csv"),
  ]);

  const yearlyTotals = year.map((d) => ({ year: +d.year, total: +d.totaal }));
  const monthlyTotals = month.map((d) => ({ month: +d.month, total: +d.totaal }));
  const hourlyTotals = hour.map((d) => ({ hour: +d.hour, total: +d.totaal }));

  // Weekday still needs raw data — but only two columns
  const weekdayMap = new Map();
  for (const row of weekday) {
    const date = new Date(row.datum);
    if (isNaN(date)) continue;
    const wd = date.getUTCDay();
    weekdayMap.set(wd, (weekdayMap.get(wd) ?? 0) + (+row.totaal || 0));
  }
  const weekdayTotals = Array.from(weekdayMap, ([weekday, total]) => ({ weekday, total }))
    .sort((a, b) => a.weekday - b.weekday);

  const codeTotals = locs
    .filter((d) => d.code)
    .map((d) => ({ code: d.code, location: d.naam || d.locatie || d.code, total: +d.totaal || 0 }))
    .sort((a, b) => b.total - a.total);

  const totalCyclists = codeTotals.reduce((s, d) => s + d.total, 0);
  const topLocations = [...codeTotals].sort((a, b) => b.total - a.total).slice(0, 10)
    .map((d) => ({ location: d.location, total: d.total }));

  return {
    recordCount: weekday.length,
    totalCyclists,
    yearlyTotals,
    monthlyTotals,
    hourlyTotals,
    weekdayTotals,
    topLocations,
    codeTotals
  };
}

export async function loadLocaties() {
  const locs = await readCsv("locations_with_totals.csv");

  return locs
    .filter((d) => d.code)
    .map((d) => {
      const lat = toNumber(d.lat);
      const long = toNumber(d.long);

      return {
        code: d.code,
        naam: d.naam || d.code,
        eigenaar: d.eigenaar || "Onbekend",
        bouwjaar: toNumber(d.bouwjaar),
        point_x: toNumber(d.point_x),
        point_y: toNumber(d.point_y),
        begindatum: d.begindatum || "Onbekend",
        lat: lat,
        long: long,
        total: toNumber(d.totaal) ?? 0
      };
    })
    .filter((d) => Number.isFinite(d.lat) && Number.isFinite(d.long));
}
