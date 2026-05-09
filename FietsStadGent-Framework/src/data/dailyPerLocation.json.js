import { dailyPerLocation } from "./heatmap.data.js";

process.stdout.write(JSON.stringify(await dailyPerLocation()));
