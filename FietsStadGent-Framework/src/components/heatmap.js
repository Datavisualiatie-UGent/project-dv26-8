import * as Plot from "npm:@observablehq/plot";

const weekdayNames = [
  "ma",
  "di",
  "wo",
  "do",
  "vr",
  "za",
  "zo"
];

export function heatmap(rows, {width, height} = {}) {
    const monthLabels = rows.filter((d, i, arr) =>
        i === 0 || d.month !== arr[i - 1].month
    );
    console.log(monthLabels);
    return Plot.plot({
        width: width,
        height: height,
        marginTop: 30,
        x: {
            axis: null,
        },
        y: {
            label: null,
            domain: weekdayNames
        },
        color: {
            label: "Average",
            scheme: "viridis"
        },
        marks: [
           Plot.rect(rows, {
                x: "week",
                y: "weekday",
                fill: "value",
                title: d => `${d.day.toLocaleDateString("nl-BE")}: ${d.value.toFixed(2)} average bikes`
            }),

            Plot.text(monthLabels, {
                x: "week",
                y: weekdayNames[0],
                text: "month",
                dy: -20,
                fontSize: 12,
                textAnchor: "start",
            })
        ]
    });
}
