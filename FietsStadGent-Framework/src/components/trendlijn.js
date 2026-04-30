import * as Plot from "npm:@observablehq/plot";
import * as d3 from "d3";
import * as Inputs from "@observablehq/inputs";

export function getYearsView(data) {
  return Inputs.checkbox(
    data.flatMap(d => d.year),
    {
      label: "Year",
      unique: true,
      sort: true
    }
  );
}

// inspiration: https://fil.github.io/pangea/plot/multiple-line-chart-hover
export function trendLijn(data, xLabel, yLabel, { width, height } = {}) {

    console.log(data);

    const yearColor = new Map([
        [2017, "#7f7f7f"],
        [2018, "#bcbd22"],
        [2019, "#e377c2"],
        [2020, "#17becf"],
        [2021, "#1f77b4"],
        [2022, "#ff7f0e"],
        [2023, "#2ca02c"],
        [2024, "#d62728"],
        [2025, "#9467bd"],
        [2026, "#8c564b"]
    ]);

    return Plot.plot({
        width,
        height,
        className: "trendlijn",
        style: {
            background: "white",
            color: "black"
        },
        x: {
            domain: d3.range(12),
            tickFormat: d => [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ][d],
            label: xLabel.charAt(0).toUpperCase() + xLabel.slice(1),
        },
        y: {
            grid: true,
            label: yLabel.charAt(0).toUpperCase() + yLabel.slice(1),
        },
        marks: [
            //Plot.ruleY([0], {stroke: "#e5e7eb"}),

            Plot.lineY(data, {
                x: "month",
                y: "value",

                stroke: d => yearColor.get(d.year),
                z: "year",

                tip: {
                    render(index, scales, values, dimensions, context, next) {
                        const path = d3.select(context.ownerSVGElement)
                            .selectAll("[aria-label=line] path");

                        return next(index, scales, values, dimensions, context);
                    }
                }
            })
        ]
    });
}