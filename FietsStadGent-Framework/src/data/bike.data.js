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
  const [year, month, hour, locations] = await Promise.all([
    readCsv("agg_year.csv"),
    readCsv("agg_month.csv"),
    readCsv("agg_hour.csv"),
    readCsv("locations_with_totals.csv"),
  ]);

  const yearlyTotals = year.map((d) => ({ year: +d.year, total: +d.totaal }));
  const monthlyTotals = month.map((d) => {
    // month is like '2019-01' — parse the month number
    const parts = String(d.month).split("-");
    const m = parts.length >= 2 ? Number(parts[1]) : null;
    return { month: Number.isFinite(m) ? m : null, total: +d.totaal };
  });

  const hourlyTotals = hour.map((d) => {
    // agg_hour.csv uses 'YYYY-MM-DD HH:MM:SS' — reliably extract hour via substring
    const s = String(d.hour || "");
    const maybeHour = s.length >= 13 ? Number(s.slice(11, 13)) : null;
    const h = Number.isFinite(maybeHour) ? maybeHour : null;
    return { hour: h, total: +d.totaal };
  });

  // Derive weekday totals from the hourly aggregation (agg_hour.csv)
  const weekdayMap = new Map();
  for (const row of hour) {
    const date = new Date(row.hour);
    if (isNaN(date)) continue;
    const wd = date.getUTCDay();
    weekdayMap.set(wd, (weekdayMap.get(wd) ?? 0) + (+row.totaal || 0));
  }
  const weekdayTotals = Array.from(weekdayMap, ([weekday, total]) => ({ weekday, total }))
    .sort((a, b) => a.weekday - b.weekday);

  const codeTotals = locations
    .filter((d) => d.code)
    .map((d) => ({ code: d.code, name: d.naam || d.locatie || d.code, total: +d.totaal || 0 }))
    .sort((a, b) => b.total - a.total);

  const totalCyclists = codeTotals.reduce((s, d) => s + d.total, 0);
  const topLocations = [...codeTotals].sort((a, b) => b.total - a.total).slice(0, 10)
    .map((d) => ({ name: d.name, total: d.total }));

  return {
    recordCount: hour.length,
    totalCyclists,
    yearlyTotals,
    monthlyTotals,
    hourlyTotals,
    weekdayTotals,
    topLocations,
    codeTotals
  };
}

export async function loadVerdictSummary() {
  const years = await readCsv("agg_year.csv");
  const yearlyTotals = years
    .map((d) => ({ year: +d.year, total: +d.totaal }))
    .filter((d) => Number.isFinite(d.year) && Number.isFinite(d.total))
    .sort((a, b) => a.year - b.year);

  const currentYear = new Date().getFullYear();
  const completeYears = yearlyTotals.filter((d) => d.year < currentYear);

  const latest = (completeYears.at(-1) ?? yearlyTotals.at(-1)) ?? null;
  const baseline2019 = yearlyTotals.find((d) => d.year === 2019) ?? null;
  const peakYear = yearlyTotals.reduce(
    (best, current) => (!best || current.total > best.total ? current : best),
    null
  );
  const covidDip = yearlyTotals.find((d) => d.year === 2020) ?? null;

  const growthSince2019 = baseline2019 && latest && baseline2019.total !== 0
    ? ((latest.total - baseline2019.total) / baseline2019.total) * 100
    : null;

  const recoveryFromCovidDip = covidDip && latest && covidDip.total !== 0
    ? ((latest.total - covidDip.total) / covidDip.total) * 100
    : null;

  // Also derive short answers to the research questions by loading the lightweight summary
  // (this is server-side during build; acceptable to call here).
  const summary = await loadBikeSummary();

  const topLocation = summary.topLocations?.[0] ?? null;

  // Aggregate by hour-of-day (0-23) to find the busiest hour on average
  const hourMap = new Map();
  for (const r of summary.hourlyTotals || []) {
    const h = r?.hour;
    if (typeof h !== "number" || !Number.isFinite(h)) continue;
    hourMap.set(h, (hourMap.get(h) ?? 0) + (r.total ?? 0));
  }
  let busiestHour = null;
  for (const [h, total] of hourMap) {
    if (busiestHour == null || total > busiestHour.total) busiestHour = { hour: h, total };
  }

  const busiestWeekdayRow = (summary.weekdayTotals || []).reduce((best, cur) =>
    !best || (cur.total ?? 0) > (best.total ?? 0) ? cur : best,
    null
  );

  const peakMonthRow = (summary.monthlyTotals || []).reduce((best, cur) =>
    !best || (cur.total ?? 0) > (best.total ?? 0) ? cur : best,
    null
  );

  const weekdayNames = [
    "zondag",
    "maandag",
    "dinsdag",
    "woensdag",
    "donderdag",
    "vrijdag",
    "zaterdag",
  ];

  const monthNames = [
    "januari",
    "februari",
    "maart",
    "april",
    "mei",
    "juni",
    "juli",
    "augustus",
    "september",
    "oktober",
    "november",
    "december",
  ];

  return {
    baselineYear: baseline2019?.year ?? null,
    latestYear: latest?.year ?? null,
    peakYear: peakYear?.year ?? null,
    peakTotal: peakYear?.total ?? null,
    growthSince2019,
    recoveryFromCovidDip,
    // Question-supporting fields
    topLocationName: topLocation?.name ?? null,
    topLocationTotal: topLocation?.total ?? null,
    busiestHour: busiestHour?.hour ?? null,
    busiestWeekday: typeof busiestWeekdayRow?.weekday === 'number' ? weekdayNames[busiestWeekdayRow.weekday] : null,
    peakMonth: typeof peakMonthRow?.month === 'number' ? monthNames[peakMonthRow.month - 1] : null,
  };
}

export async function loadLocations() {
  const rows = await readCsv("locations_with_totals.csv");

  return rows
    .filter((d) => d.code)
    .map((d) => {
      const lat = toNumber(d.lat);
      const long = toNumber(d.long);

      return {
        code: d.code,
        name: d.naam || d.locatie || d.code,
        owner: d.eigenaar || "Onbekend",
        buildYear: toNumber(d.bouwjaar),
        pointX: toNumber(d.point_x),
        pointY: toNumber(d.point_y),
        startDate: d.begindatum || "Onbekend",
        lat: lat,
        long: long,
        total: toNumber(d.totaal) ?? 0
      };
    })
    .filter((d) => Number.isFinite(d.lat) && Number.isFinite(d.long));
}
