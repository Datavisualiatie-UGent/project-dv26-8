import { monthlyWithYear } from "./trendlijn.data.js";

process.stdout.write(JSON.stringify(await monthlyWithYear()));