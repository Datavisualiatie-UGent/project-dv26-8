import * as Plot from "npm:@observablehq/plot";
import * as d3 from "d3";
import * as Inputs from "@observablehq/inputs";


export function getYearsView(data) {    
    return Inputs.checkbox(
        data,
        {
            unique: true,
            sort: true
        }
    );
}

export function getModeView() {
    return Inputs.select(
        ["month", "weekday", "hourly"],
        {
            value: "month",
            format: d => ({
                month: "Maandelijks",
                weekday: "Weekdag",
                hourly: "Uurlijks"
            })[d]
        }
    );
}

// Inspiration: https://fil.github.io/pangea/plot/multiple-line-chart-hover
export function trendLijn(data, type, yLabel, { width, height } = {}) {
    const xLabel =
        type === "month" ? "Maand" :
            type === "weekday" ? "Dag" :
                "Uur";

    const xKey =
        type === "month" ? "month" :
            type === "weekday" ? "day" :
                "hour";

    const months = ["Jan", "Feb", "Maa", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];
    const days = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];


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
        marginLeft: 50,
        className: "trendlijn",
        style: {
            background: "white",
            color: "black"
        },
        x: {
            domain:
                type === "month" ? d3.range(12) :
                    type === "weekday" ? d3.range(7) :
                        d3.range(24),

            tickFormat:
                type === "month" ? d => months[d]
                    : type === "weekday" ? d => days[d]
                        : d => `${d}:00`,
            label: xLabel,
        },
        y: {
            grid: true,
            label: yLabel,
        },
        marks: [
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
            })
        ]
    });
}