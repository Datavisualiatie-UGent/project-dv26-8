// trendLijn.js
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "d3";

import { yearColor } from "./trendlijn_helper.js";

// Inspiration: https://fil.github.io/pangea/plot/multiple-line-chart-hover
export function trendLijn(data, mode, yLabel, { width, height, isPct } = {}) {
    const xLabel =
        mode === "month" ? "Maand" :
            mode === "day" ? "Dag" :
                "Uur";

    const xKey =
        mode === "month" ? "month" :
            mode === "day" ? "day" :
                "hour";

    const months = ["Jan", "Feb", "Maa", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];
    const days = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];


    return Plot.plot({
        width,
        height,
        marginLeft: 60,
        className: "trendlijn",
        style: {
            background: "white",
            color: "black"
        },
        x: {
            domain:
                mode === "month" ? d3.range(12) :
                    mode === "day" ? d3.range(7) :
                        d3.range(24),

            tickFormat:
                mode === "month" ? d => months[d]
                    : mode === "day" ? d => days[d]
                        : d => `${d}:00`,
            label: xLabel,
        },
        y: {
            grid: true,
            label: yLabel,

            domain: isPct
                ? [d3.min(data, d => d.value), d3.max(data, d => d.value)]
                : undefined,

            tickFormat: isPct
                ? d => `${d3.format(".0f")(d)}%`
                : d3.format(",")
        },
        marks: [
            ...(yLabel.includes("Index") ? [
                Plot.ruleY([100], {
                    stroke: "#999",
                    strokeDasharray: "4 2"
                })
            ] : []),
            Plot.ruleY([0], {
                stroke: "#000",
                strokeDasharray: "2 2"
            }),
            Plot.lineY(data, {
                x: xKey,
                y: "value",

                stroke: d => yearColor.get(d.jaar),

                z: "jaar",

                tip: {
                    render(index, scales, values, dimensions, context, next) {
                        const path = d3.select(context.ownerSVGElement)
                            .selectAll("[aria-label=line] path");

                        return next(index, scales, values, dimensions, context);
                    }
                }
            }),
            Plot.text(
                Array.from(yearColor, ([jaar, color]) => ({
                    jaar,
                    color
                })),
                {
                    x: width - 70,
                    y: (_, i) => 20 + i * 18,
                    text: d => d.jaar,
                    fill: d => d.color,
                    fontWeight: "bold",
                    frameAnchor: "top-right"
                }
            )
        ]
    });
}
