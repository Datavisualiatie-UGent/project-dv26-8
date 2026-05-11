// trendLijn.js
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "d3";

import { getYearColor } from "./trendlijn_helper.js";

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

    const sidePadding =
        mode === "month"
            ? width * 0.04
            : mode === "day"
                ? width * 0.075
                : width * 0.025;

    const extent = d3.extent(data, d => d.value);
    const range = extent[1] - extent[0];
    const mean = d3.mean(data, d => d.value);

    // alleen inzoomen als variatie klein is
    const shouldZoom = range / mean < 0.2;

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
            insetLeft: -sidePadding,
            insetRight: -sidePadding,
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
            domain: shouldZoom
                ? [extent[0] * 0.98, extent[1] * 1.02]
                : [0, extent[1] * 1.1],

            tickFormat: isPct
                ? d => `${d3.format(".0f")(d)}%`
                : d3.format(",")
        },
        marks: [
            Plot.ruleY([0], {
                stroke: "#000",
                strokeDasharray: "2 2"
            }),
            Plot.lineY(data, {
                x: xKey,
                y: "value",
                curve: "linear",
                stroke: d => getYearColor(d.jaar),

                z: "jaar",

                channels: {
                    Jaar: "jaar",
                    Waarde: "value"
                },

                tip: {
                    format: {
                        x: false,
                        Jaar: d => `${d}`,
                        y: false,
                        z: false,
                        jaar: false,
                        Waarde: (d) => isPct ? `${d.toFixed(1)}%` : d3.format(",")(d),
                    },
                    channels: {
                        [xLabel]: d => {
                            if (mode === "month") return months[d.month];
                            if (mode === "day") return days[d.day];
                            return `${d.hour}:00`;
                        }
                    }
                },
            }),

        ]
    });
}

export const locationPatterns = [
  [],              // Volle lijn
  [8, 4],          // Lange strepen
  [2, 3],          // Puntjes
  [12, 4, 2, 4],   // Streep-punt
  [5, 10]           // Korte streep, grote spatie
];


export function trendLijnVergelijking(data, mode, yLabel, { width, height, isPct } = {}) {
    const xLabel = mode === "month" ? "Maand" : mode === "day" ? "Dag" : "Uur";
    const xKey = mode === "month" ? "month" : mode === "day" ? "day" : "hour";
    const months = ["Jan", "Feb", "Maa", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];
    const days = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];
    const sidePadding = mode === "month" ? width * 0.04 : mode === "day" ? width * 0.075 : width * 0.025;

    const uniqueLocations = Array.from(new Set(data.map(d => d.location)));
    
    // Pak de kleur van het eerste datapunt (gezien er maar 1 jaar geselecteerd is)
    const strokeColor = data.length > 0 ? getYearColor(data[0].jaar) : "black";

    const extent = d3.extent(data, d => d.value);
    const range = extent[1] - extent[0];
    const mean = d3.mean(data, d => d.value);

    // alleen inzoomen als variatie klein is
    const shouldZoom = range / mean < 0.2;

    return Plot.plot({
        width,
        height,
        marginLeft: 60,
        className: "trendlijn-vergelijking",
        style: { background: "white", color: "black" },
        x: {
            insetLeft: -sidePadding,
            insetRight: -sidePadding,
            domain: mode === "month" ? d3.range(12) : mode === "day" ? d3.range(7) : d3.range(24),
            tickFormat: mode === "month" ? d => months[d] : mode === "day" ? d => days[d] : d => `${d}:00`,
            label: xLabel,
        },
        y: {
            grid: true,
            label: yLabel,
            domain: shouldZoom
                ? [extent[0] * 0.98, extent[1] * 1.02]
                : [0, extent[1] * 1.1]
        },
        marks: [
            Plot.ruleY([0], { stroke: "#eee" }),
            ...uniqueLocations.map((loc, idx) =>
                Plot.lineY(
                    data.filter(d => d.location === loc),
                    {
                        x: xKey,
                        y: "value",
                        stroke: strokeColor, // Gebruik de kleur van het geselecteerde jaar
                        strokeDasharray: locationPatterns[idx % locationPatterns.length],
                        strokeWidth: 3,
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        curve: "linear",
                        channels: {
                            Locatie: d => d.location,
                            Jaar: d => String(d.jaar),
                            Waarde: d => d.value
                        },
                        tip: {
                            format: {
                                x: false,
                                Locatie: true,
                                Jaar: true,
                                y: false,
                                z: false,
                                Waarde: d =>
                                    isPct
                                        ? `${d.toFixed(1)}%`
                                        : d3.format(",")(d),
                            },

                            channels: {
                                [xLabel]: d => {
                                    if (mode === "month") return months[d.month];
                                    if (mode === "day") return days[d.day];
                                    return `${d.hour}:00`;
                                }
                            }
                        }
                    }
                )
            )
        ]
    });
}