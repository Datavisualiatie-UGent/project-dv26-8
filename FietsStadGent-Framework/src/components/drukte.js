import * as Plot from "npm:@observablehq/plot";
import * as d3 from "d3";

export function drukte(data, yLabel, {width, height} = {}) {
  // Clean the data, ensuring we have valid dates and numeric values.
  const clean = (data || [])
    .map((d) => {
      if (!d || !Number.isFinite(d.avg)) return null;

      const date = d.month instanceof Date ? d.month : new Date(d.month);
      if (!Number.isFinite(date.getTime())) return null;

      return {
        ...d,
        // Force a stable month key to avoid timezone and coercion artifacts.
        month: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.month - b.month);

  const domain = d3.extent(clean, (d) => d.month);

  return Plot.plot({
    width,
    height,
    marginTop: 30,
    x: {
      label: "Datum",
      tickFormat: d3.timeFormat("%Y-%m"),
      domain
    },
    y: {
      label: yLabel
    },
    marks: [
      Plot.line(clean, {
        x: "month",
        y: "avg"
      }),
      Plot.dot(clean, {
        x: "month",
        y: "avg"
      })
    ]
  });
}