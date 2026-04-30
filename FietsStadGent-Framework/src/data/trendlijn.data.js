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
            const timestamp = new Date(d.ordening);
            return {
                locatie: d.locatie,
                date: timestamp,
                hour: timestamp.getHours(),
                hour: timestamp.getDay(),
                totaal: +d.totaal
            }
        })
        .filter(d =>
            d.locatie &&
            Number.isFinite(d.totaal) &&
            !Number.isNaN(d.date.getTime())
        );
};

export async function hourlyPerLocation() {
    const data = await processData();

    const rollup = d3.rollup(
        data,
        v => d3.sum(v, d => d.totaal),
        d => d.locatie,
        d => (d.day === 0 || d.day === 6 ? "Weekend" : "Weekday"),
        d => d.hour
    );

    return Array.from(rollup, ([locatie, months]) => ({
        locatie,
        months: Array.from(months, ([month, hour, value]) => [month, hour, value])
    }));
}