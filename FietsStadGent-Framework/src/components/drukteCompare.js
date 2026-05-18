import * as Plot from "npm:@observablehq/plot";
import * as d3 from "d3";

export function drukteCompare(data, yLabel, {width, height} = {}) {
  const stacked = d3.groups(data, d => d.month).flatMap(([month, values]) => {
    let y0 = 0;

    return values
      .sort((a, b) => a.avg - b.avg)
      .map(d => {
        const value = d.avg - y0;
        const out = { ...d, month, value };
        y0 = d.avg;
        return out;
      });
  });
  return Plot.plot({
    width,
    height,
    marginTop: 30,
    marginLeft: 50,
    marginBottom: 30,
    color: 
       {
          range: d3.schemeTableau10.concat(d3.schemeSet3),
          legend: true,
        },
    x: {
      label: "Datum",
      tickFormat: d3.timeFormat("%b %y"),
      ticks: d3.timeMonth.every(6),
      interval: d3.timeMonth,
      labelAnchor: "right",
    },
    y: {
      label: yLabel,
      grid: true,
    },
    marks: [
      Plot.rectY(stacked, {
        x: "month",
        y: "value",
        fill: "location",
        channels: {
            Locatie: "location",
            "Aantal fietsers": "avg",
        },
        tip: {
          format: {
            Locatie: true,
            "Aantal fietsers": true,
            x: (d) => d.toLocaleDateString("nl-BE", { month: "long", year: "numeric" }),
            fill: false,
            y: false,
          },
        }
      }),
      Plot.ruleY([0]),
    ]
  });
}