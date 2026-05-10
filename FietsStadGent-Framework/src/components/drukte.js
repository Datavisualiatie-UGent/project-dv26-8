import * as Plot from "npm:@observablehq/plot";
import * as d3 from "d3";

export function drukte(data, yLabel, showSeason, {width, height} = {}) {
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

  const years = Array.from(new Set(data.map(d => d.month.getFullYear().toString()))).sort();
  const yearColors = d3.schemeTableau10.concat(d3.schemeSet3).slice(0, years.length);

  return Plot.plot({
    width,
    height,
    marginTop: 30,
    marginLeft: 50,
    marginBottom: 25,
    color: showSeason
      ? {
          domain: ['lente', 'zomer', 'herfst', 'winter'],
          range: ['green', 'yellow', 'orange', 'blue'],
          legend: true,
        }
      : {
          domain: years,
          format: (d) => d.toString(),
          range: yearColors,
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
        fill: d => showSeason ? seasonColors[getSeason(d.month)] : d.month.getFullYear().toString(),
        tip: {
          format: {
            y: true,
            x: (d) => d.toLocaleDateString("nl-BE", { month: "long", year: "numeric" }),
            fill: false,
          }
        }
      })
    ]
  });
}