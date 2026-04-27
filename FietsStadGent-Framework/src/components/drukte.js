import * as Plot from "npm:@observablehq/plot";
import * as d3 from "d3";

export function drukte(data, yLabel, {width, height} = {}) {
  return Plot.plot({
    width,
    height,
    marginTop: 30,
    color: {
      legend: false
    },
    x: {
      label: "Datum",
      tickFormat: d3.timeFormat("%b %y"),
      ticks: d3.timeMonth.every(6),
      interval: d3.timeMonth,
      labelAnchor: "right"
    },
    y: {
      label: yLabel
    },
    marks: [
      Plot.barY(data, {
        x: "month",
        y: "avg",
        fill: "steelblue",
      })
    ]
  });
}