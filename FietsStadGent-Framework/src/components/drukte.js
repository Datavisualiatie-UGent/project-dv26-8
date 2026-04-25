import * as Plot from "npm:@observablehq/plot";
import * as d3 from "d3";

export function drukte(data, yLabel, {width, height} = {}) {
  return Plot.plot({
    width,
    height,
    marginTop: 30,
    x: {
      label: "Datum",
      tickFormat: d3.timeFormat("%Y-%m")
    },
    y: {
      label: yLabel
    },
    marks: [
      Plot.line(data, {
        x: "month",
        y: "avg"
      }),
      Plot.dot(data, {
        x: "month",
        y: "avg"
      })
    ]
  });
}