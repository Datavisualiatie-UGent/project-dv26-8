import * as Inputs from "@observablehq/inputs";
import { html } from "htl";


export const yearColor = new Map([
        [2017, "#4E79A7"],
        [2018, "#F28E2B"],
        [2019, "#59A14F"],
        [2020, "#E15759"],
        [2021, "#B07AA1"],
        [2022, "#EDC948"],
        [2023, "#76B7B2"],
        [2024, "#9C755F"],
        [2025, "#BAB0AC"],
        [2026, "#FF9DA7"]
    ]);

export function getYearsView(allYears) {
    return Inputs.checkbox(allYears, {
        value: allYears,
        unique: true,
        sort: true,
        format: d => {
            const color = yearColor.get(d) || "#999";
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