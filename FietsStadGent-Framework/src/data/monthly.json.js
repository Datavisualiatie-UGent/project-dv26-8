import { monthlyComplete } from "./trend.data.js";

process.stdout.write(JSON.stringify(await monthlyComplete()));