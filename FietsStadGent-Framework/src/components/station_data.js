import * as d3 from "npm:d3";

export const normalizeLocation = (value) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/[^a-z0-9]/g, "");

export const parseMonth = (value) => {
  if (value == null) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const month = new Date(raw);
  return Number.isNaN(month.getTime()) ? null : month;
};

export function processBikeData(day, value) {
  const date = new Date(day);
  const start = d3.timeYear(date);
  let week = d3.timeWeek.count(start, date);
  const weekday = date.toLocaleString("nl-BE", {weekday: "short"});
  const month = date.toLocaleString("nl-BE", {month: "short"});

  if (weekday === "zo") week -= 1;

  return {
    day: date,
    value,
    weekday,
    month,
    week
  };
}

function matchesStation(record, station, {codeKey = "code", locationKey = "location"} = {}) {
  if (!record || !station) return false;

  const stationCode = String(station.code ?? "").trim().toUpperCase();
  const recordCode = String(record[codeKey] ?? "").trim().toUpperCase();
  if (stationCode && recordCode && stationCode === recordCode) return true;

  const stationName = normalizeLocation(station.name ?? station.code);
  const recordName = normalizeLocation(record[locationKey] ?? record.locatie ?? record.name);
  return stationName !== "" && stationName === recordName;
}

function collectStationRecords(records, station, options) {
  return records.filter((record) => matchesStation(record, station, options));
}

function mergeTrendRecords(records, mode) {
  const merged = new Map();

  for (const record of records) {
    for (const item of record.data ?? []) {
      const year = Number(item.jaar);
      const dimension = item[mode];
      if (!Number.isFinite(year) || dimension == null || !Number.isFinite(item.value)) continue;

      const key = `${year}-${dimension}`;
      if (!merged.has(key)) {
        merged.set(key, {
          ...item,
          jaar: year,
          value: item.value
        });
      }
    }
  }

  return Array.from(merged.values()).sort((a, b) => a.jaar - b.jaar || a[mode] - b[mode]);
}

function mergeMonthlyRecords(records) {
  const merged = new Map();

  for (const record of records) {
    for (const [month, value] of record.months ?? []) {
      const parsedMonth = parseMonth(month);
      if (!parsedMonth || !Number.isFinite(value)) continue;

      const key = parsedMonth.toISOString().slice(0, 7);
      if (!merged.has(key)) {
        merged.set(key, {month: parsedMonth, avg: value});
      }
    }
  }

  return Array.from(merged.values()).sort((a, b) => a.month - b.month);
}

function mergeDailyRecords(records) {
  const merged = new Map();

  for (const record of records) {
    for (const [day, value] of record.days ?? []) {
      const parsedDay = new Date(day);
      if (Number.isNaN(parsedDay.getTime()) || !Number.isFinite(value)) continue;

      const key = parsedDay.toISOString().slice(0, 10);
      if (!merged.has(key)) {
        merged.set(key, processBikeData(parsedDay, value));
      }
    }
  }

  return Array.from(merged.values()).sort((a, b) => a.day - b.day);
}

export function getMonthlyDataForStation(records, station) {
  const matchedRecords = collectStationRecords(records, station, {locationKey: "location"});
  return mergeMonthlyRecords(matchedRecords);
}

export function getDailyDataForStation(records, station) {
  const matchedRecords = collectStationRecords(records, station, {locationKey: "location"});
  return mergeDailyRecords(matchedRecords);
}

export function getTrendDataForStation(trendDict, mode, type, station, baseYear = undefined) {
  const dataset = trendDict[mode][type];

  let selectedDataset = dataset.perLocation;

  if(type === "relatief" && baseYear !== undefined) {
    selectedDataset = dataset.perLocation[baseYear];
  }

  const records = collectStationRecords(selectedDataset, station, {locationKey: "locatie"});
  return mergeTrendRecords(records, mode);
}

export function collectTrendYearsForStation(trendDict, station) {
  return Array.from(
    new Set(
      Object.values(trendDict).flatMap((dataset) => {
        const records = collectStationRecords(dataset.absoluut.perLocation, station, {locationKey: "locatie"});
        return records.flatMap((record) => record.data?.map((value) => value.jaar) ?? []);
      })
    )
  ).sort((a, b) => a - b);
}