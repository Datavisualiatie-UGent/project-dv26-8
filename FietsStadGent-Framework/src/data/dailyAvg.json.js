import { dailyAvg } from "./heatmap.data.js";

process.stdout.write(JSON.stringify(await dailyAvg()));
