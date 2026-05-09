import { weeklyComplete } from "./trend.data.js";

process.stdout.write(JSON.stringify(await weeklyComplete()));