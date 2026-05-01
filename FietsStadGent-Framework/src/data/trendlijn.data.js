import * as d3 from "d3";
import { readFile, writeFile } from "fs/promises";

const filePath = new URL("./data_fietspalen.csv", import.meta.url);

function getTimestamp(date) {
    return new Date(date);
}

async function processData() {
    const text = await readFile(filePath, "utf-8");

    return d3
        .dsvFormat(";")
        .parse(text, d => {
            const t = new Date(d.ordening);//new Date(`${d.datum}T${d.uur5minuten}`);

            return {
                locatie: d.locatie,
                date: t,
                year: t.getFullYear(),
                month: t.getMonth(),
                day: t.getDay(),
                hour: t.getHours(),
                totaal: +d.totaal
            };
        })
        .filter(d =>
            d.locatie &&
            Number.isFinite(d.totaal) &&
            !Number.isNaN(d.date.getTime())
        );
}

export async function monthlyWithYear() {
    const data = await processData();

    const rollup = d3.rollup(
        data,
        v => d3.sum(v, d => d.totaal),
        d => d.locatie,
        d => d.year,
        d => d.month
    );

    return Array.from(rollup, ([locatie, years]) => ({
        locatie,
        months: Array.from(years, ([year, months]) =>
            Array.from(months, ([month, value]) => ({
                year,
                month,
                value
            }))
        ).flat()
    }));
}

export async function weekdayPerLocation() {
    const data = await processData();

    const rollup = d3.rollup(
        data,
        v => d3.sum(v, d => d.totaal),
        d => d.locatie,
        d => d.year,
        d => d.day
    );

    return Array.from(rollup, ([locatie, years]) => ({
        locatie,
        days: Array.from(years, ([year, days]) =>
            Array.from(days, ([day, value]) => ({
                year,
                day,
                value
            }))
        ).flat()
    }));
}

export async function hourlyPerLocation() {
    const data = await processData();

    const rollup = d3.rollup(
        data,
        v => d3.sum(v, d => d.totaal),
        d => d.locatie,
        d => d.year,
        d => d.hour
    );

    return Array.from(rollup, ([locatie, years]) => ({
        locatie,
        hours: Array.from(years, ([year, hours]) =>
            Array.from(hours, ([hour, value]) => ({
                year,
                hour,
                value
            }))
        ).flat()
    }));
}