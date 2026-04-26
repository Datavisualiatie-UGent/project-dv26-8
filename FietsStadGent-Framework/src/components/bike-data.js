import { readFile } from "node:fs/promises";
import { dsvFormat } from "d3-dsv";

const rawDataRoot = new URL("../data/", import.meta.url);
const semicolonCsv = dsvFormat(";");

async function readRawCsv(fileName) {
    const text = await readFile(new URL(fileName, rawDataRoot), "utf8");
    return semicolonCsv.parse(text.trim());
}

function parseNumber(value) {
    if (value == null || value === "") return null;
    const parsed = Number(String(value).replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
}

function parseDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.valueOf()) ? null : date;
}

function formatDate(date) {
    return date ? date.toISOString().slice(0, 10) : null;
}

function parseTimeLabel(value) {
    if (!value) return null;
    const text = String(value).trim();
    return text.length >= 5 ? text.slice(0, 5) : text;
}

function parseGeoPoint(value) {
    if (!value) return null;
    const [lat, lon] = String(value)
        .split(",")
        .map((part) => Number(part.trim()));
    return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;
}

function parseGeometry(value) {
    if (!value) return null;

    try {
        return JSON.parse(value);
    } catch {
        try {
            return JSON.parse(String(value).replace(/""/g, '"'));
        } catch {
            return value;
        }
    }
}

function addToMap(map, key, value) {
    map.set(key, (map.get(key) ?? 0) + value);
}

function sortSeries(map, keyName, valueName, comparator) {
    return Array.from(map, ([key, value]) => ({ [keyName]: key, [valueName]: value })).sort(comparator);
}

export async function loadBikeSummary() {
    const rows = await readRawCsv("data_fietspalen.csv");

    const yearlyTotals = new Map();
    const monthlyTotals = new Map();
    const hourlyTotals = new Map();
    const weekdayTotals = new Map();
    const locationTotals = new Map();
    const codeTotals = new Map();

    let totalCyclists = 0;
    let recordCount = 0;

    for (const row of rows) {
        const date = parseDate(row.datum);
        const timeLabel = parseTimeLabel(row.uur5minuten);
        const hour = timeLabel ? Number(timeLabel.slice(0, 2)) : null;
        const total = parseNumber(row.totaal) ?? 0;
        const year = date ? date.getUTCFullYear() : null;
        const month = date ? date.getUTCMonth() + 1 : null;
        const weekday = date ? date.getUTCDay() : null;

        if (year == null || month == null || weekday == null) continue;

        recordCount += 1;
        totalCyclists += total;

        addToMap(yearlyTotals, year, total);
        addToMap(monthlyTotals, month, total);
        if (Number.isFinite(hour)) addToMap(hourlyTotals, hour, total);
        addToMap(weekdayTotals, weekday, total);
        addToMap(locationTotals, row.locatie || "Onbekend", total);
        const codeKey = row.code || "ONBEKEND";
        if (!codeTotals.has(codeKey)) {
            codeTotals.set(codeKey, { code: codeKey, location: row.locatie || "Onbekend", total: 0 });
        }
        codeTotals.get(codeKey).total += total;
    }

    const codeTotalsArray = Array.from(codeTotals.values()).sort((a, b) => b.total - a.total);

    return {
        recordCount,
        totalCyclists,
        yearlyTotals: sortSeries(yearlyTotals, "year", "total", (a, b) => a.year - b.year),
        monthlyTotals: sortSeries(monthlyTotals, "month", "total", (a, b) => a.month - b.month),
        hourlyTotals: sortSeries(hourlyTotals, "hour", "total", (a, b) => a.hour - b.hour),
        weekdayTotals: sortSeries(weekdayTotals, "weekday", "total", (a, b) => a.weekday - b.weekday),
        topLocations: sortSeries(locationTotals, "location", "total", (a, b) => b.total - a.total).slice(0, 10),
        codeTotals: codeTotalsArray
    };
}

export async function loadLocaties() {
    const rows = await readRawCsv("data_locaties.csv");

    return rows.map((row) => {
        const begindatum = parseDate(row.begindatum);
        const einddatum = parseDate(row.einddatum);
        const geoPoint2d = parseGeoPoint(row.geo_point_2d);

        return {
            ...row,
            sensoren: parseNumber(row.sensoren),
            bouwjaar: parseNumber(row.bouwjaar),
            point_x: parseNumber(row.point_x),
            point_y: parseNumber(row.point_y),
            begindatum: row.begindatum || null,
            begindatumIso: formatDate(begindatum),
            einddatum: row.einddatum || null,
            einddatumIso: formatDate(einddatum),
            actief: String(row.actief || row.actief_codedvalue || "").trim().toLowerCase() === "ja" || String(row.actief_codedvalue || "").trim() === "1",
            lat: parseNumber(row.lat),
            long: parseNumber(row.long),
            geometry: parseGeometry(row.geometry),
            geo_point_2d: geoPoint2d,
            geoPoint2d
        };
    });
}