import { weekdayPerLocation } from "./trendlijn.data.js";

process.stdout.write(JSON.stringify(await weekdayPerLocation()));