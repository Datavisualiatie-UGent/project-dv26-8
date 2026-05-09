import * as d3 from "d3";
import { readFile } from "fs/promises";

const filePath = new URL("./agg_hour.csv", import.meta.url);


async function processData(key) {
    const text = await readFile(filePath, "utf-8");

    return d3
        .dsvFormat(";")
        .parse(text, d => {
            const t = new Date(d.hour);

            return {
                locatie: d.locatie,
                jaar: t.getFullYear(),
                month: t.getMonth(),
                day: t.getDay(),
                hour: t.getHours(),
                totaal: +d.totaal
            };
        })
        .filter(d =>
            d.locatie &&
            Number.isFinite(d.totaal) &&
            !Number.isNaN(d.jaar)
        );
}


function makeRollup(data, key, includeLocation = true) {
    if (includeLocation) {
        return d3.rollup(
            data,
            v => d3.sum(v, d => d.totaal),
            d => d.locatie,
            d => d.jaar,
            d => d[key]
        );
    }

    return d3.rollup(
        data,
        v => d3.sum(v, d => d.totaal),
        d => d.jaar,
        d => d[key]
    );
}


function buildNormal(rollup, key, isGlobal = false) {
    if (isGlobal) {
        return {
            locatie: "global",
            data: Array.from(rollup, ([jaar, groups]) =>
                Array.from(groups, ([k, value]) => ({
                    jaar,
                    [key]: k,
                    value
                }))
            ).flat()
        };
    }

    return Array.from(rollup, ([locatie, years]) => ({
        locatie,
        data: Array.from(years, ([jaar, groups]) =>
            Array.from(groups, ([k, value]) => ({
                jaar,
                [key]: k,
                value
            }))
        ).flat()
    }));
}


function calculatePctChange(rollup, key) {
    return Array.from(rollup, ([locatie, years]) => {
        const all = Array.from(years, ([jaar, groups]) =>
            Array.from(groups, ([k, value]) => ({
                jaar,
                [key]: k,
                value
            }))
        ).flat();

        // sorteren
        all.sort((a, b) =>
            a.jaar - b.jaar || a[key] - b[key]
        );

        // cumulatief gemiddelde per jaar
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

        // baseline 2020
        const base2020 = result.filter(d => d.jaar === 2020);

        return {
            locatie,
            data: result.map(d => {
                const ref = base2020.find(
                    r => r[key] === d[key]
                );

                const pctChange = ref
                    ? ((d.cumAvg - ref.cumAvg) / ref.cumAvg) * 100
                    : null;

                return {
                    jaar: d.jaar,
                    [key]: d[key],
                    value: pctChange
                };
            })
        };
    });
}


async function buildComplete(key) {
    const data = await processData(key);

    // rollups
    const rollupPerLocation = makeRollup(data, key, true);
    const rollupGlobal = makeRollup(data, key, false);

    // normal
    const normalPerLocation = buildNormal(rollupPerLocation, key);
    const normalGlobal = buildNormal(rollupGlobal, key, true);

    // pct
    const pctPerLocation = calculatePctChange(rollupPerLocation, key);
    const pctGlobal = calculatePctChange(
        new Map([["global", rollupGlobal]]),
        key
    )[0];

    return {
        absoluut: { //normal
            global: normalGlobal,
            perLocation: normalPerLocation
        },
        relatief: { //percentage
            global: pctGlobal,
            perLocation: pctPerLocation
        }
    };
}

export const hourlyComplete = () => buildComplete("hour");
export const weeklyComplete = () => buildComplete("day");
export const monthlyComplete = () => buildComplete("month");