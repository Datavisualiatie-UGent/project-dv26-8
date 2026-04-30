// src/lib/dataLoader.js
import { csv } from "d3-fetch";

// Map dataset names → CSV paths
const DATASETS = {
  "5min": "/data/fietspalen_clean.csv",
  "hour": "/data/agg_hour.csv",
  "day": "/data/agg_day.csv",
  "month": "/data/agg_month.csv",
  "year": "/data/agg_year.csv",
  "locations_with_totals": "/data/locations_with_totals.csv",
  "locations": "/data/locations_clean.csv",
};

// Auto‑select dataset based on chart type
export function loadForChart(type) {
  switch (type) {
    case "timeseries":
      return csv(DATASETS["5min"]);
    case "hourly":
      return csv(DATASETS.hour);
    case "daily":
      return csv(DATASETS.day);
    case "monthly":
      return csv(DATASETS.month);
    case "yearly":
      return csv(DATASETS.year);
    case "map":
      return csv(DATASETS.locations_with_totals);
    default:
      console.warn("Unknown chart type:", type);
      return csv(DATASETS["5min"]);
  }
}

// Direct file loader
export function loadDataset(name) {
  if (!DATASETS[name]) {
    throw new Error(`Unknown dataset: ${name}`);
  }
  return csv(DATASETS[name]);
}
