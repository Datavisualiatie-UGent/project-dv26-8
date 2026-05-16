// trend.data.js
import * as d3 from "d3";
import { readFile } from "fs/promises";

const filePath = new URL("./agg_hour.csv", import.meta.url);

async function processData() {
    const text = await readFile(filePath, "utf-8");

    return d3
        .dsvFormat(";")
        .parse(text, d => {
            const t = new Date(d.hour);
            return {
                code: d.code,
                locatie: d.locatie,
                jaar: t.getFullYear(),
                month: t.getMonth(),
                day: t.getDay(),
                hour: t.getHours(),
                totaal: +d.totaal
            };
        })
        .filter(d =>
            d.code &&
            d.locatie &&
            Number.isFinite(d.totaal) &&
            !Number.isNaN(d.jaar)
        );
}

function aggregate(values, key) {

    // hourly averages
    if (key === "hour") {
        return d3.mean(values, d => d.totaal);
    }

    // weekday averages
    if (key === "day") {
        return d3.mean(values, d => d.totaal);
    }

    // monthly totals
    if (key === "month") {
        return d3.sum(values, d => d.totaal);
    }
    return d3.sum(values, d => d.totaal);
}


function makeRollup(data, key, includeLocation = true) {

    // Per location
    if (includeLocation) {
        return d3.rollup(
            data,
            v => {
                if (key === "hour" || key === "day") {
                    return d3.mean(v, d => d.totaal);
                }
                return d3.sum(v, d => d.totaal);
            },
            d => d.code,
            d => d.locatie,
            d => d.jaar,
            d => d[key]
        );
    }


    // Global

    // First compute per location aggregates
    const perLocation = d3.rollups(
        data,
        v => {
            if (key === "hour" || key === "day") {
                return d3.mean(v, d => d.totaal);
            }
            return d3.sum(v, d => d.totaal);
        },
        d => d.code,
        d => d.locatie,
        d => d.jaar,
        d => d[key]
    );

    // flatten
    const rows = [];
    for (const [code, locations] of perLocation) {
        for (const [locatie, years] of locations) {
            for (const [jaar, groups] of years) {
                for (const [group, value] of groups) {
                    rows.push({
                        code,
                        locatie,
                        jaar,
                        group,
                        value
                    });
                }
            }
        }
    }

    // Average across locations
    return d3.rollup(
        rows,
        v => d3.mean(v, d => d.value),
        d => d.jaar,
        d => d.group
    );
}


function buildNormal(rollup, key, isGlobal = false) {

    // Global
    if (isGlobal) {
        return {
            locatie: "global",
            data: Array.from(rollup, ([jaar, groups]) =>
                Array.from(groups, ([k, value]) => ({
                    jaar: Number(jaar),
                    [key]: Number(k),
                    value: Math.round(value)
                }))
            ).flat()
        };
    }

    // Per location
    return Array.from(rollup, ([code, locations]) =>
        Array.from(locations, ([locatie, years]) => ({
            code,
            locatie,
            data: Array.from(years, ([jaar, groups]) =>
                Array.from(groups, ([k, value]) => ({
                    jaar: Number(jaar),
                    [key]: Number(k),
                    value: Math.round(value)
                }))
            ).flat()
        }))
    ).flat();
}


function calculatePctChange(rollup, key, baseYear) {

    return Array.from(rollup, ([code, locations]) =>
        Array.from(locations, ([locatie, years]) => {
            const all = Array.from(years, ([jaar, groups]) =>
                Array.from(groups, ([k, value]) => ({
                    jaar: Number(jaar),
                    [key]: Number(k),
                    value
                }))

            ).flat();

            all.sort(
                (a, b) =>
                    a.jaar - b.jaar ||
                    a[key] - b[key]
            );

            // cumulative averages per year
            const byYear = d3.group(all, d => d.jaar);
            const result = [];

            for (const [jaar, values] of byYear) {
                let sum = 0;
                values
                    .sort((a, b) => a[key] - b[key])
                    .forEach((d, i) => {
                        sum += d.value;
                        const cumAvg = sum / (i + 1);
                        result.push({
                            ...d,
                            cumAvg
                        });
                    });
            }

            // dynamische baseline
            const base = result.filter(
                d => d.jaar === baseYear
            );

            return {
                code,
                locatie,
                basisJaar: baseYear,
                data: result.map(d => {

                    const ref = base.find(
                        r => r[key] === d[key]
                    );
                    const pctChange =
                        ref && ref.cumAvg !== 0
                            ? ((d.cumAvg - ref.cumAvg) / ref.cumAvg) * 100
                            : null;
                    return {

                        jaar: d.jaar,
                        [key]: d[key],
                        value: pctChange
                    };
                })
            };
        })

    ).flat();
}


async function buildComplete(key) {

    const data = await processData();

    const years = [
        ...new Set(data.map(d => d.jaar))
    ].sort((a, b) => a - b);

    // rollups
    const rollupPerLocation =
        makeRollup(data, key, true);

    const rollupGlobal =
        makeRollup(data, key, false);


    // normal
    const normalPerLocation =
        buildNormal(rollupPerLocation, key);

    const normalGlobal =
        buildNormal(rollupGlobal, key, true);


    // pct relatief tov elk jaar
    const pctPerLocation = Object.fromEntries(
        years.map(baseYear => [
            baseYear,
            calculatePctChange(
                rollupPerLocation,
                key,
                baseYear
            )
        ])
    );

    const pctGlobal = Object.fromEntries(
        years.map(baseYear => [
            baseYear,
            calculatePctChange(
                new Map([
                    [
                        "global",
                        new Map([
                            ["global", rollupGlobal]
                        ])
                    ]
                ]),
                key,
                baseYear
            )[0]
        ])
    );

    return {
        absoluut: {
            global: normalGlobal,
            perLocation: normalPerLocation
        },
        relatief: {
            global: pctGlobal,
            perLocation: pctPerLocation
        }
    };
}

export const hourlyComplete =
    () => buildComplete("hour");

export const weeklyComplete =
    () => buildComplete("day");

export const monthlyComplete =
    () => buildComplete("month");