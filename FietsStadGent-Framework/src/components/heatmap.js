import { max } from "d3";
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";

const weekdayNames = [
  "ma",
  "di",
  "wo",
  "do",
  "vr",
  "za",
  "zo"
];

export function heatmap(rows, year, description, {width, height, colorDomain} = {}) {
    const monthLabels = rows.filter((d, i, arr) =>
        i === 0 || d.month !== arr[i - 1].month
    );
    const maxWeek = d3.max(rows, d => d.week);

    return Plot.plot({
        width: width,
        height: height,
        marginTop: 20,
        marginRight: 30,
        x: {
            axis: null,
        },
        y: {
            label: null,
            domain: weekdayNames,
            axisLine: false,
        },
        color: {
            label: "Gemiddelde",
            scheme: "greens",
            domain: year !== undefined ? colorDomain : undefined
            // domain: colorDomain
        },
        marks: [
           Plot.axisY({tickSize: 0}),
           Plot.rect(rows, {
                x: "week",
                y: "weekday",
                fill: "value",
                title: d => `${d3.timeFormat("%A %d %B %Y")(d.day)}:\n${d.value.toFixed(2)} ${description}`
            }),

            Plot.text(monthLabels, {
                x: "week",
                y: () => "ma",
                text: "month",
                dy: -20,
                // textAnchor: "start",
            }),

            Plot.text([{}], {
                x: () => maxWeek + 1,
                y: () => "do",
                text: () => year !== undefined ? new Date(year, 0, 1).toLocaleDateString("nl-BE", { year: "numeric" }) : "",
                textAnchor: "end",
                dx: 30,
            }),
        ]
    });
}
