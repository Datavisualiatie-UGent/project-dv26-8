import * as Inputs from "@observablehq/inputs";
import { html } from "htl";
import * as d3 from "d3";

export const YEAR_COLORS = new Map(
    d3.range(2018, 2027).map((year, i) => [
        year,
        d3.schemeTableau10.concat(d3.schemePaired)[i]
    ])
);

export function getYearColor(year) {
    return YEAR_COLORS.get(year) || "#999";
}

export function getYearsView(allYears) {

    let recentYear = [];
    if (allYears.length > 0) {
        recentYear = (allYears.length >= 2) ? [allYears[allYears.length - 2]] : [allYears[allYears.length - 1]];
    }
    return Inputs.checkbox(allYears, {
        value: recentYear,
        unique: true,
        sort: true,
        format: d => {
            const color = getYearColor(d) || "#999";
            return html`
                <span style="color: ${color}; font-weight: bold; margin-right: 0.5rem;">
                    ${d}
                </span>
            `;
        }
    });
}

export function getModeView() {
    return Inputs.select(
        ["month", "day", "hour"],
        {
            value: "month",
            format: d => ({
                month: "Maandelijks",
                day: "Weekdag",
                hour: "Uurlijks"
            })[d]
        }
    );
}