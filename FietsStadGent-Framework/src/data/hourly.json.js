import { hourlyComplete } from "./trend.data.js";

process.stdout.write(JSON.stringify(await hourlyComplete()));