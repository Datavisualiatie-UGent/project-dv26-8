import * as Plot from "npm:@observablehq/plot";

const weekdayNames = [
  "Maandag",
  "Dinsdag",
  "Woensdag",
  "Donderdag",
  "Vrijdag",
  "Zaterdag",
  "Zondag"
];

const monthNames = [
  "Jan",
  "Feb",
  "Mrt",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Okt",
  "Nov",
  "Dec"
];

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date;
}

function addToMap(map, key, value) {
  map.set(key, (map.get(key) ?? 0) + value);
}

export function heatmap(rows, year, {width, height} = {}) {
  const totals = new Map();

  for (const row of rows || []) {
    const date = parseDate(row.datum || row.date || row.Month || row.month);
    if (!date || (year != null && date.getUTCFullYear() !== year)) continue;

    const month = date.getUTCMonth() + 1;
    const weekday = date.getUTCDay();
    const total = Number(row.totaal ?? row.total ?? row.value ?? 0) || 0;

    addToMap(totals, `${month}-${weekday}`, total);
  }

  const data = [];
  for (let weekday = 1; weekday <= 7; weekday += 1) {
    const dayIndex = weekday % 7; // Convert Monday=1..Sunday=7 to 1..6,0
    for (let month = 1; month <= 12; month += 1) {
      const key = `${month}-${dayIndex}`;
      data.push({
        month: monthNames[month - 1],
        weekday: weekdayNames[weekday - 1],
        value: totals.get(key) ?? 0
      });
    }
  }

  return Plot.plot({
    width,
    height,
    marginTop: 40,
    color: {
      legend: true,
      scheme: "blues"
    },
    x: {
      label: "Maand",
      axis: "top"
    },
    y: {
      label: "Weekdag",
      domain: weekdayNames
    },
    marks: [
      Plot.cell(data, {
        x: "month",
        y: "weekday",
        fill: "value",
        title: d => `${d.weekday}, ${d.month}: ${d.value}`
      })
    ]
  });
}
