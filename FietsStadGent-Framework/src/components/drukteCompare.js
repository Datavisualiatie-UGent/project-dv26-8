import * as Plot from "npm:@observablehq/plot";
import * as d3 from "d3";

export function drukte(data, yLabel, {width, height} = {}) {
  return Plot.plot({
    width,
    height,
    marginTop: 30,
    marginLeft: 50,
    marginBottom: 25,
    color: 
       {
        //   scheme: d3.schemeTableau10.concat(d3.schemeSet3),
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
      Plot.barY(data, {
        x: "month",
        y: "avg",
        fill: "location",
        // opacity: 0.6,
        tip: {
          format: {
            y: true,
            x: (d) => d.toLocaleDateString("nl-BE", { month: "long", year: "numeric" }),
            fill: true,
          }
        }
      })
    ]
  });
}