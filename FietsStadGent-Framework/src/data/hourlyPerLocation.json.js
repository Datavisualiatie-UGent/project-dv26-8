import { hourlyPerLocation } from "./trendlijn.data.js";

process.stdout.write(JSON.stringify(await hourlyPerLocation()));