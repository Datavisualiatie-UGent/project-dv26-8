import * as Plot from "npm:@observablehq/plot";
import * as d3 from "d3";

export function drukte(data, yLabel, {width, height} = {}) {
  function getSeason(month) {
    const m = month.getMonth();
    if (m >= 2 && m <= 4) return 'spring';
    if (m >= 5 && m <= 7) return 'summer';
    if (m >= 8 && m <= 10) return 'autumn';
    return 'winter';
  }

  const seasonColors = {
    spring: 'green',
    summer: 'yellow',
    autumn: 'orange',
    winter: 'blue'
  };

  return Plot.plot({
    width,
    height,
    marginTop: 30,
    color: {
      domain: ['lente', 'zomer', 'herfst', 'winter'],
      range: ['green', 'yellow', 'orange', 'blue'],
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
      label: yLabel
    },
    marks: [
      Plot.barY(data, {
        x: "month",
        y: "avg",
        fill: d => seasonColors[getSeason(d.month)],
      })
    ]
  });
}